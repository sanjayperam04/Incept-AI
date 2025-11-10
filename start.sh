#!/bin/bash

echo "🚀 Starting Project Planner..."

# Check if GROQ_API_KEY is set
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ Error: GROQ_API_KEY environment variable not set"
    echo "Get your API key from: https://console.groq.com"
    echo "Then run: export GROQ_API_KEY=your_key_here"
    exit 1
fi

# Start backend
echo "📦 Starting backend..."
cd backend
pip install -r requirements.txt > /dev/null 2>&1
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Project Planner is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
