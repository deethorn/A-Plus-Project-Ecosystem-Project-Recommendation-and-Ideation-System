import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getProjectById } from '../services/projectService'
import { getProjectTasks, createTask, toggleTask, deleteTask, updateTask } from '../services/taskService'

export default function TaskManager() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
  })

  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const isOwner = project?.owner?._id?.toString() === user?.id?.toString() ||
    project?.owner?._id?.toString() === user?._id?.toString()

  const isCompleted = project?.status === 'completed'

  const todoTasks = tasks.filter(t => t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchData = async () => {
      try {
        const [projData, taskData] = await Promise.all([
          getProjectById(id),
          getProjectTasks(id),
        ])
        setProject(projData.project)
        setTasks(taskData.tasks)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tasks.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const data = await createTask({
        title: form.title,
        description: form.description,
        projectId: id,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      })
      setTasks(prev => [data.task, ...prev])
      setForm({ title: '', description: '', assignedTo: '', dueDate: '' })
      setShowForm(false)
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to create task.'
      )
    } finally {
      setFormLoading(false)
    }
  }

  const handleOpenEdit = (task) => {
    setEditingTask(task)
    setEditError('')
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError('')
    try {
      const data = await updateTask(editingTask._id, {
        title: editForm.title,
        description: editForm.description,
        assignedTo: editForm.assignedTo || null,
        dueDate: editForm.dueDate || null,
      })
      setTasks(prev => prev.map(t => t._id === editingTask._id ? data.task : t))
      setEditingTask(null)
    } catch (err) {
      setEditError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to update task.'
      )
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggle = async (taskId) => {
    try {
      const data = await toggleTask(taskId)
      setTasks(prev => prev.map(t => t._id === taskId ? data.task : t))
    } catch (err) {
      alert('Failed to update task.')
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t._id !== taskId))
    } catch (err) {
      alert('Failed to delete task.')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
        {error}
      </div>
    )
  }

  // ── Block team members (non-owners) from viewing tasks on completed projects
  if (isCompleted && !isOwner) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
        >
          ← Back to Project
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Project Completed</h2>
          <p className="text-sm text-gray-400">
            Tasks are locked because this project has been marked as completed.
            The project owner can reactivate the project to restore access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
      >
        ← Back to Project
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          <p className="text-gray-500 mt-1">{project?.title}</p>
        </div>
        {/* Owner cannot add tasks on completed project */}
        {isOwner && !isCompleted && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Completed lock banner for owner */}
      {isCompleted && isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          🔒 <span>This project is completed. Tasks are read-only. Reactivate the project from your dashboard to manage tasks.</span>
        </div>
      )}

      {/* Create Task Form */}
      {showForm && !isCompleted && (
        <div className="bg-white border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">New Task</h3>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                maxLength={200}
                placeholder="e.g. Build login page"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={2}
                maxLength={1000}
                placeholder="Optional task details..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {project?.teamMembers?.map((member) => (
                    <option key={member.user?._id} value={member.user?._id}>
                      {member.user?.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {formLoading ? 'Creating...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError('') }}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No tasks yet</p>
          {isOwner && !isCompleted && (
            <p className="text-sm mt-1">Click "+ Add Task" to create the first task for your team.</p>
          )}
        </div>
      )}

      {/* To Do Tasks */}
      {todoTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            To Do — {todoTasks.length}
          </h2>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                isOwner={isOwner}
                isProjectCompleted={isCompleted}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Completed — {completedTasks.length}
          </h2>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                isOwner={isOwner}
                isProjectCompleted={isCompleted}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && !isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Task</h3>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  required
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  rows={2}
                  maxLength={1000}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    name="assignedTo"
                    value={editForm.assignedTo}
                    onChange={handleEditFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {project?.teamMembers?.map((member) => (
                      <option key={member.user?._id} value={member.user?._id}>
                        {member.user?.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editForm.dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleEditFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingTask(null); setEditError('') }}
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function TaskCard({ task, isOwner, isProjectCompleted, onToggle, onDelete, onEdit }) {
  const isCompleted = task.status === 'completed'

  const getDueDateStyle = () => {
    if (!task.dueDate || isCompleted) return 'text-gray-400'
    const now = new Date()
    const due = new Date(task.dueDate)
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return 'text-red-500 font-medium'
    if (daysLeft <= 2) return 'text-orange-500 font-medium'
    if (daysLeft <= 7) return 'text-yellow-600'
    return 'text-gray-400'
  }

  const getDueDateLabel = () => {
    if (!task.dueDate) return null
    const now = new Date()
    const due = new Date(task.dueDate)
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return `📅 Overdue · ${due.toLocaleDateString()}`
    if (daysLeft === 0) return `📅 Due today`
    if (daysLeft === 1) return `📅 Due tomorrow`
    if (daysLeft <= 7) return `📅 Due in ${daysLeft} days`
    return `📅 ${due.toLocaleDateString()}`
  }

  return (
    <div className={`bg-white border rounded-xl p-4 transition ${
      isCompleted ? 'border-gray-100 opacity-60' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">

        {/* Checkbox — disabled when project is completed */}
        <button
          onClick={() => !isProjectCompleted && onToggle(task._id)}
          disabled={isProjectCompleted}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : isProjectCompleted
              ? 'border-gray-200 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {isCompleted && <span className="text-xs">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
          }`}>
            {task.title}
          </p>

          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {task.assignedTo && (
              <span className="text-xs text-blue-600">👤 {task.assignedTo.name}</span>
            )}
            {task.dueDate && (
              <span className={`text-xs ${getDueDateStyle()}`}>
                {getDueDateLabel()}
              </span>
            )}
            {isCompleted && task.completedAt && (
              <span className="text-xs text-green-500">
                ✅ Completed {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Owner actions — hidden when project is completed */}
        {isOwner && !isProjectCompleted && (
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => onEdit(task)}
              className="text-xs text-gray-400 hover:text-blue-500 transition px-1"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="text-gray-300 hover:text-red-400 text-lg transition"
              title="Delete task"
            >
              ×
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
