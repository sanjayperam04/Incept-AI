import { useState } from 'react'
import LandingPage from './components/LandingPage'
import PlannerApp from './components/PlannerApp'

function App() {
  const [showPlanner, setShowPlanner] = useState(false)

  if (showPlanner) {
    return <PlannerApp onBack={() => setShowPlanner(false)} />
  }

  return <LandingPage onGetStarted={() => setShowPlanner(true)} />
}

export default App
