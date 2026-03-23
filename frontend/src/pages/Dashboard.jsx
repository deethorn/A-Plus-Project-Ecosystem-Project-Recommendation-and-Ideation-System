import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { getMyProjects, deleteProject, updateProjectStatus } from '../services/projectService'
import { getMyRequests, revokeRequest } from '../services/collaborationService'

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconFolder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconWarning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export default function Dashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [completingId, setCompletingId] = useState(null)
  const [revokingId, setRevokingId] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  // ── Theme class map ───────────────────────────────────────────
  const t = {
    page:         isDark ? 'bg-black'                                    : 'bg-gray-50',
    heading:      isDark ? 'text-white'                                  : 'text-gray-900',
    subtext:      isDark ? 'text-white/40'                               : 'text-gray-500',
    statCard:     isDark ? 'bg-zinc-900 border-white/10 hover:border-white/25'  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm',
    statLabel:    isDark ? 'text-white/50'                               : 'text-gray-500',
    statNum:      isDark ? 'text-white'                                  : 'text-gray-900',
    statSub:      isDark ? 'text-white/30'                               : 'text-gray-400',
    sectionHdr:   isDark ? 'bg-white border border-gray-100'             : 'bg-black border border-black',
    sectionTitle: isDark ? 'text-gray-900'                               : 'text-white',
    card:         isDark ? 'bg-zinc-900 border-white/10 hover:border-white/25'  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm',
    cardDim:      isDark ? 'bg-zinc-900 border-white/8 opacity-60'       : 'bg-gray-50 border-gray-100 opacity-70',
    cardTitle:    isDark ? 'text-white'                                  : 'text-gray-800',
    cardTitleDim: isDark ? 'text-white/35'                               : 'text-gray-400',
    cardDesc:     isDark ? 'text-white/40'                               : 'text-gray-500',
    tag:          isDark ? 'bg-white/8 text-white/60 border-white/10'    : 'bg-gray-100 text-gray-600 border-gray-200',
    tagSub:       isDark ? 'bg-white/5 text-white/40 border-white/10'    : 'bg-gray-100 text-gray-500 border-gray-100',
    anonTag:      isDark ? 'bg-white/8 text-white/40 border-white/10'    : 'bg-gray-100 text-gray-500 border-gray-200',
    dropdown:     isDark ? 'bg-zinc-900 border-white/15'                 : 'bg-white border-gray-200 shadow-lg',
    dropItem:     isDark ? 'hover:bg-white/5 text-white/70'              : 'hover:bg-gray-50 text-gray-700',
    dropDivider:  isDark ? 'border-white/10'                             : 'border-gray-100',
    actionsBtn:   isDark ? 'bg-white/5 hover:bg-white/10 text-white/60 border-white/15' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200',
    emptyText:    isDark ? 'text-white/30'                               : 'text-gray-400',
    emptyTitle:   isDark ? 'text-white/50'                               : 'text-gray-500',
    errorBg:      isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600',
    browseBtn:    isDark ? 'text-gray-500 hover:text-gray-800'           : 'text-white/50 hover:text-white',
    postBtn:      isDark ? 'bg-black hover:bg-zinc-800 text-white'       : 'bg-white hover:bg-white/90 text-black',
  }
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projData, reqData] = await Promise.all([getMyProjects(), getMyRequests()])
        setProjects(projData.projects)
        setRequests(reqData.requests)
      } catch (err) {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeProjects = projects.filter(p => p.status !== 'completed')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const pendingCount = !loading ? requests.filter(r => r.status === 'pending').length : 0

  const handleDelete = async (e, projectId) => {
    e.stopPropagation(); setOpenDropdown(null)
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeletingId(projectId); setDeleteError('')
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p._id !== projectId))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete project.')
    } finally { setDeletingId(null) }
  }

  const handleMarkComplete = async (e, projectId) => {
    e.stopPropagation(); setOpenDropdown(null)
    if (!window.confirm('Mark this project as completed?')) return
    setCompletingId(projectId)
    try {
      await updateProjectStatus(projectId, 'completed')
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: 'completed' } : p))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to update project status.')
    } finally { setCompletingId(null) }
  }

  const handleMarkActive = async (e, projectId) => {
    e.stopPropagation(); setOpenDropdown(null); setCompletingId(projectId)
    try {
      await updateProjectStatus(projectId, 'active')
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: 'active' } : p))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to reactivate project.')
    } finally { setCompletingId(null) }
  }

  const handleRevokeRequest = async (e, requestId) => {
    e.stopPropagation()
    if (!window.confirm('Revoke this collaboration request?')) return
    setRevokingId(requestId)
    try {
      await revokeRequest(requestId)
      setRequests(prev => prev.filter(r => r._id !== requestId))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to revoke request.')
    } finally { setRevokingId(null) }
  }

  const statusConfig = {
    pending:  { border: 'border-yellow-500/30', text: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
    accepted: { border: 'border-green-500/30',  text: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Accepted' },
    rejected: { border: 'border-red-500/30',    text: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Rejected' },
  }

  const ProjectDropdown = ({ project, isCompleted }) => (
    <div className="relative" ref={openDropdown === project._id ? dropdownRef : null}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === project._id ? null : project._id) }}
        disabled={deletingId === project._id || completingId === project._id}
        className={`shrink-0 text-xs border px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 flex items-center gap-1.5 transition ${t.actionsBtn}`}
      >
        <span className="tracking-widest">···</span>
        <span>{deletingId === project._id ? 'Deleting...' : completingId === project._id ? 'Updating...' : 'Actions'}</span>
      </button>

      {openDropdown === project._id && (
        <div className={`absolute right-0 top-9 z-20 border rounded-xl w-52 py-1 text-sm ${t.dropdown}`}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); navigate(`/projects/${project._id}`) }}
            className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition ${t.dropItem}`}
          >
            <IconEye /> View Project
          </button>
          {isCompleted ? (
            <button onClick={(e) => handleMarkActive(e, project._id)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition ${t.dropItem}`}>
              <IconRefresh /> Mark as Active
            </button>
          ) : (
            <button onClick={(e) => handleMarkComplete(e, project._id)}
              className="w-full text-left px-4 py-2.5 hover:bg-green-500/10 text-green-500 flex items-center gap-2.5 transition">
              <IconCheck /> Mark as Completed
            </button>
          )}
          <div className={`border-t my-1 ${t.dropDivider}`} />
          <button onClick={(e) => handleDelete(e, project._id)}
            className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-2.5 transition">
            <IconTrash /> Delete Project
          </button>
        </div>
      )}
    </div>
  )

  const ProjectCard = ({ project, isCompleted = false }) => (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className={`border rounded-xl p-5 transition cursor-pointer ${isCompleted ? t.cardDim : t.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`font-semibold ${isCompleted ? t.cardTitleDim : t.cardTitle}`}>
              {project.title}
            </h3>
            {project.isAnonymous && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${t.anonTag}`}>Anonymous</span>
            )}
            {isCompleted && (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                Completed
              </span>
            )}
          </div>
          <p className={`text-sm mb-3 line-clamp-2 ${t.cardDesc}`}>{project.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${t.tag}`}>{project.category}</span>
            <span className={`text-xs px-3 py-1 rounded-full border ${t.tagSub}`}>Team: {project.currentTeamSize}/{project.teamSize}</span>
            {!isCompleted && (
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                project.status === 'active'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : isDark ? 'bg-white/5 text-white/30 border-white/10' : 'bg-gray-100 text-gray-500 border-gray-100'
              }`}>
                {project.status}
              </span>
            )}
            {project.duplicateScore > 50 && (
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                <IconWarning /> {project.duplicateScore}% similar
              </span>
            )}
          </div>
        </div>
        <ProjectDropdown project={project} isCompleted={isCompleted} />
      </div>
    </div>
  )

  const RequestCard = ({ req }) => {
    const config = statusConfig[req.status] || statusConfig.pending
    return (
      <div
        onClick={() => navigate(`/projects/${req.project?._id}`)}
        className={`border rounded-xl p-5 transition cursor-pointer ${t.card}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${t.cardTitle}`}>{req.project?.title || 'Untitled Project'}</h3>
            <p className={`text-xs mb-2 ${t.cardDesc}`}>
              {req.project?.category} · Requested {new Date(req.createdAt).toLocaleDateString()}
            </p>
            {req.message && (
              <p className={`text-sm italic line-clamp-1 ${t.cardDesc}`}>"{req.message}"</p>
            )}
          </div>
          <div className="ml-4 flex flex-col items-end gap-2 shrink-0">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${config.border} ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            {req.status === 'pending' && (
              <button
                onClick={(e) => handleRevokeRequest(e, req._id)}
                disabled={revokingId === req._id}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-1 rounded-lg disabled:opacity-50 transition"
              >
                {revokingId === req._id ? 'Revoking...' : 'Revoke'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 space-y-8">

        {/* Welcome Header */}
        <div>
          <h1 className={`text-2xl font-bold ${t.heading}`}>Welcome back, {user?.name || 'Student'}</h1>
          <p className={`mt-1 text-sm ${t.subtext}`}>Manage your project ideas and find collaborators.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'My Projects', value: activeProjects.length, sub: 'View my projects ↓', target: 'my-projects-section' },
            { label: 'Collaborations', value: requests.length, sub: pendingCount > 0 ? `${pendingCount} pending ↓` : 'View requests ↓', target: 'collab-section' },
            { label: 'Completed', value: completedProjects.length, sub: completedProjects.length > 0 ? 'View completed ↓' : 'No completed projects yet', target: 'completed-section' },
          ].map(({ label, value, sub, target }) => (
            <div
              key={label}
              onClick={() => {
                const el = document.getElementById(target)
                if (el && (label !== 'Completed' || completedProjects.length > 0)) {
                  el.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className={`rounded-xl border p-5 transition ${t.statCard} ${
                label !== 'Completed' || completedProjects.length > 0 ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <p className={`text-sm ${t.statLabel}`}>{label}</p>
              <p className={`text-3xl font-bold mt-1 ${t.statNum}`}>{loading ? '—' : value}</p>
              <p className={`text-xs mt-2 ${t.statSub}`}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Error Banner */}
        {deleteError && (
          <div className={`text-sm px-4 py-3 rounded-lg border ${t.errorBg}`}>{deleteError}</div>
        )}

        {/* ── MY PROJECTS ── */}
        <div id="my-projects-section" className="space-y-3">
          <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
            <h2 className={`text-base font-semibold ${t.sectionTitle}`}>My Projects</h2>
            <Link to="/projects/new" className={`text-sm px-4 py-2 rounded-lg font-medium transition ${t.postBtn}`}>
              + Post Project
            </Link>
          </div>
          {loading && <div className={`rounded-xl border p-8 text-center text-sm ${t.card} ${t.emptyText}`}>Loading...</div>}
          {!loading && error && <div className={`rounded-xl border p-8 text-center text-sm text-red-400 ${t.card}`}>{error}</div>}
          {!loading && !error && activeProjects.length === 0 && (
            <div className={`rounded-xl border p-12 text-center ${t.card}`}>
              <div className={`flex justify-center mb-3 ${t.emptyText}`}><IconFolder /></div>
              <p className={`font-medium ${t.emptyTitle}`}>No active projects</p>
              <p className={`text-sm mt-1 ${t.emptyText}`}>Post your first project idea to get started</p>
            </div>
          )}
          {!loading && !error && activeProjects.map(project => (
            <ProjectCard key={project._id} project={project} isCompleted={false} />
          ))}
        </div>

        {/* ── COMPLETED PROJECTS ── */}
        {!loading && completedProjects.length > 0 && (
          <div id="completed-section" className="space-y-3">
            <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
              <h2 className={`text-base font-semibold ${t.sectionTitle}`}>
                Completed Projects
                <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  {completedProjects.length}
                </span>
              </h2>
            </div>
            {completedProjects.map(project => (
              <ProjectCard key={project._id} project={project} isCompleted={true} />
            ))}
          </div>
        )}

        {/* ── COLLABORATION REQUESTS ── */}
        <div id="collab-section" className="space-y-3">
          <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
            <h2 className={`text-base font-semibold ${t.sectionTitle}`}>
              My Collaboration Requests
              {pendingCount > 0 && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <button onClick={() => navigate('/projects')} className={`text-sm font-medium transition ${t.browseBtn}`}>
              Browse Projects →
            </button>
          </div>
          {loading && <div className={`rounded-xl border p-8 text-center text-sm ${t.card} ${t.emptyText}`}>Loading...</div>}
          {!loading && requests.length === 0 && (
            <div className={`rounded-xl border p-12 text-center ${t.card}`}>
              <div className={`flex justify-center mb-3 ${t.emptyText}`}><IconUsers /></div>
              <p className={`font-medium ${t.emptyTitle}`}>No collaboration requests yet</p>
              <p className={`text-sm mt-1 ${t.emptyText}`}>Find a project you like and request to join</p>
            </div>
          )}
          {!loading && requests.map(req => <RequestCard key={req._id} req={req} />)}
        </div>

      </div>
    </div>
  )
}
