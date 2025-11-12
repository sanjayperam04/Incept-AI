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
    allow_origins=[
    "https://inceptai.vercel.app",  # Production frontend URL
    "http://localhost:3003",         # Local frontend URL (for development)
],
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

REASONING PROCESS (think step-by-step):
1. First, identify the project type and domain (software, marketing, research, etc.)
2. Then, extract user-specified tasks OR infer logical tasks based on project description
3. Next, determine task dependencies based on natural workflow
4. After that, assign realistic durations considering task complexity
5. Finally, assign appropriate owners based on project type and task nature

IMPORTANT: 
- If the user specifies custom tasks or phases, USE THOSE EXACTLY as described
- If the user requests changes to an existing plan, adjust accordingly
- Adapt to the user's specific project type and requirements
- If no specific tasks are mentioned, infer logical tasks based on the project description

Generate a JSON response with this exact structure:
{
  "project_name": "string (clear, professional name)",
  "total_duration": number (in days),
  "tasks": [
    {
      "id": number (sequential, starting from 1),
      "name": "string (use user's exact task names if provided, otherwise create clear, actionable names)",
      "owner": "string (adapt to project type - can be any role like Marketing Manager, Researcher, Content Writer, Developer, Designer, etc.)",
      "start_day": number (0-indexed, accounting for dependencies),
      "duration": number (realistic days for this task),
      "dependencies": [array of task ids that must complete first]
    }
  ]
}

CRITICAL RULES:
1. PRIORITIZE user-specified tasks over default assumptions - if user lists specific tasks, use those
2. Break project into 5-8 logical tasks (or match user's specified number)
3. Infer task dependencies from natural workflow or user's description
4. Assign realistic durations based on task complexity
5. Use appropriate owners - adapt role names to project type (not limited to Developer/Designer/QA)
6. Create clear, professional task names that match the user's domain
7. Parallel tasks can have same start_day if they don't depend on each other

COMMON WORKFLOWS (adapt as needed):
- Software: Planning → Design → Development → Testing → Deployment
- Marketing: Research → Strategy → Content Creation → Campaign Launch → Analysis
- Research: Literature Review → Data Collection → Analysis → Writing → Review
- Product: Ideation → Prototyping → User Testing → Refinement → Launch
- Content: Planning → Writing → Editing → Design → Publishing

FLEXIBILITY:
- If user says "I need X, Y, and Z tasks", create exactly those tasks
- If user mentions specific roles, use those role names
- If user describes a unique workflow, follow that workflow
- Adapt task names to match the project domain (e.g., "SEO Optimization" for marketing, "Data Cleaning" for data science)

VALIDATION REQUIREMENTS (verify before responding):
1. Ensure all dependency IDs reference valid task IDs (must exist in the task list)
2. Verify that start_day + duration of all tasks fits within total_duration
3. Check that no task depends on itself (no circular dependencies)
4. Confirm that dependent tasks start after their dependencies complete
5. Ensure task names are clear, unique, and under 60 characters
6. Verify that total_duration is realistic for the number and complexity of tasks
7. Check that at least one task has no dependencies (project must have a starting point)

ERROR HANDLING:
- If project description is too vague, make reasonable assumptions and proceed
- If timeline seems unrealistic, adjust durations to be more practical
- If dependencies are unclear, use logical workflow order (e.g., Design before Development)

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
