import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { getMyProjects, deleteProject, updateProjectStatus } from '../services/projectService'
import { getMyRequests, revokeRequest } from '../services/collaborationService'
import { LampContainer } from '@/components/ui/lamp'

export default function Dashboard() {
  const { user } = useAuth()
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
        const [projData, reqData] = await Promise.all([
          getMyProjects(),
          getMyRequests()
        ])
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
    e.stopPropagation()
    setOpenDropdown(null)
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setDeletingId(projectId)
    setDeleteError('')
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p._id !== projectId))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete project.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleMarkComplete = async (e, projectId) => {
    e.stopPropagation()
    setOpenDropdown(null)
    if (!window.confirm('Mark this project as completed? It will be moved to your completed projects.')) return
    setCompletingId(projectId)
    try {
      await updateProjectStatus(projectId, 'completed')
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: 'completed' } : p))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to update project status.')
    } finally {
      setCompletingId(null)
    }
  }

  const handleMarkActive = async (e, projectId) => {
    e.stopPropagation()
    setOpenDropdown(null)
    setCompletingId(projectId)
    try {
      await updateProjectStatus(projectId, 'active')
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: 'active' } : p))
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to reactivate project.')
    } finally {
      setCompletingId(null)
    }
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
    } finally {
      setRevokingId(null)
    }
  }

  const statusConfig = {
    pending:  { border: 'border-yellow-500/30', text: 'text-yellow-400', bg: 'bg-yellow-500/10', label: '⏳ Pending' },
    accepted: { border: 'border-green-500/30',  text: 'text-green-400',  bg: 'bg-green-500/10',  label: '✅ Accepted' },
    rejected: { border: 'border-red-500/30',    text: 'text-red-400',    bg: 'bg-red-500/10',    label: '❌ Rejected' },
  }

  const ProjectDropdown = ({ project, isCompleted }) => (
    <div className="relative" ref={openDropdown === project._id ? dropdownRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpenDropdown(openDropdown === project._id ? null : project._id)
        }}
        disabled={deletingId === project._id || completingId === project._id}
        className="shrink-0 text-xs bg-transparent hover:bg-white/10 text-white/60 border border-white/20 px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 flex items-center gap-1 transition"
      >
        {deletingId === project._id ? 'Deleting...' :
         completingId === project._id ? 'Updating...' : '⋯ Actions'}
      </button>

      {openDropdown === project._id && (
        <div className="absolute right-0 top-9 z-20 bg-zinc-950 border border-white/15 rounded-xl shadow-2xl shadow-black w-52 py-1 text-sm">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenDropdown(null)
              navigate(`/projects/${project._id}`)
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-white/70 flex items-center gap-2 transition"
          >
            👁️ View Project
          </button>

          {isCompleted ? (
            <button
              onClick={(e) => handleMarkActive(e, project._id)}
              className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-white/70 flex items-center gap-2 transition"
            >
              🔄 Mark as Active
            </button>
          ) : (
            <button
              onClick={(e) => handleMarkComplete(e, project._id)}
              className="w-full text-left px-4 py-2.5 hover:bg-green-500/10 text-green-400 flex items-center gap-2 transition"
            >
              ✅ Mark as Completed
            </button>
          )}

          <div className="border-t border-white/10 my-1" />

          <button
            onClick={(e) => handleDelete(e, project._id)}
            className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition"
          >
            🗑️ Delete Project
          </button>
        </div>
      )}
    </div>
  )

  const ProjectCard = ({ project, isCompleted = false }) => (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className={`border rounded-xl p-5 transition cursor-pointer bg-zinc-950 ${
        isCompleted
          ? 'border-white/10 opacity-60 hover:opacity-80 hover:border-white/20'
          : 'border-white/15 hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.04)]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`font-semibold ${isCompleted ? 'text-white/40' : 'text-white'}`}>
              {project.title}
            </h3>
            {project.isAnonymous && (
              <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full border border-white/10">
                Anonymous
              </span>
            )}
            {isCompleted && (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                ✅ Completed
              </span>
            )}
          </div>
          <p className="text-sm text-white/35 mb-3 line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full font-medium border border-white/10">
              {project.category}
            </span>
            <span className="text-xs bg-white/5 text-white/40 px-3 py-1 rounded-full border border-white/10">
              Team: {project.currentTeamSize}/{project.teamSize}
            </span>
            {!isCompleted && (
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                project.status === 'active'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-white/5 text-white/30 border-white/10'
              }`}>
                {project.status}
              </span>
            )}
            {project.duplicateScore > 50 && (
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-full">
                ⚠️ {project.duplicateScore}% similar
              </span>
            )}
          </div>
        </div>
        <ProjectDropdown project={project} isCompleted={isCompleted} />
      </div>
    </div>
  )

  return (
    // Break out of Layout's px-4 py-8 to allow full-width lamp
    <div className="-mx-4 -mt-8 bg-black min-h-screen">

      {/* ── LAMP HERO ── */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0.5, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="flex flex-col items-center text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            What's The Big Idea?
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/50 max-w-xl leading-relaxed">
            APPE helps university students ideate, post, and collaborate on academic projects.
          </p>
          <p className="mt-3 text-sm text-white/25">
            Welcome back, {user?.name || 'Student'} 👋
          </p>
        </motion.div>
      </LampContainer>

      {/* ── MAIN CONTENT ── */}
      <div className="px-4 pb-12 space-y-6 max-w-6xl mx-auto">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => document.getElementById('my-projects-section').scrollIntoView({ behavior: 'smooth' })}
            className="bg-zinc-950 rounded-xl border border-white/15 p-5 cursor-pointer hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.04)] transition"
          >
            <p className="text-sm text-white/40">My Projects</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '—' : activeProjects.length}</p>
            <p className="text-xs text-white/25 mt-2">View my projects ↓</p>
          </div>

          <div
            onClick={() => document.getElementById('collab-section').scrollIntoView({ behavior: 'smooth' })}
            className="bg-zinc-950 rounded-xl border border-white/15 p-5 cursor-pointer hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.04)] transition"
          >
            <p className="text-sm text-white/40">Collaborations</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '—' : requests.length}</p>
            <p className="text-xs text-white/25 mt-2">
              {pendingCount > 0 ? `${pendingCount} pending ↓` : 'View requests ↓'}
            </p>
          </div>

          <div
            onClick={() => completedProjects.length > 0 &&
              document.getElementById('completed-section').scrollIntoView({ behavior: 'smooth' })}
            className={`bg-zinc-950 rounded-xl border border-white/15 p-5 transition ${
              completedProjects.length > 0
                ? 'cursor-pointer hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.04)]'
                : 'cursor-default'
            }`}
          >
            <p className="text-sm text-white/40">Completed</p>
            <p className="text-3xl font-bold text-white mt-1">{loading ? '—' : completedProjects.length}</p>
            <p className="text-xs text-white/25 mt-2">
              {completedProjects.length > 0 ? 'View completed ↓' : 'No completed projects yet'}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {deleteError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {deleteError}
          </div>
        )}

        {/* Active Projects */}
        <div id="my-projects-section" className="bg-zinc-950 rounded-xl border border-white/15 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">My Projects</h2>
            <Link
              to="/projects/new"
              className="text-sm text-black bg-white hover:bg-white/90 px-4 py-2 rounded-lg font-medium transition"
            >
              + Post Project
            </Link>
          </div>

          {loading && <p className="text-sm text-white/30 text-center py-8">Loading...</p>}
          {!loading && error && <p className="text-sm text-red-400 text-center py-8">{error}</p>}

          {!loading && !error && activeProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📂</p>
              <p className="font-medium text-white/50">No active projects</p>
              <p className="text-sm mt-1 text-white/30">Post your first project idea to get started</p>
            </div>
          )}

          {!loading && !error && activeProjects.length > 0 && (
            <div className="space-y-4">
              {activeProjects.map(project => (
                <ProjectCard key={project._id} project={project} isCompleted={false} />
              ))}
            </div>
          )}
        </div>

        {/* Completed Projects */}
        {!loading && completedProjects.length > 0 && (
          <div id="completed-section" className="bg-zinc-950 rounded-xl border border-white/15 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Completed Projects
                <span className="ml-2 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                  {completedProjects.length}
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              {completedProjects.map(project => (
                <ProjectCard key={project._id} project={project} isCompleted={true} />
              ))}
            </div>
          </div>
        )}

        {/* Collaboration Requests */}
        <div id="collab-section" className="bg-zinc-950 rounded-xl border border-white/15 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              My Collaboration Requests
              {pendingCount > 0 && (
                <span className="ml-2 text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-white/40 hover:text-white font-medium transition"
            >
              Browse Projects →
            </button>
          </div>

          {loading && <p className="text-sm text-white/30 text-center py-8">Loading...</p>}

          {!loading && requests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🤝</p>
              <p className="font-medium text-white/50">No collaboration requests yet</p>
              <p className="text-sm mt-1 text-white/30">Find a project you like and request to join</p>
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="space-y-4">
              {requests.map((req) => {
                const config = statusConfig[req.status] || statusConfig.pending
                return (
                  <div
                    key={req._id}
                    onClick={() => navigate(`/projects/${req.project?._id}`)}
                    className={`border ${config.border} rounded-xl p-5 transition cursor-pointer ${config.bg} hover:brightness-125`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {req.project?.title || 'Untitled Project'}
                        </h3>
                        <p className="text-xs text-white/30 mb-2">
                          {req.project?.category} · Requested {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                        {req.message && (
                          <p className="text-sm text-white/40 italic line-clamp-1">"{req.message}"</p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${config.border} ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                        {req.status === 'pending' && (
                          <button
                            onClick={(e) => handleRevokeRequest(e, req._id)}
                            disabled={revokingId === req._id}
                            className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-1 rounded-lg disabled:opacity-50 transition"
                          >
                            {revokingId === req._id ? 'Revoking...' : '✕ Revoke'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
