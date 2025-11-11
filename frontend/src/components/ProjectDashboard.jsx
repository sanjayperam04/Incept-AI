import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, Users, BarChart3, Trash2, Edit2, Check } from 'lucide-react'
import TimelineReport from './TimelineReport'

export default function ProjectDashboard({ onCreateNew, onEditProject }) {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Load all saved projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('inceptai_all_projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  const handleProjectClick = (project, e) => {
    // Don't open modal if clicking edit or delete buttons
    if (e.target.closest('button')) return
    
    setSelectedProject(project)
    setShowModal(true)
  }

  const handleEditProject = (project, e) => {
    e.stopPropagation()
    onEditProject(project)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedProject(null)
  }

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation() // Prevent opening the modal
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId)
      setProjects(updatedProjects)
      localStorage.setItem('inceptai_all_projects', JSON.stringify(updatedProjects))
    }
  }

  const handleToggleComplete = (projectId, e) => {
    e.stopPropagation() // Prevent opening the modal
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, completed: !p.completed } : p
    )
    setProjects(updatedProjects)
    localStorage.setItem('inceptai_all_projects', JSON.stringify(updatedProjects))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Incept AI</h1>
              <p className="text-xs text-gray-500">Project Dashboard</p>
            </div>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {projects.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Create your first project plan to get started with AI-powered project management
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        ) : (
          // Projects Grid
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <p className="text-gray-600 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} saved</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={(e) => handleProjectClick(project, e)}
                  className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group relative ${
                    project.completed ? 'opacity-75' : ''
                  }`}
                >
                  {/* Project Name */}
                  <h3 className={`text-lg font-bold mb-4 ${
                    project.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {project.plan.project_name}
                  </h3>

                  {/* Project Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{project.plan.total_duration} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{project.plan.tasks.length} tasks</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{[...new Set(project.plan.tasks.map(t => t.owner))].length} team members</span>
                    </div>
                  </div>

                  {/* Created Date with Action Icons */}
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Created {new Date(project.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleEditProject(project, e)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleToggleComplete(project.id, e)}
                        className={`p-1.5 rounded transition-colors ${
                          project.completed 
                            ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={project.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-black rounded-lg transition-all pointer-events-none"></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Timeline Modal */}
      {showModal && selectedProject && (
        <TimelineReport 
          plan={selectedProject.plan}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
