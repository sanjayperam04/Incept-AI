import { useState } from 'react'
import LandingPage from './components/LandingPage'
import PlannerApp from './components/PlannerApp'
import ProjectDashboard from './components/ProjectDashboard'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'dashboard', 'planner'
  const [editingProject, setEditingProject] = useState(null)

  const handleEditProject = (project) => {
    setEditingProject(project)
    setCurrentView('planner')
  }

  const handleBackFromPlanner = () => {
    setEditingProject(null)
    setCurrentView('dashboard')
  }

  if (currentView === 'planner') {
    return <PlannerApp 
      onBack={handleBackFromPlanner} 
      onShowDashboard={handleBackFromPlanner}
      editingProject={editingProject}
    />
  }

  if (currentView === 'dashboard') {
    return <ProjectDashboard 
      onCreateNew={() => {
        setEditingProject(null)
        setCurrentView('planner')
      }}
      onEditProject={handleEditProject}
    />
  }

  return <LandingPage onGetStarted={() => setCurrentView('planner')} />
}

export default App
