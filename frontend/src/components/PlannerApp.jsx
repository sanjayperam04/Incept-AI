import { useState, useEffect } from 'react'
import ChatInterface from './ChatInterface'
import PlanPreview from './PlanPreview'
import TimelineReport from './TimelineReport'
import { BarChart3, ArrowLeft } from 'lucide-react'
import { getUserItem, setUserItem, removeUserItem } from '../utils/userManager'

export default function PlannerApp({ onBack, onShowDashboard, editingProject }) {
  const [messages, setMessages] = useState(() => {
    if (editingProject) {
      return [
        { role: 'assistant', content: 'Describe your project — goals, timeline, and what needs to be done.' },
        { role: 'assistant', content: `Loaded project: **${editingProject.plan.project_name}**\n\nYou can now make changes by describing what you'd like to modify. For example:\n• "make backend development 3 days"\n• "add a testing phase"\n• "change the timeline to 2 weeks"` }
      ]
    }
    const saved = getUserItem('messages')
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'Hi! I\'m Incept AI 👋\n\nTell me what you want to build and your timeline, and I\'ll create a project plan for you.\n\n**Example:** "Build a portfolio website in 2 weeks"' }
    ]
  })
  const [projectPlan, setProjectPlan] = useState(() => {
    if (editingProject) {
      return editingProject.plan
    }
    const saved = getUserItem('project_plan')
    return saved ? JSON.parse(saved) : null
  })
  const [showPreview, setShowPreview] = useState(editingProject ? true : false)
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState(editingProject?.id || null)
  const [isSaved, setIsSaved] = useState(editingProject ? true : false)

  useEffect(() => {
    setUserItem('messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (projectPlan) {
      setUserItem('project_plan', JSON.stringify(projectPlan))
    }
  }, [projectPlan])

  const handleSendMessage = async (content) => {
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)

    const lowerContent = content.toLowerCase()

    // Check if this is a new project request (not a modification)
    const isNewProject = !projectPlan && messages.length <= 2

    // Detect if user mentioned a timeline/duration
    const hasDuration = 
      /\d+\s*(day|days|week|weeks|month|months|year|years)/i.test(content) ||
      /in\s+\d+/i.test(content) ||
      lowerContent.includes('timeline') ||
      lowerContent.includes('duration') ||
      lowerContent.includes('deadline')

    // If it's a new project and no duration mentioned, ask for it
    if (isNewProject && !hasDuration) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Got it!** You want to create: "${content}"\n\n**How much time do you have for this project?**\n\nPlease specify a timeline, for example:\n• "2 weeks"\n• "30 days"\n• "3 months"\n• "in 45 days"`
      }])
      return
    }

    // Detect specific intent from user input
    const isRemoval = projectPlan && (
      lowerContent.includes('remove') ||
      lowerContent.includes('delete') ||
      lowerContent.includes('dont need') ||
      lowerContent.includes("don't need") ||
      lowerContent.includes('dont require') ||
      lowerContent.includes("don't require") ||
      lowerContent.includes('dont want') ||
      lowerContent.includes("don't want") ||
      lowerContent.includes('skip') ||
      lowerContent.includes('exclude')
    )

    const isAddition = projectPlan && !isRemoval && (
      lowerContent.includes('add') ||
      lowerContent.includes('include') ||
      lowerContent.includes('insert') ||
      (lowerContent.includes('need') && lowerContent.includes('also')) ||
      (lowerContent.includes('want') && lowerContent.includes('also'))
    )

    const isRestructure = projectPlan && !isRemoval && !isAddition && (
      lowerContent.includes('divide') ||
      lowerContent.includes('split') ||
      lowerContent.includes('break') ||
      lowerContent.includes('tasks in total') ||
      (lowerContent.includes('only') && lowerContent.includes('tasks')) ||
      (lowerContent.includes('just') && lowerContent.includes('tasks'))
    )

    const isModification = projectPlan && !isRemoval && !isAddition && !isRestructure && (
      lowerContent.includes('change') ||
      lowerContent.includes('make') ||
      lowerContent.includes('update') ||
      lowerContent.includes('modify') ||
      lowerContent.includes('instead') ||
      lowerContent.includes('shorten') ||
      lowerContent.includes('extend') ||
      lowerContent.includes('reduce') ||
      lowerContent.includes('increase') ||
      lowerContent.includes('adjust')
    )

    // Auto-generate or update plan
    setIsGenerating(true)
    
    // Generate contextual acknowledgment based on intent
    let acknowledgment = ''
    
    if (isRemoval) {
      acknowledgment = `**Understood.** Removing the requested items from your timeline.\n\n"${content}"\n\nRegenerating your plan...`
    } else if (isAddition) {
      acknowledgment = `**Acknowledged.** Adding the requested items to your project.\n\n"${content}"\n\nUpdating your timeline...`
    } else if (isRestructure) {
      acknowledgment = `**Confirmed.** Restructuring your project as requested.\n\n"${content}"\n\nReorganizing the tasks...`
    } else if (isModification) {
      acknowledgment = `**Noted.** Modifying your existing timeline.\n\n"${content}"\n\nApplying the changes...`
    } else {
      // New project creation - detect project type
      const projectType = lowerContent.includes('website') ? 'website' :
                         lowerContent.includes('app') || lowerContent.includes('mobile') ? 'app' :
                         lowerContent.includes('marketing') || lowerContent.includes('campaign') ? 'marketing campaign' :
                         lowerContent.includes('research') ? 'research project' :
                         lowerContent.includes('event') || lowerContent.includes('conference') ? 'event' :
                         'project'
      
      acknowledgment = `**Received.** Creating a comprehensive plan for your ${projectType}.\n\nAnalyzing requirements and building your timeline...`
    }
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: acknowledgment
    }])

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
        
        let changesSummary = `**Your requested changes have been applied.**\n\n`
        
        // Timeline change
        if (plan.total_duration !== oldDuration) {
          const change = plan.total_duration - oldDuration
          const changeText = change > 0 ? `extended by ${change} days` : `compressed by ${Math.abs(change)} days`
          changesSummary += `**Timeline ${changeText}:** ${oldDuration} → ${plan.total_duration} days\n\n`
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
          changesSummary += `**Task Duration Updates:**\n`
          changedTasks.forEach(task => {
            const changeText = task.change > 0 ? `+${task.change}d` : `${task.change}d`
            const indicator = task.change > 0 ? '[INCREASED]' : '[DECREASED]'
            changesSummary += `${indicator} ${task.name}: ${task.oldDuration}d → ${task.newDuration}d (${changeText})\n`
          })
          changesSummary += `\n`
        }
        
        if (addedTasks.length > 0) {
          changesSummary += `**Added Tasks:**\n`
          addedTasks.forEach(task => {
            changesSummary += `• ${task}\n`
          })
          changesSummary += `\n`
        }
        
        if (removedTasks.length > 0) {
          changesSummary += `**Removed Tasks:**\n`
          removedTasks.forEach(task => {
            changesSummary += `• ${task}\n`
          })
          changesSummary += `\n`
        }
        
        if (changedTasks.length === 0 && addedTasks.length === 0 && removedTasks.length === 0) {
          changesSummary += `**Plan structure adjusted based on your request.**\n\n`
        }
        
        changesSummary += `View the updated timeline in the Plan Preview panel. →`
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: changesSummary
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**Plan created for ${plan.project_name}.**\n\n**Summary:**\n• Duration: ${plan.total_duration} days\n• Tasks: ${plan.tasks.length}\n• Team: ${[...new Set(plan.tasks.map(t => t.owner))].join(', ')}\n\n**Next Steps:**\n• Click "View Gantt Chart & Export PDF" on the right to see your timeline visualization\n• Click "Save to Dashboard" to access this project later\n• You can modify the plan by chatting with me (e.g., "make backend development 5 days")` 
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

    const allProjects = JSON.parse(getUserItem('all_projects') || '[]')
    
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
    
    setUserItem('all_projects', JSON.stringify(allProjects))
    setIsSaved(true)
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Project saved successfully. You can now view it in the Dashboard or continue making changes.' 
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
      removeUserItem('messages')
      removeUserItem('project_plan')
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-md rounded-lg transition-all flex items-center gap-2 group relative"
                title="View all saved projects"
              >
                <BarChart3 className="w-4 h-4" />
                My Projects
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  View all your saved projects
                </span>
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
