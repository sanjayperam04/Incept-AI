import { useState, useEffect } from 'react'
import ChatInterface from './ChatInterface'
import PlanPreview from './PlanPreview'
import TimelineReport from './TimelineReport'
import { BarChart3, ArrowLeft } from 'lucide-react'

export default function PlannerApp({ onBack, onShowDashboard, editingProject }) {
  const [messages, setMessages] = useState(() => {
    if (editingProject) {
      return [
        { role: 'assistant', content: 'Describe your project — goals, timeline, and what needs to be done.' },
        { role: 'assistant', content: `Loaded project: **${editingProject.plan.project_name}**\n\nYou can now make changes by describing what you'd like to modify. For example:\n• "make backend development 3 days"\n• "add a testing phase"\n• "change the timeline to 2 weeks"` }
      ]
    }
    const saved = localStorage.getItem('inceptai_messages')
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'Describe your project — goals, timeline, and what needs to be done.' }
    ]
  })
  const [projectPlan, setProjectPlan] = useState(() => {
    if (editingProject) {
      return editingProject.plan
    }
    const saved = localStorage.getItem('inceptai_project_plan')
    return saved ? JSON.parse(saved) : null
  })
  const [showPreview, setShowPreview] = useState(editingProject ? true : false)
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState(editingProject?.id || null)
  const [isSaved, setIsSaved] = useState(editingProject ? true : false)

  useEffect(() => {
    localStorage.setItem('inceptai_messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (projectPlan) {
      localStorage.setItem('inceptai_project_plan', JSON.stringify(projectPlan))
    }
  }, [projectPlan])

  const handleSendMessage = async (content) => {
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)

    // Check if this is a modification request (dynamic replanning)
    const isModification = projectPlan && (
      content.toLowerCase().includes('change') ||
      content.toLowerCase().includes('make it') ||
      content.toLowerCase().includes('instead') ||
      content.toLowerCase().includes('shorten') ||
      content.toLowerCase().includes('extend') ||
      content.toLowerCase().includes('add') ||
      content.toLowerCase().includes('remove')
    )

    // Auto-generate or update plan
    setIsGenerating(true)
    
    if (isModification) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '🔄 Updating your project plan...' 
      }])
    } else {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Analyzing your project requirements...' 
      }])
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }
      
      const plan = await response.json()
      const oldDuration = projectPlan?.total_duration
      const oldTasks = projectPlan?.tasks || []
      
      // Update plan preview immediately
      setProjectPlan(plan)
      setShowPreview(true)
      
      // Mark as unsaved when plan changes
      if (isModification) {
        setIsSaved(false)
      }
      
      if (isModification && oldDuration) {
        // Show detailed changes
        const newTasks = plan.tasks
        
        let changesSummary = `✅ **Your requested changes have been applied!**\n\n`
        
        // Timeline change
        if (plan.total_duration !== oldDuration) {
          const change = plan.total_duration - oldDuration
          const changeText = change > 0 ? `extended by ${change} days` : `compressed by ${Math.abs(change)} days`
          changesSummary += `📅 **Timeline ${changeText}:** ${oldDuration} → ${plan.total_duration} days\n\n`
        }
        
        // Task changes - improved matching algorithm
        const changedTasks = []
        const addedTasks = []
        const removedTasks = []
        
        // Find modified tasks with better matching
        newTasks.forEach(newTask => {
          // Try to find matching old task by name similarity
          const oldTask = oldTasks.find(t => {
            const oldWords = t.name.toLowerCase().split(' ')
            const newWords = newTask.name.toLowerCase().split(' ')
            // Check if they share at least 2 words or one key word
            return oldWords.some(word => newWords.includes(word) && word.length > 3)
          })
          
          if (oldTask) {
            if (oldTask.duration !== newTask.duration) {
              changedTasks.push({ 
                name: newTask.name, 
                oldDuration: oldTask.duration, 
                newDuration: newTask.duration,
                change: newTask.duration - oldTask.duration
              })
            }
          } else {
            addedTasks.push(newTask.name)
          }
        })
        
        // Find removed tasks
        oldTasks.forEach(oldTask => {
          const stillExists = newTasks.find(t => {
            const oldWords = oldTask.name.toLowerCase().split(' ')
            const newWords = t.name.toLowerCase().split(' ')
            return oldWords.some(word => newWords.includes(word) && word.length > 3)
          })
          if (!stillExists) {
            removedTasks.push(oldTask.name)
          }
        })
        
        // Display changes
        if (changedTasks.length > 0) {
          changesSummary += `📝 **Task Duration Updates:**\n`
          changedTasks.forEach(task => {
            const emoji = task.change > 0 ? '⏫' : '⏬'
            const changeText = task.change > 0 ? `+${task.change}d` : `${task.change}d`
            changesSummary += `${emoji} ${task.name}: ${task.oldDuration}d → ${task.newDuration}d (${changeText})\n`
          })
          changesSummary += `\n`
        }
        
        if (addedTasks.length > 0) {
          changesSummary += `✨ **Added Tasks:**\n`
          addedTasks.forEach(task => {
            changesSummary += `• ${task}\n`
          })
          changesSummary += `\n`
        }
        
        if (removedTasks.length > 0) {
          changesSummary += `🗑️ **Removed Tasks:**\n`
          removedTasks.forEach(task => {
            changesSummary += `• ${task}\n`
          })
          changesSummary += `\n`
        }
        
        if (changedTasks.length === 0 && addedTasks.length === 0 && removedTasks.length === 0) {
          changesSummary += `📝 **Plan structure adjusted based on your request**\n\n`
        }
        
        changesSummary += `View the updated timeline in the Plan Preview panel. →`
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: changesSummary
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ I've created a plan for **${plan.project_name}**!\n\n📊 **Summary:**\n• Duration: ${plan.total_duration} days\n• Tasks: ${plan.tasks.length}\n• Team: ${[...new Set(plan.tasks.map(t => t.owner))].join(', ')}\n\n**What's next?**\n👉 Click **"📊 View Gantt Chart & Export PDF"** on the right to see your timeline visualization\n💾 Or click **"Save to Dashboard"** to access this project later\n✏️ You can also modify the plan by chatting with me (e.g., "make backend development 5 days")` 
        }])
      }
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I need more details to create a plan. Please describe:\n• Project goal\n• Timeline (e.g., "2 weeks")\n• Key tasks needed` 
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveProject = () => {
    if (!projectPlan) return

    const allProjects = JSON.parse(localStorage.getItem('inceptai_all_projects') || '[]')
    
    if (currentProjectId) {
      // Update existing project
      const projectIndex = allProjects.findIndex(p => p.id === currentProjectId)
      if (projectIndex !== -1) {
        allProjects[projectIndex].plan = projectPlan
        allProjects[projectIndex].updatedAt = new Date().toISOString()
      }
    } else {
      // Create new project
      const newProject = {
        id: Date.now(),
        plan: projectPlan,
        createdAt: new Date().toISOString()
      }
      allProjects.push(newProject)
      setCurrentProjectId(newProject.id)
    }
    
    localStorage.setItem('inceptai_all_projects', JSON.stringify(allProjects))
    setIsSaved(true)
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '✅ Project saved successfully! You can now view it in the Dashboard or continue making changes.' 
    }])
  }

  const handleGenerateTimeline = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleEditPlan = (updatedPlan) => {
    setProjectPlan(updatedPlan)
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Plan updated! Click "Generate Timeline Report" to see the changes in the Gantt chart.' 
    }])
  }



  const handleNewProject = () => {
    if (confirm('Start a new project? Current progress will be cleared.')) {
      setMessages([{ role: 'assistant', content: 'Describe your project — goals, timeline, and what needs to be done.' }])
      setProjectPlan(null)
      setShowPreview(false)
      setShowModal(false)
      localStorage.removeItem('inceptai_messages')
      localStorage.removeItem('inceptai_project_plan')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Incept AI</h1>
                  <p className="text-xs text-gray-500">Project Planner</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onShowDashboard}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-md rounded-lg transition-all flex items-center gap-2"
                title="View all saved projects"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 hover:shadow-lg rounded-lg transition-all"
                title="Start a new project from scratch"
              >
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 max-w-7xl" style={{ minHeight: 'calc(100vh - 73px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 145px)' }}>
          {/* Chat Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b border-gray-200 px-6 py-3 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Project Chat</h2>
              <p className="text-sm text-gray-500 mt-1">Describe your project naturally</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface 
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="border-b border-gray-200 px-6 py-3 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Plan Preview</h2>
              <p className="text-sm text-gray-500 mt-1">Review and edit your project plan</p>
            </div>
            <div className="flex-1 overflow-hidden">
              {showPreview && projectPlan ? (
                <PlanPreview 
                  plan={projectPlan}
                  onEdit={handleEditPlan}
                  onGenerateTimeline={handleGenerateTimeline}
                  onSaveProject={handleSaveProject}
                  isSaved={isSaved}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center text-gray-500">
                  <div>
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">Your project plan will appear here</p>
                    <p className="text-sm mt-2 mb-4">Start by describing your project in the chat 👈</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left max-w-sm mx-auto">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Example:</p>
                      <p className="text-xs text-gray-600 italic">"Build a portfolio website in 2 weeks with design, frontend, backend, and deployment"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showModal && projectPlan && (
        <TimelineReport 
          plan={projectPlan}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
