import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { getProjectById } from '../services/projectService'
import { getProjectTasks, createTask, toggleTask, deleteTask, updateTask } from '../services/taskService'

// ── Icons ──────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconLockSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconAlertCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
// ──────────────────────────────────────────────────────────────

export default function TaskManager() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '' })

  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const userId = user?.id?.toString() || user?._id?.toString()

  const isOwner = !!(userId && (
    project?.owner?._id?.toString() === userId ||
    project?.coOwners?.some(c =>
      (c?._id?.toString() || c?.toString()) === userId
    )
  ))
  const isCompleted = project?.status === 'completed'
  const todoTasks      = tasks.filter(t => t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  // ── Theme map ────────────────────────────────────────────────
  const t = {
    page:          isDark ? 'bg-black'                                               : 'bg-gray-50',
    backBtn:       isDark ? 'text-white/40 hover:text-white'                         : 'text-gray-500 hover:text-gray-900',
    sectionHdr:    isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle:  isDark ? 'text-gray-900'                                          : 'text-white',
    sectionSub:    isDark ? 'text-gray-500'                                          : 'text-white/60',
    addBtn:        isDark ? 'bg-black hover:bg-zinc-800 text-white'                  : 'bg-white hover:bg-gray-100 text-black',
    card:          isDark ? 'bg-zinc-900 border-white/10'                            : 'bg-white border-gray-200',
    cardDim:       isDark ? 'bg-zinc-900 border-white/6 opacity-55'                  : 'bg-gray-50 border-gray-100 opacity-65',
    formCard:      isDark ? 'bg-zinc-900 border-white/15'                            : 'bg-white border-gray-200',
    label:         isDark ? 'text-white/70'                                          : 'text-gray-700',
    labelSub:      isDark ? 'text-white/30'                                          : 'text-gray-400',
    input:         isDark ? 'bg-zinc-800 border-white/15 text-white placeholder-white/25 focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-500',
    select:        isDark ? 'bg-zinc-800 border-white/15 text-white focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 focus:border-gray-500',
    submitBtn:     isDark ? 'bg-white hover:bg-gray-100 text-black disabled:opacity-50' : 'bg-black hover:bg-zinc-800 text-white disabled:opacity-50',
    cancelBtn:     isDark ? 'border-white/15 text-white/50 hover:bg-white/5'         : 'border-gray-300 text-gray-600 hover:bg-gray-50',
    taskTitle:     isDark ? 'text-white'                                             : 'text-gray-800',
    taskTitleDone: isDark ? 'text-white/30 line-through'                             : 'text-gray-400 line-through',
    taskDesc:      isDark ? 'text-white/35'                                          : 'text-gray-400',
    checkboxOff:   isDark ? 'border-white/20 hover:border-white/50'                  : 'border-gray-300 hover:border-gray-500',
    checkboxLocked:isDark ? 'border-white/10 cursor-not-allowed'                     : 'border-gray-200 cursor-not-allowed',
    editBtn:       isDark ? 'text-white/30 hover:text-white/70'                      : 'text-gray-400 hover:text-gray-700',
    deleteBtn:     'text-white/20 hover:text-red-400',
    divider:       isDark ? 'border-white/8'                                         : 'border-gray-100',
    sectionLabel:  isDark ? 'text-white/35'                                          : 'text-gray-400',
    errorBg:       isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    warnBanner:    isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'  : 'bg-yellow-50 border-yellow-200 text-yellow-700',
    emptyText:     isDark ? 'text-white/30'                                          : 'text-gray-400',
    emptyTitle:    isDark ? 'text-white/50'                                          : 'text-gray-500',
    modal:         isDark ? 'bg-zinc-900 border border-white/15'                     : 'bg-white border border-gray-200',
    modalHeading:  isDark ? 'text-white'                                             : 'text-gray-900',
    shimmer:       isDark ? 'bg-white/8'                                             : 'bg-gray-200',
    shimmerSub:    isDark ? 'bg-white/5'                                             : 'bg-gray-100',
    metaText:      isDark ? 'text-white/35'                                          : 'text-gray-400',
  }
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    const fetchData = async () => {
      try {
        const [projData, taskData] = await Promise.all([getProjectById(id), getProjectTasks(id)])
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

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleEditFormChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })

  const handleCreateTask = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError('')
    try {
      const data = await createTask({
        title: form.title, description: form.description,
        projectId: id,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      })
      setTasks(prev => [data.task, ...prev])
      setForm({ title: '', description: '', assignedTo: '', dueDate: '' })
      setShowForm(false)
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create task.')
    } finally { setFormLoading(false) }
  }

  const handleOpenEdit = (task) => {
    setEditingTask(task); setEditError('')
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setEditLoading(true); setEditError('')
    try {
      const data = await updateTask(editingTask._id, {
        title: editForm.title, description: editForm.description,
        assignedTo: editForm.assignedTo || null,
        dueDate: editForm.dueDate || null,
      })
      setTasks(prev => prev.map(tk => tk._id === editingTask._id ? data.task : tk))
      setEditingTask(null)
    } catch (err) {
      setEditError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update task.')
    } finally { setEditLoading(false) }
  }

  const handleToggle = async (taskId) => {
    try {
      const data = await toggleTask(taskId)
      setTasks(prev => prev.map(tk => tk._id === taskId ? data.task : tk))
    } catch (err) { alert('Failed to update task.') }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(tk => tk._id !== taskId))
    } catch (err) { alert('Failed to delete task.') }
  }

  // ── Loading ──
  if (loading) return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`rounded-xl border p-5 animate-pulse ${t.card}`}>
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border-2 shrink-0 ${t.shimmer}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded-lg w-2/5 ${t.shimmer}`} />
                <div className={`h-3 rounded-lg w-3/5 ${t.shimmerSub}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Error ──
  if (error) return (
    <div className={`min-h-screen p-8 ${t.page}`}>
      <div className={`text-sm px-4 py-3 rounded-xl border ${t.errorBg}`}>{error}</div>
    </div>
  )

  // ── Locked for non-owner on completed project ──
  if (isCompleted && !isOwner) return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16">
        <button onClick={() => navigate(`/projects/${id}`)} className={`text-sm flex items-center gap-1.5 mb-6 transition ${t.backBtn}`}>
          <IconArrowLeft /> Back to Project
        </button>
        <div className={`rounded-xl border p-16 text-center ${t.card}`}>
          <div className={`flex justify-center mb-4 ${t.emptyText}`}><IconLock /></div>
          <h2 className={`text-lg font-semibold mb-2 ${t.emptyTitle}`}>Project Completed</h2>
          <p className={`text-sm max-w-xs mx-auto ${t.emptyText}`}>
            Tasks are locked because this project has been marked as completed.
            The project owner can reactivate the project to restore access.
          </p>
        </div>
      </div>
    </div>
  )

  const sharedFormFields = (formState, onChange, members) => (
    <>
      {/* Title */}
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Title *</label>
        <input type="text" name="title" value={formState.title} onChange={onChange}
          required maxLength={200} placeholder="e.g. Build login page"
          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
      </div>
      {/* Description */}
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>
          Description <span className={`font-normal ${t.labelSub}`}>(optional)</span>
        </label>
        <textarea name="description" value={formState.description} onChange={onChange}
          rows={2} maxLength={1000} placeholder="Optional task details..."
          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition ${t.input}`} />
      </div>
      {/* Assign + Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Assign To</label>
          <select name="assignedTo" value={formState.assignedTo} onChange={onChange}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.select}`}>
            <option value="">Unassigned</option>
            {members?.map((member) => (
              <option key={member.user?._id} value={member.user?._id}>
                {member.user?.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Due Date</label>
          <input type="date" name="dueDate" value={formState.dueDate}
            min={new Date().toISOString().split('T')[0]} onChange={onChange}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.select}`} />
        </div>
      </div>
    </>
  )

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-16 space-y-5">

        {/* Back */}
        <button onClick={() => navigate(`/projects/${id}`)} className={`text-sm flex items-center gap-1.5 transition ${t.backBtn}`}>
          <IconArrowLeft /> Back to Project
        </button>

        {/* ── Header Bar ── */}
        <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
          <div>
            <h1 className={`text-base font-semibold ${t.sectionTitle}`}>Task Manager</h1>
            {project?.title && (
              <p className={`text-xs mt-0.5 ${t.sectionSub}`}>{project.title}</p>
            )}
          </div>
          {isOwner && !isCompleted && (
            <button
              onClick={() => { setShowForm(prev => !prev); setFormError('') }}
              className={`text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${t.addBtn}`}
            >
              <IconPlus /> {showForm ? 'Cancel' : 'Add Task'}
            </button>
          )}
        </div>

        {/* Owner locked banner */}
        {isCompleted && isOwner && (
          <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.warnBanner}`}>
            <IconLockSmall />
            <span>This project is completed. Tasks are read-only. Reactivate from your dashboard to manage tasks.</span>
          </div>
        )}

        {/* ── Progress Bar (if tasks exist) ── */}
        {tasks.length > 0 && (
          <div className={`rounded-xl border p-4 ${t.card}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${t.metaText}`}>Progress</span>
              <span className={`text-xs font-semibold ${t.metaText}`}>
                {completedTasks.length} / {tasks.length} tasks
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-gray-100'}`}>
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Create Task Form (inline, expands below header) ── */}
        {showForm && !isCompleted && (
          <div className={`rounded-xl border p-6 space-y-4 ${t.formCard}`}>
            <div className={`rounded-lg px-4 py-3 ${t.sectionHdr}`}>
              <h3 className={`text-sm font-semibold ${t.sectionTitle}`}>New Task</h3>
            </div>

            {formError && (
              <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.errorBg}`}>
                <IconAlertCircle /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              {sharedFormFields(form, handleFormChange, project?.teamMembers)}
              <div className={`flex gap-3 pt-2 border-t ${t.divider}`}>
                <button type="submit" disabled={formLoading}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${t.submitBtn}`}>
                  {formLoading ? 'Creating...' : 'Create Task'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormError('') }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition ${t.cancelBtn}`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Empty State ── */}
        {tasks.length === 0 && !showForm && (
          <div className={`rounded-xl border p-16 text-center ${t.card}`}>
            <div className={`flex justify-center mb-3 ${t.emptyText}`}><IconClipboard /></div>
            <p className={`font-medium ${t.emptyTitle}`}>No tasks yet</p>
            {isOwner && !isCompleted && (
              <p className={`text-sm mt-1 ${t.emptyText}`}>
                Click "+ Add Task" to create the first task for your team.
              </p>
            )}
          </div>
        )}

        {/* ── To Do Tasks ── */}
        {todoTasks.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs font-semibold uppercase tracking-widest px-1 ${t.sectionLabel}`}>
              To Do — {todoTasks.length}
            </p>
            {todoTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                isOwner={isOwner}
                isProjectCompleted={isCompleted}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
                t={t}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {/* ── Completed Tasks ── */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs font-semibold uppercase tracking-widest px-1 ${t.sectionLabel}`}>
              Completed — {completedTasks.length}
            </p>
            {completedTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                isOwner={isOwner}
                isProjectCompleted={isCompleted}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
                t={t}
                isDark={isDark}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Edit Task Modal ── */}
      {editingTask && !isCompleted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${t.modal}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-semibold ${t.modalHeading}`}>Edit Task</h3>
              <button onClick={() => { setEditingTask(null); setEditError('') }}
                className={`transition ${t.editBtn}`}>
                <IconX />
              </button>
            </div>

            {editError && (
              <div className={`text-sm px-4 py-3 rounded-xl border mb-4 flex items-center gap-2 ${t.errorBg}`}>
                <IconAlertCircle /> {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {sharedFormFields(editForm, handleEditFormChange, project?.teamMembers)}
              <div className={`flex gap-3 pt-2 border-t ${t.divider}`}>
                <button type="submit" disabled={editLoading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${t.submitBtn}`}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingTask(null); setEditError('') }}
                  className={`flex-1 border py-2.5 rounded-xl text-sm font-medium transition ${t.cancelBtn}`}>
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

// ── TaskCard sub-component ────────────────────────────────────
function TaskCard({ task, isOwner, isProjectCompleted, onToggle, onDelete, onEdit, t, isDark }) {
  const isDone = task.status === 'completed'

  const getDueDateStyle = () => {
    if (!task.dueDate || isDone) return t.metaText
    const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / 864e5)
    if (daysLeft < 0)  return 'text-red-400 font-medium'
    if (daysLeft <= 2) return 'text-orange-400 font-medium'
    if (daysLeft <= 7) return isDark ? 'text-yellow-400' : 'text-yellow-600'
    return t.metaText
  }

  const getDueDateLabel = () => {
    if (!task.dueDate) return null
    const due = new Date(task.dueDate)
    const daysLeft = Math.ceil((due - new Date()) / 864e5)
    if (daysLeft < 0)  return `Overdue · ${due.toLocaleDateString()}`
    if (daysLeft === 0) return 'Due today'
    if (daysLeft === 1) return 'Due tomorrow'
    if (daysLeft <= 7)  return `Due in ${daysLeft} days`
    return due.toLocaleDateString()
  }

  return (
    <div className={`border rounded-xl p-4 transition ${isDone ? t.cardDim : t.card}`}>
      <div className="flex items-start gap-3">

        {/* Checkbox */}
        <button
          onClick={() => !isProjectCompleted && onToggle(task._id)}
          disabled={isProjectCompleted}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
            isDone
              ? 'bg-green-500 border-green-500 text-white'
              : isProjectCompleted
              ? t.checkboxLocked
              : t.checkboxOff
          }`}
        >
          {isDone && <IconCheck />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isDone ? t.taskTitleDone : t.taskTitle}`}>
            {task.title}
          </p>
          {task.description && (
            <p className={`text-xs mt-0.5 ${t.taskDesc}`}>{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {task.assignedTo && (
              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                <IconUser /> {task.assignedTo.name}
              </span>
            )}
            {task.dueDate && (
              <span className={`text-xs flex items-center gap-1 ${getDueDateStyle()}`}>
                <IconCalendar /> {getDueDateLabel()}
              </span>
            )}
            {isDone && task.completedAt && (
              <span className={`text-xs flex items-center gap-1 text-green-400`}>
                <IconCheckCircle /> Completed {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && !isProjectCompleted && (
          <div className="shrink-0 flex items-center gap-1">
            <button onClick={() => onEdit(task)}
              className={`p-1.5 rounded-lg transition ${t.editBtn}`} title="Edit task">
              <IconEdit />
            </button>
            <button onClick={() => onDelete(task._id)}
              className={`p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition`} title="Delete task">
              <IconTrash />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
