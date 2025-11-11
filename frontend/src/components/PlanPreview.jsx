import { useState, useEffect } from 'react'
import { Edit2, Check, X, BarChart3, Calendar, Clock, User, Save } from 'lucide-react'

export default function PlanPreview({ plan, onEdit, onGenerateTimeline, onSaveProject, isSaved }) {
  const [editingTask, setEditingTask] = useState(null)
  const [editedPlan, setEditedPlan] = useState(plan)
  const [showUpdateBadge, setShowUpdateBadge] = useState(false)

  // Update plan when prop changes and show update badge
  useEffect(() => {
    setEditedPlan(plan)
    setShowUpdateBadge(true)
    const timer = setTimeout(() => setShowUpdateBadge(false), 2000)
    return () => clearTimeout(timer)
  }, [plan])

  const handleEditTask = (taskId) => {
    setEditingTask(taskId)
  }

  const handleSaveTask = (taskId, updates) => {
    const updatedTasks = editedPlan.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
    const updatedPlan = { ...editedPlan, tasks: updatedTasks }
    setEditedPlan(updatedPlan)
    onEdit(updatedPlan)
    setEditingTask(null)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
  }

  return (
    <>
      <style>{styles}</style>
      <div className={`flex flex-col h-full transition-all ${showUpdateBadge ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
        {/* Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0 relative">
        {showUpdateBadge && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-bounce-in">
            ✓ Updated!
          </div>
        )}
        <h3 className="font-bold text-lg text-gray-900 mb-3">{editedPlan.project_name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{editedPlan.total_duration} days</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{editedPlan.tasks.length} tasks</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-custom">
        {editedPlan.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isEditing={editingTask === task.id}
            onEdit={() => handleEditTask(task.id)}
            onSave={(updates) => handleSaveTask(task.id, updates)}
            onCancel={handleCancelEdit}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-2">
        <button
          onClick={onSaveProject}
          className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 group relative ${
            isSaved 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="Save this project to your dashboard for later access"
        >
          <Save className="w-5 h-5" />
          {isSaved ? 'Saved to Dashboard' : 'Save to Dashboard'}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Save project for later access
          </span>
        </button>
        <button
          onClick={onGenerateTimeline}
          className="w-full px-4 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 hover:shadow-lg group relative animate-pulse-subtle"
          title="View Gantt chart and export as PDF"
        >
          <BarChart3 className="w-5 h-5" />
          View Gantt Chart & Export PDF
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            See timeline visualization and download report
          </span>
        </button>
      </div>
      </div>
    </>
  )
}

// Add animation styles
const styles = `
  @keyframes bounce-in {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  .animate-bounce-in {
    animation: bounce-in 0.4s ease-out;
  }
  @keyframes pulse-subtle {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
    }
  }
  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
  .scrollbar-custom::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-custom::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`

function TaskCard({ task, isEditing, onEdit, onSave, onCancel }) {
  const [editedTask, setEditedTask] = useState(task)

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-black rounded-lg p-4">
        <div className="space-y-3">
          <input
            type="text"
            value={editedTask.name}
            onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Task name"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={editedTask.duration}
              onChange={(e) => setEditedTask({ ...editedTask, duration: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Duration (days)"
              min="1"
            />
            <input
              type="text"
              value={editedTask.owner}
              onChange={(e) => setEditedTask({ ...editedTask, owner: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Owner"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSave(editedTask)}
              className="flex-1 px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
            {task.id}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">{task.name}</h4>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{task.owner}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Day {task.start_day}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{task.duration} days</span>
              </div>
            </div>
            {task.dependencies && task.dependencies.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Depends on: Task {task.dependencies.join(', ')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors group-hover:text-gray-600"
          title="Edit task details"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
