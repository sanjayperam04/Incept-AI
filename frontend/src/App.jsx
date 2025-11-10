import { useState } from 'react'
import LandingPage from './components/LandingPage'
import PlannerApp from './components/PlannerApp'
import TimelineReport from './components/TimelineReport'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing', 'planner', 'timeline'
  const [timelinePlan, setTimelinePlan] = useState(null)

  const handleShowTimeline = (plan) => {
    setTimelinePlan(plan)
    setCurrentView('timeline')
  }

  if (currentView === 'timeline' && timelinePlan) {
    return <TimelineReport plan={timelinePlan} onBack={() => setCurrentView('planner')} />
  }

  if (currentView === 'planner') {
    return <PlannerApp onBack={() => setCurrentView('landing')} onShowTimeline={handleShowTimeline} />
  }

  return <LandingPage onGetStarted={() => setCurrentView('planner')} />
}

export default App
