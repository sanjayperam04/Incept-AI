import { ArrowLeft, Download, Printer, Calendar, User, Clock, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'

export default function TimelineReport({ plan, onClose }) {
  if (!plan || !plan.tasks) {
    return null
  }

  const chartData = plan.tasks.map(task => ({
    name: task.name,
    fullName: task.name,
    start: task.start_day,
    duration: task.duration,
    end: task.start_day + task.duration
  }))

  // Calculate task duration by owner for the bar chart
  const ownerDurationData = [...new Set(plan.tasks.map(t => t.owner))].map(owner => {
    const ownerTasks = plan.tasks.filter(t => t.owner === owner)
    const totalDuration = ownerTasks.reduce((sum, t) => sum + t.duration, 0)
    const taskCount = ownerTasks.length
    return {
      owner,
      duration: totalDuration,
      taskCount
    }
  }).sort((a, b) => b.duration - a.duration) // Sort by duration descending

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let yPos = margin

      const checkNewPage = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage()
          yPos = margin
          pdf.setFontSize(8)
          pdf.setTextColor(150, 150, 150)
          pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
          pdf.setTextColor(0, 0, 0)
          return true
        }
        return false
      }

      // Header
      pdf.setFillColor(0, 0, 0)
      pdf.rect(0, 0, pageWidth, 50, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROJECT TIMELINE REPORT', margin, 25)
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text('AI-Generated Project Plan', margin, 38)
      
      yPos = 60

      // Project Overview
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROJECT OVERVIEW', margin, yPos)
      yPos += 10

      pdf.setFillColor(250, 250, 250)
      pdf.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'F')
      pdf.setDrawColor(220, 220, 220)
      pdf.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'S')
      
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Project Name:', margin + 5, yPos + 8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(plan.project_name, margin + 40, yPos + 8)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('Total Duration:', margin + 5, yPos + 16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${plan.total_duration} days`, margin + 40, yPos + 16)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('Date Generated:', margin + 5, yPos + 24)
      pdf.setFont('helvetica', 'normal')
      const generatedDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      pdf.text(generatedDate, margin + 40, yPos + 24)
      
      yPos += 45

      // Task Breakdown
      checkNewPage(40)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TASK BREAKDOWN', margin, yPos)
      yPos += 10

      plan.tasks.forEach((task, index) => {
        checkNewPage(35)
        
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.rect(margin, yPos, contentWidth, 30)
        
        pdf.setFillColor(0, 0, 0)
        pdf.circle(margin + 5, yPos + 8, 4, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(task.id.toString(), margin + 3.5, yPos + 9.5)
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text(task.name, margin + 12, yPos + 9)
        
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        
        const detailsY = yPos + 18
        pdf.text(`Owner: ${task.owner}`, margin + 5, detailsY)
        pdf.text(`Start: Day ${task.start_day}`, margin + 60, detailsY)
        pdf.text(`Duration: ${task.duration} days`, margin + 100, detailsY)
        
        if (task.dependencies && task.dependencies.length > 0) {
          pdf.text(`Dependencies: Task ${task.dependencies.join(', ')}`, margin + 5, detailsY + 6)
        }
        
        yPos += 35
      })

      // Footer
      const totalPages = pdf.internal.getNumberOfPages()
      const footerY = pageHeight - 12
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.5)
        pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3)
        
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(120, 120, 120)
        
        pdf.text('Generated by Incept AI Project Planner', margin, footerY)
        
        const centerText = plan.project_name.length > 40 
          ? plan.project_name.substring(0, 40) + '...' 
          : plan.project_name
        pdf.text(centerText, pageWidth / 2, footerY, { align: 'center' })
        
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' })
      }

      const fileName = `${plan.project_name.replace(/\s+/g, '_')}_Project_Plan.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 print:border-b-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{plan.project_name}</h1>
              <p className="text-xs text-gray-500">Project Timeline Dashboard</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button 
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
        {/* Executive Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Executive Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Total Tasks</p>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{plan.tasks.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active project tasks</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Project Duration</p>
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{plan.total_duration}</p>
                <p className="text-base text-gray-500 font-medium">days</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Estimated timeline</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-600">Team Members</p>
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {[...new Set(plan.tasks.map(t => t.owner))].length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Assigned resources</p>
            </div>
          </div>
        </div>

        {/* Project Timeline Gantt Chart */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Project Timeline Gantt Chart
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <ResponsiveContainer width="100%" height={Math.max(450, plan.tasks.length * 60)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 15, right: 30, left: 5, bottom: 20 }}
                barCategoryGap="12%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis 
                  type="number" 
                  label={{ value: 'Days', position: 'insideBottom', offset: -10, style: { fontWeight: '600', fill: '#374151', fontSize: 12 } }}
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={220}
                  stroke="#9ca3af"
                  tick={{ fill: '#374151', fontSize: 11, fontWeight: '500' }}
                  interval={0}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-gray-900">
                          <p className="font-bold text-gray-900 mb-2 text-sm">{payload[0].payload.fullName}</p>
                          <p className="text-xs text-gray-600 mb-1">
                            Days {payload[0].payload.start} - {payload[0].payload.end}
                          </p>
                          <p className="text-xs text-gray-900 font-semibold">
                            Duration: {payload[0].payload.duration} days
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '25px' }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="start" 
                  stackId="a" 
                  fill="#f3f4f6" 
                  name="Start Offset"
                />
                <Bar 
                  dataKey="duration" 
                  stackId="a" 
                  fill="#000000" 
                  name="Task Duration"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Duration by Owner */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Workload Distribution by Team Member
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={ownerDurationData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="owner" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#9ca3af"
                  tick={{ fill: '#374151', fontSize: 11, fontWeight: '500' }}
                />
                <YAxis 
                  label={{ value: 'Total Days', angle: -90, position: 'insideLeft', style: { fontWeight: '600', fill: '#374151', fontSize: 12 } }}
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-gray-900">
                          <p className="font-bold text-gray-900 mb-2 text-sm">{payload[0].payload.owner}</p>
                          <p className="text-xs text-gray-600 mb-1">
                            Total Duration: {payload[0].payload.duration} days
                          </p>
                          <p className="text-xs text-gray-900 font-semibold">
                            Tasks Assigned: {payload[0].payload.taskCount}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="duration" 
                  fill="#000000" 
                  radius={[8, 8, 0, 0]}
                  name="Total Days"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                Shows total days allocated to each team member across all tasks
              </p>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Detailed Task Breakdown
          </h2>
          <div className="space-y-3">
            {plan.tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-5 break-inside-avoid hover:shadow-md transition-all hover:border-gray-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0">
                      {task.id}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base mb-3">{task.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 bg-white rounded-lg p-2.5 border border-gray-200">
                          <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Owner</p>
                            <p className="font-semibold text-gray-900 text-xs">{task.owner}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 bg-white rounded-lg p-2.5 border border-gray-200">
                          <div className="w-7 h-7 bg-green-50 rounded flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Start Day</p>
                            <p className="font-semibold text-gray-900 text-xs">Day {task.start_day}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 bg-white rounded-lg p-2.5 border border-gray-200">
                          <div className="w-7 h-7 bg-purple-50 rounded flex items-center justify-center flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="font-semibold text-gray-900 text-xs">{task.duration} days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="bg-black text-white px-2.5 py-1 rounded text-xs font-semibold">
                    Task {task.id}
                  </span>
                </div>

                {task.dependencies && task.dependencies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                      <span className="font-semibold text-amber-900">Dependencies:</span> <span className="text-gray-700">Task {task.dependencies.join(', Task ')}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Team Allocation */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Team Allocation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...new Set(plan.tasks.map(t => t.owner))].map(owner => {
              const ownerTasks = plan.tasks.filter(t => t.owner === owner)
              const totalDays = ownerTasks.reduce((sum, t) => sum + t.duration, 0)
              return (
                <div key={owner} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
                      {owner.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{owner}</h3>
                      <p className="text-xs text-gray-600">
                        {ownerTasks.length} task{ownerTasks.length !== 1 ? 's' : ''} • {totalDays} days total
                      </p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1.5 bg-white rounded-lg p-3 border border-gray-200">
                    {ownerTasks.map(t => (
                      <li key={t.id} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span className="flex-1">{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p className="font-medium">Generated by Incept AI Project Planner</p>
            <p className="mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
