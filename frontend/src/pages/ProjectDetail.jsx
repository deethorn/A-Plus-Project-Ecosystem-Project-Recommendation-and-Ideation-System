import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, removeMember, leaveProject } from '../services/projectService'
import { sendCollaborationRequest, getProjectRequests, acceptRequest, rejectRequest } from '../services/collaborationService'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconLogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconWarning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconUserX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="18" y1="8" x2="23" y2="13"/>
    <line x1="23" y1="8" x2="18" y2="13"/>
  </svg>
)

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
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

  const userId  = user?.id?.toString() || user?._id?.toString()
  const ownerId = project?.owner?._id?.toString()
  const isOwner = !!(userId && ownerId && userId === ownerId)
  const isTeamMember = project?.teamMembers?.some(
    m => m.user?._id?.toString() === user?.id?.toString() ||
         m.user?._id?.toString() === user?._id?.toString()
  )
  const isCompleted = project?.status === 'completed'
  const isTeamFull  = project?.currentTeamSize >= project?.teamSize

  const t = {
    page:          isDark ? 'bg-black'                                               : 'bg-gray-50',
    backBtn:       isDark ? 'text-white/40 hover:text-white'                         : 'text-gray-500 hover:text-gray-900',
    card:          isDark ? 'bg-zinc-900 border-white/10'                            : 'bg-white border-gray-200',
    sectionHdr:    isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle:  isDark ? 'text-gray-900'                                          : 'text-white',
    heading:       isDark ? 'text-white'                                             : 'text-gray-900',
    subtext:       isDark ? 'text-white/45'                                          : 'text-gray-600',
    metaText:      isDark ? 'text-white/35'                                          : 'text-gray-400',
    divider:       isDark ? 'border-white/8'                                         : 'border-gray-100',
    tag:           isDark ? 'bg-white/8 text-white/55 border-white/10'               : 'bg-gray-100 text-gray-600 border-gray-100',
    tagCat:        isDark ? 'bg-white/10 text-white/70 border-white/10'              : 'bg-blue-50 text-blue-600 border-blue-100',
    tagSkill:      isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'  : 'bg-purple-50 text-purple-600 border-purple-200',
    statusActive:  isDark ? 'bg-green-500/10 text-green-400 border-green-500/20'     : 'bg-green-50 text-green-600 border-green-200',
    statusDone:    isDark ? 'bg-white/5 text-white/30 border-white/8'                : 'bg-gray-100 text-gray-400 border-gray-100',
    ownerBadge:    isDark ? 'bg-white/8 text-white/60 border-white/15'               : 'bg-blue-50 text-blue-700 border-blue-100',
    memberBadge:   isDark ? 'bg-green-500/10 text-green-400 border-green-500/20'     : 'bg-green-50 text-green-700 border-green-200',
    tasksBtn:      isDark ? 'bg-white/8 hover:bg-white/12 text-white/60 border-white/15' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200',
    lockedBadge:   isDark ? 'bg-white/5 text-white/30 border-white/8'                : 'bg-gray-100 text-gray-400 border-gray-100',
    pendingBadge:  isDark ? 'bg-white text-black'                                    : 'bg-gray-900 text-white',
    memberRow:     isDark ? 'border-white/8'                                         : 'border-gray-100',
    memberName:    isDark ? 'text-white/80'                                          : 'text-gray-700',
    memberRoleBadge: isDark ? 'bg-white/8 text-white/50'                             : 'bg-gray-100 text-gray-500',
    memberOwnerBadge:isDark ? 'bg-white/10 text-white/70'                            : 'bg-blue-50 text-blue-600',
    reqCard:       isDark ? 'border-white/8 bg-white/3'                              : 'border-gray-100 bg-gray-50',
    reqName:       isDark ? 'text-white/80'                                          : 'text-gray-800',
    reqMeta:       isDark ? 'text-white/35'                                          : 'text-gray-400',
    reqMsg:        isDark ? 'bg-white/5 text-white/50 border-white/8'                : 'bg-white text-gray-600 border-gray-100',
    completedBanner:isDark? 'bg-green-500/10 border-green-500/20 text-green-400'     : 'bg-green-50 border-green-200 text-green-700',
    warnBanner:    isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'  : 'bg-orange-50 border-orange-200 text-orange-700',
    errorBg:       isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    emptyText:     isDark ? 'text-white/30'                                          : 'text-gray-400',
    modal:         isDark ? 'bg-zinc-900 border border-white/15'                     : 'bg-white border border-gray-200',
    modalHeading:  isDark ? 'text-white'                                             : 'text-gray-900',
    modalSub:      isDark ? 'text-white/40'                                          : 'text-gray-500',
    textarea:      isDark ? 'bg-zinc-800 border-white/15 text-white placeholder-white/25 focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400',
    cancelBtn:     isDark ? 'border-white/15 text-white/50 hover:bg-white/5'         : 'border-gray-300 text-gray-600 hover:bg-gray-50',
  }

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id)
        setProject(data.project)
        const uid = user?.id?.toString() || user?._id?.toString()
        const oid = data.project.owner?._id?.toString()
        if (uid && oid && uid === oid) {
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
    setJoinLoading(true); setJoinError('')
    try {
      await sendCollaborationRequest(id, joinMessage)
      setJoinSuccess(true); setShowJoinModal(false)
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to send request.')
    } finally { setJoinLoading(false) }
  }

  const handleAccept = async (requestId) => {
    setActionLoading(requestId)
    try {
      await acceptRequest(requestId)
      const [projData, reqData] = await Promise.all([getProjectById(id), getProjectRequests(id)])
      setProject(projData.project); setRequests(reqData.requests)
    } catch (err) { alert(err.response?.data?.message || 'Failed to accept.') }
    finally { setActionLoading(null) }
  }

  const handleReject = async (requestId) => {
    setActionLoading(requestId)
    try {
      await rejectRequest(requestId)
      const reqData = await getProjectRequests(id)
      setRequests(reqData.requests)
    } catch (err) { alert(err.response?.data?.message || 'Failed to reject.') }
    finally { setActionLoading(null) }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this project?`)) return
    setRemovingMemberId(memberId)
    try {
      await removeMember(id, memberId)
      const data = await getProjectById(id)
      setProject(data.project)
    } catch (err) { alert(err.response?.data?.message || 'Failed to remove member.') }
    finally { setRemovingMemberId(null) }
  }

  const handleLeaveProject = async () => {
    if (!window.confirm('Leave this project?')) return
    setLeavingProject(true)
    try { await leaveProject(id); navigate('/dashboard') }
    catch (err) { alert(err.response?.data?.message || 'Failed to leave.'); setLeavingProject(false) }
  }

  const renderActionButton = () => {
    if (isOwner) return (
      <>
        <span className={`text-xs px-3 py-2 rounded-lg font-medium border ${t.ownerBadge}`}>Your Project</span>
        {!isCompleted
          ? <button onClick={() => navigate(`/projects/${id}/tasks`)} className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 transition ${t.tasksBtn}`}><IconClipboard /> Manage Tasks</button>
          : <span className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 ${t.lockedBadge}`}><IconLock /> Tasks Locked</span>
        }
      </>
    )
    if (isTeamMember) return (
      <>
        <span className={`text-xs px-3 py-2 rounded-lg font-medium border ${t.memberBadge}`}>Team Member</span>
        {!isCompleted
          ? <button onClick={() => navigate(`/projects/${id}/tasks`)} className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 transition ${t.tasksBtn}`}><IconClipboard /> View Tasks</button>
          : <span className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 ${t.lockedBadge}`}><IconLock /> Tasks Locked</span>
        }
      </>
    )
    if (isCompleted) return <span className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 ${t.lockedBadge}`}><IconLock /> Completed</span>
    if (joinSuccess)  return <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5"><IconClock /> Request Sent</span>
    if (isTeamFull)   return <span className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 ${t.lockedBadge}`}><IconUsers /> Team Full</span>
    return (
      <button onClick={() => setShowJoinModal(true)} className="text-sm px-5 py-2 rounded-lg font-medium bg-white hover:bg-gray-100 text-black transition">
        Request to Join
      </button>
    )
  }

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${t.page}`}>
      <p className={`text-sm ${t.emptyText}`}>Loading project...</p>
    </div>
  )

  if (error || !project) return (
    <div className={`min-h-screen p-8 ${t.page}`}>
      <div className={`text-sm px-4 py-3 rounded-xl border ${t.errorBg}`}>{error || 'Project not found.'}</div>
    </div>
  )

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16 space-y-4">

        {/* Back */}
        <button onClick={() => navigate('/projects')} className={`text-sm flex items-center gap-1.5 transition ${t.backBtn}`}>
          <IconArrowLeft /> Back to Projects
        </button>

        {/* Completed Banner */}
        {isCompleted && (
          <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.completedBanner}`}>
            <IconCheck />
            <span><strong>This project has been marked as completed.</strong>
            {isOwner && <span className="opacity-70 ml-1">Go to dashboard to reactivate it.</span>}</span>
          </div>
        )}

        {/* ── Project Header Card ── */}
        <div className={`rounded-xl border p-7 space-y-5 ${t.card}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className={`text-2xl font-bold ${t.heading}`}>
                  {project.isAnonymous && !isOwner ? 'Anonymous Project' : project.title}
                </h1>
                {project.isAnonymous && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${t.tag}`}>Anonymous</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${t.tagCat}`}>{project.category}</span>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${project.status === 'active' ? t.statusActive : t.statusDone}`}>
                  {project.status}
                </span>
                <span className={`text-xs flex items-center gap-1 ${t.metaText}`}>
                  <IconEye /> {project.views} views
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {renderActionButton()}
            </div>
          </div>

          <p className={`leading-relaxed ${t.subtext}`}>{project.description}</p>

          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className={`text-xs px-3 py-1 rounded-full border ${t.tag}`}>#{tag}</span>
              ))}
            </div>
          )}

          {project.skillsNeeded?.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.metaText}`}>Skills Needed</p>
              <div className="flex flex-wrap gap-2">
                {project.skillsNeeded.map(skill => (
                  <span key={skill} className={`text-xs px-3 py-1 rounded-full border ${t.tagSkill}`}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {project.duplicateScore > 50 && (
            <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.warnBanner}`}>
              <IconWarning />
              This project has a <strong>{project.duplicateScore}% similarity score</strong> with existing projects.
            </div>
          )}

          <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${t.divider}`}>
            <div>
              <p className={`text-xs mb-1 ${t.metaText}`}>Posted by</p>
              <p className={`text-sm font-medium ${t.heading}`}>
                {project.isAnonymous
                  ? isOwner ? 'You (Anonymous)' : isTeamMember ? project.owner?.name : 'Anonymous'
                  : project.owner?.name}
              </p>
              {!project.isAnonymous && <p className={`text-xs ${t.metaText}`}>{project.owner?.institution}</p>}
            </div>
            <div>
              <p className={`text-xs mb-1 ${t.metaText}`}>Team Size</p>
              <p className={`text-sm font-medium ${t.heading}`}>{project.currentTeamSize} / {project.teamSize} members</p>
            </div>
          </div>
        </div>

        {/* ── Team Members ── */}
        {project.teamMembers?.length > 0 && (
          <div className={`rounded-xl border p-6 space-y-4 ${t.card}`}>
            <div className={`rounded-lg px-4 py-3 flex items-center gap-2 ${t.sectionHdr}`}>
              <IconUsers />
              <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>Team Members</h2>
            </div>
            <div className="space-y-1">
              {project.teamMembers.map((member) => {
                const hiddenIdentity = project.isAnonymous && !isOwner && !isTeamMember
                const memberId   = member.user?._id?.toString()
                const isOwnerRow = memberId === ownerId
                const isSelf     = memberId === userId
                return (
                  <div key={member.user?._id} className={`flex items-center justify-between py-3 border-b last:border-0 ${t.memberRow}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${t.memberName}`}>
                          {hiddenIdentity ? 'Anonymous Member' : member.user?.name}
                        </p>
                        {isSelf && !isOwnerRow && <span className={`text-xs ${t.metaText}`}>(you)</span>}
                      </div>
                      {!hiddenIdentity && <p className={`text-xs ${t.metaText}`}>{member.user?.institution}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${member.role === 'owner' ? t.memberOwnerBadge : t.memberRoleBadge}`}>
                        {hiddenIdentity ? 'member' : member.role}
                      </span>
                      {isOwner && !isOwnerRow && !isCompleted && (
                        <button onClick={() => handleRemoveMember(memberId, member.user?.name)}
                          disabled={removingMemberId === memberId}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-2 py-1 rounded-lg disabled:opacity-50 transition">
                          {removingMemberId === memberId ? '...' : 'Remove'}
                        </button>
                      )}
                      {!isOwner && isSelf && !isCompleted && (
                        <button onClick={handleLeaveProject} disabled={leavingProject}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-2 py-1 rounded-lg disabled:opacity-50 transition flex items-center gap-1">
                          <IconLogOut /> {leavingProject ? 'Leaving...' : 'Leave'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Collaboration Requests (Owner Only) ── */}
        {isOwner && (
          <div className={`rounded-xl border p-6 space-y-4 ${t.card}`}>
            <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${t.sectionHdr}`}>
              <div className={`flex items-center gap-2`}>
                <IconUsers />
                <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>Collaboration Requests</h2>
              </div>
              {pendingCount > 0 && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.pendingBadge}`}>
                  {pendingCount} pending
                </span>
              )}
            </div>

            {isCompleted && (
              <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.lockedBadge}`}>
                <IconLock /> New collaboration requests are disabled while the project is completed.
              </div>
            )}

            {requests.length === 0 ? (
              <div className="py-8 text-center">
                <div className={`flex justify-center mb-2 ${t.emptyText}`}><IconUserX /></div>
                <p className={`text-sm ${t.emptyText}`}>No collaboration requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req._id} className={`border rounded-xl p-4 ${t.reqCard}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${t.reqName}`}>{req.requester?.name}</p>
                        <p className={`text-xs mb-2 ${t.reqMeta}`}>{req.requester?.institution}</p>
                        {req.message && (
                          <p className={`text-sm px-3 py-2 rounded-lg border italic ${t.reqMsg}`}>
                            "{req.message}"
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {req.status === 'pending' && !isCompleted ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleAccept(req._id)} disabled={actionLoading === req._id}
                              className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition">
                              {actionLoading === req._id ? '...' : 'Accept'}
                            </button>
                            <button onClick={() => handleReject(req._id)} disabled={actionLoading === req._id}
                              className="text-xs bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition">
                              {actionLoading === req._id ? '...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                            req.status === 'accepted'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>{req.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Join Modal ── */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${t.modal}`}>
            <h3 className={`text-lg font-semibold mb-1 ${t.modalHeading}`}>Request to Join</h3>
            <p className={`text-sm mb-4 ${t.modalSub}`}>
              Send a message to the project owner explaining why you'd like to join.
            </p>
            {joinError && (
              <div className={`text-sm px-4 py-3 rounded-lg border mb-4 ${t.errorBg}`}>{joinError}</div>
            )}
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Introduce yourself and explain your interest... (optional)"
              rows={4} maxLength={500}
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4 transition ${t.textarea}`}
            />
            <div className="flex gap-3">
              <button onClick={handleJoinSubmit} disabled={joinLoading}
                className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-medium transition">
                {joinLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button onClick={() => { setShowJoinModal(false); setJoinError(''); setJoinMessage('') }}
                className={`flex-1 border py-2.5 rounded-xl text-sm font-medium transition ${t.cancelBtn}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
