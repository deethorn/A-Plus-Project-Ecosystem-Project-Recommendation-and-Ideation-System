import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, removeMember, leaveProject } from '../services/projectService'
import { sendCollaborationRequest, getProjectRequests, acceptRequest, rejectRequest } from '../services/collaborationService'
import { useAuth } from '../hooks/useAuth'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  const [project, setProject] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joinSuccess, setJoinSuccess] = useState(false)

  const [actionLoading, setActionLoading] = useState(null)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [leavingProject, setLeavingProject] = useState(false)

  const userId = user?.id?.toString() || user?._id?.toString()
  const ownerId = project?.owner?._id?.toString()
  const isOwner = !!(userId && ownerId && userId === ownerId)

  const isTeamMember = project?.teamMembers?.some(
    (m) => m.user?._id?.toString() === user?.id?.toString() ||
           m.user?._id?.toString() === user?._id?.toString()
  )

  const isCompleted = project?.status === 'completed'
  const isTeamFull = project?.currentTeamSize >= project?.teamSize

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchProject = async () => {
      try {
        const data = await getProjectById(id)
        setProject(data.project)

        const userId = user?.id?.toString() || user?._id?.toString()
        const ownerId = data.project.owner?._id?.toString()

        if (userId && ownerId && userId === ownerId) {
          const reqData = await getProjectRequests(id)
          setRequests(reqData.requests)
        }
      } catch (err) {
        setError('Failed to load project.')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  const handleJoinSubmit = async () => {
    setJoinLoading(true)
    setJoinError('')
    try {
      await sendCollaborationRequest(id, joinMessage)
      setJoinSuccess(true)
      setShowJoinModal(false)
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to send request.')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    setActionLoading(requestId)
    try {
      await acceptRequest(requestId)
      const [projData, reqData] = await Promise.all([
        getProjectById(id),
        getProjectRequests(id),
      ])
      setProject(projData.project)
      setRequests(reqData.requests)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId) => {
    setActionLoading(requestId)
    try {
      await rejectRequest(requestId)
      const reqData = await getProjectRequests(id)
      setRequests(reqData.requests)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this project?`)) return
    setRemovingMemberId(memberId)
    try {
      await removeMember(id, memberId)
      const data = await getProjectById(id)
      setProject(data.project)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.')
    } finally {
      setRemovingMemberId(null)
    }
  }

  const handleLeaveProject = async () => {
    if (!window.confirm('Leave this project? You will lose access to project tasks.')) return
    setLeavingProject(true)
    try {
      await leaveProject(id)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave project.')
      setLeavingProject(false)
    }
  }

  // ── Action buttons top-right — no leave button here anymore
  const renderActionButton = () => {
    if (isOwner) {
      return (
        <>
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium">
            Your Project
          </span>
          {!isCompleted ? (
            <button
              onClick={() => navigate(`/projects/${id}/tasks`)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium"
            >
              📋 Manage Tasks
            </button>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-400 px-3 py-2 rounded-lg font-medium">
              📋 Tasks Locked
            </span>
          )}
        </>
      )
    }

    if (isTeamMember) {
      return (
        <>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg font-medium">
            Team Member
          </span>
          {!isCompleted ? (
            <button
              onClick={() => navigate(`/projects/${id}/tasks`)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium"
            >
              📋 View Tasks
            </button>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-400 px-3 py-2 rounded-lg font-medium">
              📋 Tasks Locked
            </span>
          )}
          {/* ← Leave button intentionally removed from here */}
        </>
      )
    }

    if (isCompleted) {
      return (
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-2 rounded-lg font-medium">
          🔒 Project Completed
        </span>
      )
    }

    if (joinSuccess) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg font-medium">
          ⏳ Request Sent
        </span>
      )
    }

    if (isTeamFull) {
      return (
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-2 rounded-lg font-medium">
          Team Full
        </span>
      )
    }

    return (
      <button
        onClick={() => setShowJoinModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg font-medium"
      >
        Request to Join
      </button>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
        {error || 'Project not found.'}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">

      <button
        onClick={() => navigate('/projects')}
        className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-1"
      >
        ← Back to Projects
      </button>

      {/* Completed Banner */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          ✅ <strong>This project has been marked as completed.</strong>
          {isOwner && <span className="ml-1">Go to your dashboard to reactivate it.</span>}
        </div>
      )}

      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {project.isAnonymous && !isOwner ? 'Anonymous Project' : project.title}
              </h1>
              {project.isAnonymous && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  Anonymous
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium text-xs">
                {project.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'active'
                  ? 'bg-green-50 text-green-600'
                  : project.status === 'completed'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {project.status}
              </span>
              <span>👁 {project.views} views</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {renderActionButton()}
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>

        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {project.skillsNeeded?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills Needed</h3>
            <div className="flex flex-wrap gap-2">
              {project.skillsNeeded.map(skill => (
                <span key={skill} className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.duplicateScore > 50 && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm px-4 py-3 rounded-lg mb-6">
            ⚠️ This project has a <strong>{project.duplicateScore}% similarity score</strong> with existing projects.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">Posted by</p>
            <p className="text-sm font-medium text-gray-700">
              {project.isAnonymous
                ? isOwner ? 'You (Anonymous)' : isTeamMember ? project.owner?.name : 'Anonymous'
                : project.owner?.name}
            </p>
            {!project.isAnonymous && (
              <p className="text-xs text-gray-400">{project.owner?.institution}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Team Size</p>
            <p className="text-sm font-medium text-gray-700">
              {project.currentTeamSize} / {project.teamSize} members
            </p>
          </div>
        </div>
      </div>

      {/* ── Team Members ── */}
      {project.teamMembers?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h2>
          <div className="space-y-3">
            {project.teamMembers.map((member) => {
              const hiddenIdentity = project.isAnonymous && !isOwner && !isTeamMember
              const memberId = member.user?._id?.toString()
              const isOwnerRow = memberId === ownerId
              const isSelf = memberId === userId

              return (
                <div key={member.user?._id} className="flex items-center justify-between">

                  {/* Name + (you) label */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-700">
                        {hiddenIdentity ? '👤 Anonymous Member' : member.user?.name}
                      </p>
                      {isSelf && !isOwnerRow && (
                        <span className="text-xs text-gray-400">(you)</span>
                      )}
                    </div>
                    {!hiddenIdentity && (
                      <p className="text-xs text-gray-400">{member.user?.institution}</p>
                    )}
                  </div>

                  {/* Right side: role badge + action button */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      member.role === 'owner' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {hiddenIdentity ? 'member' : member.role}
                    </span>

                    {/* Owner removes another member — only when project is active */}
                    {isOwner && !isOwnerRow && !isCompleted && (
                      <button
                        onClick={() => handleRemoveMember(memberId, member.user?.name)}
                        disabled={removingMemberId === memberId}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg disabled:opacity-50 transition"
                      >
                        {removingMemberId === memberId ? '...' : 'Remove'}
                      </button>
                    )}

                    {/* Team member leaves — shown only on their own row, only when active */}
                    {!isOwner && isSelf && !isCompleted && (
                      <button
                        onClick={handleLeaveProject}
                        disabled={leavingProject}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-lg disabled:opacity-50 transition"
                      >
                        {leavingProject ? 'Leaving...' : '🚪 Leave'}
                      </button>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Collaboration Requests — Owner Only ── */}
      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Collaboration Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status === 'pending').length} pending
              </span>
            )}
          </h2>

          {isCompleted && (
            <div className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-4 py-3 rounded-lg mb-4">
              🔒 New collaboration requests are disabled while the project is completed.
            </div>
          )}

          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No collaboration requests yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{req.requester?.name}</p>
                      <p className="text-xs text-gray-400 mb-2">{req.requester?.institution}</p>
                      {req.message && (
                        <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      {req.status === 'pending' && !isCompleted ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(req._id)}
                            disabled={actionLoading === req._id}
                            className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium"
                          >
                            {actionLoading === req._id ? '...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={actionLoading === req._id}
                            className="text-xs bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium"
                          >
                            {actionLoading === req._id ? '...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          req.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Request to Join</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send a message to the project owner explaining why you'd like to join.
            </p>
            {joinError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {joinError}
              </div>
            )}
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Introduce yourself and explain your interest... (optional)"
              rows={4}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleJoinSubmit}
                disabled={joinLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                {joinLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => { setShowJoinModal(false); setJoinError(''); setJoinMessage('') }}
                className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
