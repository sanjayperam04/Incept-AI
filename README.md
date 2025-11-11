# Incept AI - AI-Powered Project Planning

Transform your project ideas into actionable plans with AI-powered timeline generation, task dependencies, and resource allocation.

🚀 **[Try it live](https://inceptai.vercel.app)**

## Features

- **AI-Powered Planning**: Describe your project in natural language and get a complete plan in seconds
- **Visual Timelines**: Beautiful Gantt charts showing task dependencies and project flow
- **Smart Allocation**: Automatic task assignment and resource allocation
- **Dynamic Replanning**: Modify your plan on the fly with natural language commands
- **PDF Export**: Generate professional project timeline reports
- **Real-time Updates**: See changes reflected immediately in the plan preview

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Recharts (for Gantt charts)
- Lucide React (icons)
- jsPDF (PDF generation)

### Backend
- FastAPI (Python)
- Groq AI (Llama 3.3 70B)
- Uvicorn (ASGI server)

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Groq API Key ([Get one here](https://console.groq.com))

## Usage

1. **Open the app** at [https://inceptai.vercel.app](https://inceptai.vercel.app)
2. **Click "Try It Out Now"** to start planning
3. **Describe your project**: e.g., "Build a web app in 3 weeks with design, frontend, backend, testing, and deployment"
4. **Review the generated plan** in the right panel
5. **Make modifications**: e.g., "make the backend development for 3 days"
6. **Generate timeline report** to see the Gantt chart and export to PDF

## Example Prompts

- "Build a portfolio website in 2 weeks with design, frontend, backend, and deployment"
- "Create an e-commerce platform in 6 weeks with product catalog, cart, payment, and admin panel"
- "Develop a mobile app in 4 weeks with user auth, profiles, notifications, and analytics"

## Modification Examples

Once you have a plan, you can modify it naturally:

- "make the backend development for 3 days"
- "extend design to 5 days"
- "shorten testing to 2 days"
- "change project planning to 1 day"

## Project Structure

```
incept-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── start_server.py      # Server startup script
│   ├── test_api.py          # API testing script
│   ├── requirements.txt     # Python dependencies
│   ├── vercel.json          # Vercel deployment config
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── PlannerApp.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── PlanPreview.jsx
│   │   │   ├── ProjectDashboard.jsx
│   │   │   ├── ReportModal.jsx
│   │   │   └── TimelineReport.jsx
│   │   ├── utils/           # Utility functions
│   │   │   ├── userManager.js
│   │   │   └── userManager.test.js
│   │   ├── App.jsx
│   │   ├── TestApp.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── test.html
├── .gitignore
├── start.sh                 # Startup script
└── README.md
```

## API Endpoints

### `GET /`

Health check endpoint to verify API status.

**Response:**
```json
{
  "status": "Project Planner API is running"
}
```

### `POST /api/generate-plan`

Generate or update a project plan based on conversation history. Supports both initial plan generation and dynamic replanning through natural language modifications.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Build a web app in 3 weeks with design, frontend, backend, testing, and deployment"
    },
    {
      "role": "assistant",
      "content": "Previous plan response..."
    },
    {
      "role": "user",
      "content": "make the backend development for 3 days"
    }
  ]
}
```

**Response:**
```json
{
  "project_name": "Web Application Development",
  "total_duration": 21,
  "tasks": [
    {
      "id": 1,
      "name": "Project Planning",
      "owner": "PM",
      "start_day": 0,
      "duration": 2,
      "dependencies": []
    },
    {
      "id": 2,
      "name": "UI/UX Design",
      "owner": "Designer",
      "start_day": 2,
      "duration": 5,
      "dependencies": [1]
    },
    {
      "id": 3,
      "name": "Frontend Development",
      "owner": "Frontend Developer",
      "start_day": 7,
      "duration": 5,
      "dependencies": [2]
    },
    {
      "id": 4,
      "name": "Backend Development",
      "owner": "Backend Developer",
      "start_day": 7,
      "duration": 3,
      "dependencies": [2]
    },
    {
      "id": 5,
      "name": "Testing & QA",
      "owner": "QA Engineer",
      "start_day": 12,
      "duration": 4,
      "dependencies": [3, 4]
    },
    {
      "id": 6,
      "name": "Deployment",
      "owner": "DevOps",
      "start_day": 16,
      "duration": 2,
      "dependencies": [5]
    }
  ]
}
```

**Features:**
- Supports conversational context for plan modifications
- Validates task dependencies and timelines
- Adapts to different project types (software, marketing, research, etc.)
- Assigns appropriate owners based on project domain
- Handles parallel tasks with proper dependency management

## Task Completion Status

### Assignment: Project Planner Chat → Timeline Report

**Concept:** User chats to define project details ("I need to build a portfolio site in 2 weeks"). The system understands and generates a project plan — visualized as a Gantt chart.

**Required Tasks:**

✅ **Chat collects project info** - Implemented conversational interface that extracts goals, tasks, and duration from natural language

✅ **Store conversation in context** - Messages are persisted in localStorage and maintained throughout the session for context-aware modifications

✅ **Generate structured report** - Click "View Gantt Chart & Export PDF" generates comprehensive project plan with tasks, owners, timelines, and dependencies

✅ **Gantt/Bar chart visualization** - Interactive Gantt chart with date-based timeline, task dependencies, and workload distribution charts

✅ **Entity extraction from chat** - AI extracts project name, duration, tasks, owners, dependencies, and timelines from conversational input

✅ **Structured report generation** - Produces detailed PDF reports with executive summary, task breakdown, Gantt charts, resource allocation, and risk assessment

✅ **Charting library usage** - Recharts for interactive visualizations, jsPDF for professional PDF generation with multi-page layouts

✅ **Prompt engineering for planning logic** - Advanced system prompts with reasoning process, validation rules, and adaptive task generation based on project type

**Outcome:** LLM successfully converts natural language conversation into structured, actionable project plans with visual timelines.

## Key Novelties

### 1. Intelligent Conversational Replanning
Unlike traditional project management tools that require manual editing, Incept AI allows users to modify plans through natural language. The system detects intent (addition, removal, modification, restructuring) and applies changes contextually while maintaining task dependencies and timeline coherence.

### 2. Context-Aware Duration Validation
The system intelligently prompts users when timeline information is missing from their initial request, ensuring complete project specifications before generation. It analyzes input patterns to detect duration mentions and guides users through the planning process.

### 3. Multi-Domain Project Adaptation
The AI automatically adapts task names, owner roles, and workflows based on project type detection (software, marketing, research, events). This eliminates the need for templates and provides domain-specific planning intelligence.

### 4. Comprehensive PDF Report Generation
Professional multi-page PDF reports with executive summaries, Gantt charts, task breakdowns, resource allocation, risk assessment, and team workload distribution. The reports include visual timelines, dependency tracking, and milestone identification.

### 5. Real-Time Change Tracking & Visualization
When users modify plans, the system provides detailed change summaries showing exactly what was added, removed, or modified with before/after comparisons. Visual indicators highlight updates in the plan preview with animated feedback.

## Environment Variables

### Backend (.env)

```
GROQ_API_KEY=your_groq_api_key_here
```