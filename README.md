# Incept AI - AI-Powered Project Planning

Transform your project ideas into actionable plans with AI-powered timeline generation, task dependencies, and resource allocation.

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

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd incept-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your Groq API key to .env
# GROQ_API_KEY=your_api_key_here
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python start_server.py
```

Backend will run on `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

1. **Open the app** at `http://localhost:5173`
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
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── venv/               # Virtual environment (not in git)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── PlannerApp.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── PlanPreview.jsx
│   │   │   └── ReportModal.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## API Endpoints

### `POST /api/generate-plan`

Generate or update a project plan based on conversation history.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Build a web app in 3 weeks..."
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
    }
  ]
}
```

## Environment Variables

### Backend (.env)

```
GROQ_API_KEY=your_groq_api_key_here
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Powered by [Groq](https://groq.com) and Llama 3.3 70B
- Built with React, FastAPI, and modern web technologies
