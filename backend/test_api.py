"""
Test script for the Project Planner API
Run: python test_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test API health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_generate_plan():
    """Test project plan generation"""
    print("Testing plan generation...")
    
    messages = [
        {"role": "assistant", "content": "Hi! Tell me about your project."},
        {"role": "user", "content": "I need to build a portfolio website in 2 weeks"},
        {"role": "assistant", "content": "What features do you need?"},
        {"role": "user", "content": "I need a homepage, about page, project gallery, and contact form. It should be responsive and modern."}
    ]
    
    response = requests.post(
        f"{BASE_URL}/api/generate-plan",
        json={"messages": messages}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        plan = response.json()
        print(f"\nProject: {plan['project_name']}")
        print(f"Duration: {plan['total_duration']} days")
        print(f"\nTasks ({len(plan['tasks'])}):")
        for task in plan['tasks']:
            print(f"  - {task['name']} ({task['owner']}, {task['duration']} days)")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("=== Project Planner API Tests ===\n")
    test_health()
    test_generate_plan()
