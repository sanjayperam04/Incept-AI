from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from groq import Groq
import json
import re

load_dotenv()

app = FastAPI(title="Project Planner API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class Message(BaseModel):
    role: str
    content: str
    
    class Config:
        str_max_length = 2000

class ChatRequest(BaseModel):
    messages: List[Message]
    
    class Config:
        validate_assignment = True
    
    def __init__(self, **data):
        super().__init__(**data)
        if len(self.messages) > 50:
            raise ValueError("Too many messages")
        if len(self.messages) == 0:
            raise ValueError("At least one message required")

class Task(BaseModel):
    id: int
    name: str
    owner: str
    start_day: int
    duration: int
    dependencies: List[int] = []

class ProjectPlan(BaseModel):
    project_name: str
    total_duration: int
    tasks: List[Task]

@app.get("/")
def read_root():
    return {"status": "Project Planner API is running"}

@app.post("/api/generate-plan")
async def generate_plan(request: ChatRequest):
    """Generate structured project plan from chat conversation"""
    
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    
    # Validate input
    if len(request.messages) < 1:
        raise HTTPException(status_code=400, detail="At least one message required")
    
    # Check if conversation has enough context
    user_messages = [msg for msg in request.messages if msg.role == "user"]
    if len(user_messages) == 0:
        raise HTTPException(status_code=400, detail="Please describe your project first")
    
    # Build conversation context
    conversation = "\n".join([f"{msg.role}: {msg.content}" for msg in request.messages])
    
    # Extract user's main request
    user_request = " ".join([msg.content for msg in request.messages if msg.role == "user"])
    
    # Enhanced system prompt for better planning with dynamic replanning
    system_prompt = """You are an expert project planning AI. Analyze the conversation and create a comprehensive, realistic project plan.

IMPORTANT: If the user requests changes to an existing plan (e.g., "make it 1 week instead of 2", "shorten to 10 days", "add testing phase"), 
adjust the timeline and tasks accordingly while maintaining logical dependencies and realistic durations.

Generate a JSON response with this exact structure:
{
  "project_name": "string (clear, professional name)",
  "total_duration": number (in days),
  "tasks": [
    {
      "id": number (sequential, starting from 1),
      "name": "string (clear, actionable task name)",
      "owner": "string (role: Developer, Designer, QA, PM, DevOps)",
      "start_day": number (0-indexed, accounting for dependencies),
      "duration": number (realistic days for this task),
      "dependencies": [array of task ids that must complete first]
    }
  ]
}

CRITICAL RULES:
1. Break project into 5-8 logical, sequential tasks
2. Infer task dependencies from natural workflow (Design → Development → Testing → Deployment)
3. Assign realistic durations (Planning: 2-3 days, Design: 3-5 days, Development: 5-10 days, Testing: 2-5 days)
4. Ensure start_day + duration of all tasks fits within total_duration
5. Use appropriate owners based on task type
6. Create clear, professional task names
7. Parallel tasks (Frontend + Backend) can have same start_day if they don't depend on each other

TASK DEPENDENCY LOGIC:
- Planning/Requirements → Design
- Design → Development
- Development → Testing
- Testing → Deployment
- Frontend & Backend can run in parallel after Design

Return ONLY valid JSON, no markdown, no explanation, no code blocks."""

    try:
        # Call Groq API
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Conversation:\n{conversation}\n\nGenerate the project plan JSON:"}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)
        
        # Parse and validate
        plan_data = json.loads(response_text)
        project_plan = ProjectPlan(**plan_data)
        
        return project_plan
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
