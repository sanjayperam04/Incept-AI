import uvicorn
import os

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    print("🚀 Starting Project Planner Backend...")
    print(f"   API Key configured: {'✓' if os.getenv('GROQ_API_KEY') else '✗'}")
    print(f"   Server: http://0.0.0.0:8000")
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
