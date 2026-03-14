import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getMyProjects, deleteProject, updateProjectStatus } from '../services/projectService'
import { getMyRequests, revokeRequest } from '../services/collaborationService'

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
    pending:  { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: '⏳ Pending' },
    accepted: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  label: '✅ Accepted' },
    rejected: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    label: '❌ Rejected' },
  }

  const ProjectDropdown = ({ project, isCompleted }) => (
    <div className="relative" ref={openDropdown === project._id ? dropdownRef : null}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpenDropdown(openDropdown === project._id ? null : project._id)
        }}
        disabled={deletingId === project._id || completingId === project._id}
        className="shrink-0 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 flex items-center gap-1"
      >
        {deletingId === project._id ? 'Deleting...' :
         completingId === project._id ? 'Updating...' : '⋯ Actions'}
      </button>

      {openDropdown === project._id && (
        <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-52 py-1 text-sm">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenDropdown(null)
              navigate(`/projects/${project._id}`)
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
          >
            👁️ View Project
          </button>

          {isCompleted ? (
            <button
              onClick={(e) => handleMarkActive(e, project._id)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-600 flex items-center gap-2"
            >
              🔄 Mark as Active
            </button>
          ) : (
            <button
              onClick={(e) => handleMarkComplete(e, project._id)}
              className="w-full text-left px-4 py-2.5 hover:bg-green-50 text-green-700 flex items-center gap-2"
            >
              ✅ Mark as Completed
            </button>
          )}

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={(e) => handleDelete(e, project._id)}
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-500 flex items-center gap-2"
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
      className={`border rounded-xl p-5 hover:shadow-sm transition cursor-pointer ${
        isCompleted ? 'border-gray-100 bg-gray-50 opacity-80' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${isCompleted ? 'text-gray-500' : 'text-gray-800'}`}>
              {project.title}
            </h3>
            {project.isAnonymous && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anonymous</span>
            )}
            {isCompleted && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                ✅ Completed
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
              {project.category}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              Team: {project.currentTeamSize}/{project.teamSize}
            </span>
            {!isCompleted && (
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                project.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {project.status}
              </span>
            )}
            {project.duplicateScore > 50 && (
              <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded-full">
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
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name || 'Student'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Manage your project ideas and find collaborators.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => document.getElementById('my-projects-section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-sm transition"
        >
          <p className="text-sm text-gray-500">My Projects</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{loading ? '...' : activeProjects.length}</p>
          <p className="text-xs text-blue-400 mt-2">View my projects ↓</p>
        </div>

        <div
          onClick={() => document.getElementById('collab-section').scrollIntoView({ behavior: 'smooth' })}
          className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-green-300 hover:shadow-sm transition"
        >
          <p className="text-sm text-gray-500">Collaborations</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{loading ? '...' : requests.length}</p>
          <p className="text-xs text-green-400 mt-2">
            {pendingCount > 0 ? `${pendingCount} pending ↓` : 'View requests ↓'}
          </p>
        </div>

        <div
          onClick={() => completedProjects.length > 0 &&
            document.getElementById('completed-section').scrollIntoView({ behavior: 'smooth' })}
          className={`bg-white rounded-xl border border-gray-200 p-5 transition ${
            completedProjects.length > 0 ? 'cursor-pointer hover:border-purple-300 hover:shadow-sm' : 'cursor-default'
          }`}
        >
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{loading ? '...' : completedProjects.length}</p>
          <p className="text-xs text-purple-400 mt-2">
            {completedProjects.length > 0 ? 'View completed ↓' : 'No completed projects yet'}
          </p>
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {deleteError}
        </div>
      )}

      {/* Active Projects */}
      <div id="my-projects-section" className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My Projects</h2>
          <Link
            to="/projects/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
          >
            + Post Project
          </Link>
        </div>

        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading...</p>}
        {!loading && error && <p className="text-sm text-red-500 text-center py-8">{error}</p>}

        {!loading && !error && activeProjects.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📂</p>
            <p className="font-medium">No active projects</p>
            <p className="text-sm mt-1">Post your first project idea to get started</p>
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
        <div id="completed-section" className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Completed Projects
              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
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
      <div id="collab-section" className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            My Collaboration Requests
            {pendingCount > 0 && (
              <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse Projects →
          </button>
        </div>

        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading...</p>}

        {!loading && requests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🤝</p>
            <p className="font-medium">No collaboration requests yet</p>
            <p className="text-sm mt-1">Find a project you like and request to join</p>
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
                  className={`border ${config.border} rounded-xl p-5 hover:shadow-sm transition cursor-pointer ${config.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {req.project?.title || 'Untitled Project'}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {req.project?.category} · Requested {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      {req.message && (
                        <p className="text-sm text-gray-500 italic line-clamp-1">"{req.message}"</p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${config.border} ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      {/* Only show revoke on pending requests */}
                      {req.status === 'pending' && (
                        <button
                          onClick={(e) => handleRevokeRequest(e, req._id)}
                          disabled={revokingId === req._id}
                          className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg disabled:opacity-50 transition"
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
  )
}
