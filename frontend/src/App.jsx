import { useState } from 'react'
import LandingPage from './components/LandingPage'
import PlannerApp from './components/PlannerApp'
import ProjectDashboard from './components/ProjectDashboard'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'dashboard', 'planner'

  if (currentView === 'planner') {
    return <PlannerApp 
      onBack={() => setCurrentView('dashboard')} 
      onShowDashboard={() => setCurrentView('dashboard')}
    />
  }

  if (currentView === 'dashboard') {
    return <ProjectDashboard onCreateNew={() => setCurrentView('planner')} />
  }

  return <LandingPage onGetStarted={() => setCurrentView('dashboard')} />
}

export default App
