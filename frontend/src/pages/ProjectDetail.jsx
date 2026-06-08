import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, removeMember, leaveProject } from '../services/projectService'
import { sendCollaborationRequest, getProjectRequests, acceptRequest, rejectRequest } from '../services/collaborationService'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { getMeetings, scheduleMeeting, updateMeeting, markAttendance, deleteMeeting } from '../services/meetingService'

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
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
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
const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconMore = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
)
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const LEVEL_OPTIONS = ['100 Level', '200 Level', '300 Level', '400 Level']

const PROGRAMME_OPTIONS = [
  'BBA in Accounting', 'BBA in Banking & Finance', 'BBA in Entrepreneurship',
  'BBA in Human Resource Management', 'BBA in Marketing',
  'BA in Advertising & Public Relations', 'BA in Mass Communication & Journalism',
  'BSc in Artificial Intelligence', 'BSc in Computer Science',
  'BSc in Information Technology', 'BSc in Biomedical Engineering',
  'BSc in Computer Engineering', 'BSc in Electrical & Electronics Engineering',
  'BSc in Electronics & Computer Engineering',
  'BSc in Unmanned Aerial Systems (UAS) Engineering',
  'BSc in Industrial & Systems Engineering', 'BSc in Mechanical Engineering',
  'BSc in Nuclear Engineering', 'BSc in Robotics Engineering', 'Other',
]

const DEPARTMENT_OPTIONS = [
  'Department of Informatics',
  'Department of Computational Sciences',
  'Department of Mechanical, Industrial & Systems Engineering',
  'Department of Electrical, Electronics & Computer Engineering',
  'Department of Biomedical Engineering',
  'Department of Business Administration & Entrepreneurship',
  'Department of Communication Arts',
  'Other',
]
const ROLE_ORDER = { owner: 0, hod: 1, supervisor: 2, student: 3, member: 4 }

const sortedMembers = (members, ownerId) =>
  [...members].sort((a, b) => {
    const aOrder = ROLE_ORDER[a.role] ?? 4
    const bOrder = ROLE_ORDER[b.role] ?? 4
    return aOrder - bOrder
  })

// ── RequestCard — outside parent to prevent remount on parent re-render ──
const RequestCard = ({ req, isCompleted, actionLoading, onAccept, onReject, t }) => {
  const [showModal, setShowModal] = useState(false)
  const hasExtra = req.motivation || req.skills || req.interests || req.levelOfStudy || req.programmeOfStudy || req.requestedRole || req.department

  return (
    <>
      {/* ── Compact Card ── */}
      <div className={`border rounded-xl p-4 ${t.reqCard}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${t.reqName}`}>{req.requester?.name}</p>
            <p className={`text-xs mb-2 ${t.reqMeta}`}>{req.requester?.institution}</p>
            {req.message && (
              <p className={`text-sm px-3 py-2 rounded-lg border italic ${t.reqMsg}`}>
                "{req.message}"
              </p>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            {req.status !== 'pending' && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
                req.status === 'accepted'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>{req.status}</span>
            )}
            {(hasExtra || req.status === 'pending') && (
              <button
                onClick={() => setShowModal(true)}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition ${t.reqCard} ${t.reqMeta}`}
              >
                <IconChevronDown /> View Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] ${t.modal}`}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-lg border transition ${t.cancelBtn}`}
            >✕</button>

            {/* Requester Identity */}
            <div className="mb-5 pr-8">
              <p className={`text-base font-semibold ${t.modalHeading}`}>{req.requester?.name}</p>
              {req.requester?.email && <p className={`text-xs ${t.modalSub}`}>{req.requester.email}</p>}
              {req.requester?.institution && <p className={`text-xs ${t.modalSub}`}>{req.requester.institution}</p>}
            </div>

            {/* Detail Rows */}
            <div className="space-y-4 mb-6">
              {req.requestedRole && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Role</p>
                  <p className={`text-sm font-medium capitalize ${t.reqName}`}>{req.requestedRole}</p>
                </div>
              )}
              {req.department && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Department</p>
                  <p className={`text-sm ${t.reqName}`}>{req.department}</p>
                </div>
              )}
              {req.levelOfStudy && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Level of Study</p>
                  <p className={`text-sm ${t.reqName}`}>{req.levelOfStudy}</p>
                </div>
              )}
              {req.programmeOfStudy && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Programme</p>
                  <p className={`text-sm ${t.reqName}`}>{req.programmeOfStudy}</p>
                </div>
              )}
              {(req.skills || req.interests) && (
                <div className="grid grid-cols-2 gap-4">
                  {req.skills && (
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Skills</p>
                      <p className={`text-sm ${t.reqName}`}>{req.skills}</p>
                    </div>
                  )}
                  {req.interests && (
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Interests</p>
                      <p className={`text-sm ${t.reqName}`}>{req.interests}</p>
                    </div>
                  )}
                </div>
              )}
              {req.motivation && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Motivation</p>
                  <p className={`text-sm px-3 py-2 rounded-lg border italic ${t.reqMsg}`}>"{req.motivation}"</p>
                </div>
              )}
              {req.message && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Message</p>
                  <p className={`text-sm px-3 py-2 rounded-lg border italic ${t.reqMsg}`}>"{req.message}"</p>
                </div>
              )}
              {!hasExtra && !req.message && (
                <p className={`text-sm text-center py-2 ${t.reqMeta}`}>No additional information provided.</p>
              )}
            </div>

            {/* Accept / Reject */}
            {req.status === 'pending' && !isCompleted ? (
              <div className="flex gap-3">
                <button
                  onClick={() => { onAccept(req._id); setShowModal(false) }}
                  disabled={actionLoading === req._id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {actionLoading === req._id ? '...' : '✓ Accept'}
                </button>
                <button
                  onClick={() => { onReject(req._id); setShowModal(false) }}
                  disabled={actionLoading === req._id}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {actionLoading === req._id ? '...' : '✕ Reject'}
                </button>
              </div>
            ) : (
              <span className={`inline-block text-xs px-3 py-1.5 rounded-full font-medium border ${
                req.status === 'accepted'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>{req.status}</span>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [project, setProject]                   = useState(null)
  const [requests, setRequests]                 = useState([])
  const [myPendingRequest, setMyPendingRequest] = useState(null) // ← tracks current user's own pending request
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState('')
  const [showJoinModal, setShowJoinModal]       = useState(false)
  const [joinMessage, setJoinMessage]           = useState('')
  const [joinMotivation, setJoinMotivation]     = useState('')
  const [joinSkills, setJoinSkills]             = useState('')
  const [joinInterests, setJoinInterests]       = useState('')
  const [joinRole, setJoinRole]                 = useState('')        // 'student' | 'supervisor' | 'hod'
  const [joinLevelOfStudy, setJoinLevelOfStudy] = useState('')
  const [joinProgrammeOfStudy, setJoinProgrammeOfStudy] = useState('')
  const [joinSupervisorProgrammes, setJoinSupervisorProgrammes] = useState([]) // multi-select for supervisor
  const [joinDepartment, setJoinDepartment]     = useState('')        // single select for HOD
  const [joinLoading, setJoinLoading]           = useState(false)
  const [joinError, setJoinError]               = useState('')
  const [actionLoading, setActionLoading]       = useState(null)
  const [removingMemberId, setRemovingMemberId] = useState(null)
  const [leavingProject, setLeavingProject]     = useState(false)
  const [meetings, setMeetings]                     = useState([])
  const [showScheduleModal, setShowScheduleModal]   = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting]       = useState(null)
  const [openMeetingMenuId, setOpenMeetingMenuId] = useState(null)

  // Schedule form state
 const [mtTitle, setMtTitle]         = useState('')
  const [mtDate, setMtDate]           = useState('')
  const [mtVenue, setMtVenue]         = useState('online')
  const [mtLink, setMtLink]           = useState('')
  const [mtLocation, setMtLocation]   = useState('')
  const [mtAgenda, setMtAgenda]       = useState('')
  const [mtLoading, setMtLoading]     = useState(false)
  const [mtError, setMtError]         = useState('')
  const [isEditingMeeting, setIsEditingMeeting] = useState(false)
  const [editingMeetingId, setEditingMeetingId] = useState(null)
  const [showMeetingDetailsModal, setShowMeetingDetailsModal] = useState(false)

  // Attendance form state
  const [attRecords, setAttRecords]         = useState([])
  const [attRating, setAttRating]           = useState(0)
  const [attLoading, setAttLoading]         = useState(false)

  const userId  = user?.id?.toString() || user?._id?.toString()
  const ownerId = project?.owner?._id?.toString()
  const isOwner = !!(userId && ownerId && userId === ownerId)
  const isTeamMember = project?.teamMembers?.some(
    m => m.user?._id?.toString() === user?.id?.toString() ||
        m.user?._id?.toString() === user?._id?.toString()
  )
  const isCoOwner = !isOwner && project?.teamMembers?.some(
    m =>
      (m.user?._id?.toString() === user?.id?.toString() ||
      m.user?._id?.toString() === user?._id?.toString()) &&
      m.role === 'co-owner'
  )
  const canManage = isOwner || isCoOwner  // shorthand used throughout
  const isCompleted = project?.status === 'completed'
  const isTeamFull  = project?.currentTeamSize >= project?.teamSize

  // ── Derived: does this user already have a pending request? ──
  const hasPendingRequest = !!myPendingRequest

  const t = {
    page:            isDark ? 'bg-black'                                                 : 'bg-gray-50',
    backBtn:         isDark ? 'text-white/40 hover:text-white'                           : 'text-gray-500 hover:text-gray-900',
    card:            isDark ? 'bg-zinc-900 border-white/10'                              : 'bg-white border-gray-200',
    sectionHdr:      isDark ? 'bg-white border border-gray-100'                          : 'bg-black border border-black',
    sectionTitle:    isDark ? 'text-gray-900'                                            : 'text-white',
    heading:         isDark ? 'text-white'                                               : 'text-gray-900',
    subtext:         isDark ? 'text-white/45'                                            : 'text-gray-600',
    metaText:        isDark ? 'text-white/35'                                            : 'text-gray-400',
    divider:         isDark ? 'border-white/8'                                           : 'border-gray-100',
    tag:             isDark ? 'bg-white/8 text-white/55 border-white/10'                 : 'bg-gray-100 text-gray-600 border-gray-100',
    tagCat:          isDark ? 'bg-white/10 text-white/70 border-white/10'                : 'bg-blue-50 text-blue-600 border-blue-100',
    tagSkill:        isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'    : 'bg-purple-50 text-purple-600 border-purple-200',
    statusActive:    isDark ? 'bg-green-500/10 text-green-400 border-green-500/20'       : 'bg-green-50 text-green-600 border-green-200',
    statusDone:      isDark ? 'bg-white/5 text-white/30 border-white/8'                  : 'bg-gray-100 text-gray-400 border-gray-100',
    ownerBadge:      isDark ? 'bg-white/8 text-white/60 border-white/15'                 : 'bg-blue-50 text-blue-700 border-blue-100',
    memberBadge:     isDark ? 'bg-green-500/10 text-green-400 border-green-500/20'       : 'bg-green-50 text-green-700 border-green-200',
    tasksBtn:        isDark ? 'bg-white/8 hover:bg-white/12 text-white/60 border-white/15' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200',
    lockedBadge:     isDark ? 'bg-white/5 text-white/30 border-white/8'                  : 'bg-gray-100 text-gray-400 border-gray-100',
    pendingBadge:    isDark ? 'bg-white text-black'                                      : 'bg-gray-900 text-white',
    memberRow:       isDark ? 'border-white/8'                                           : 'border-gray-100',
    memberName:      isDark ? 'text-white/80'                                            : 'text-gray-700',
    memberRoleBadge: isDark ? 'bg-white/8 text-white/50'                                 : 'bg-gray-100 text-gray-500',
    memberOwnerBadge:isDark ? 'bg-white/10 text-white/70'                                : 'bg-blue-50 text-blue-600',
    reqCard:         isDark ? 'border-white/8 bg-white/3'                                : 'border-gray-100 bg-gray-50',
    reqName:         isDark ? 'text-white/80'                                            : 'text-gray-800',
    reqMeta:         isDark ? 'text-white/35'                                            : 'text-gray-400',
    reqMsg:          isDark ? 'bg-white/5 text-white/50 border-white/8'                  : 'bg-white text-gray-600 border-gray-100',
    completedBanner: isDark ? 'bg-green-500/10 border-green-500/20 text-green-400'       : 'bg-green-50 border-green-200 text-green-700',
    warnBanner:      isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'    : 'bg-orange-50 border-orange-200 text-orange-700',
    errorBg:         isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'             : 'bg-red-50 border-red-200 text-red-600',
    emptyText:       isDark ? 'text-white/30'                                            : 'text-gray-400',
    modal:           isDark ? 'bg-zinc-900 border border-white/15'                       : 'bg-white border border-gray-200',
    modalHeading:    isDark ? 'text-white'                                               : 'text-gray-900',
    modalSub:        isDark ? 'text-white/40'                                            : 'text-gray-500',
    modalLabel:      isDark ? 'text-white/60'                                            : 'text-gray-600',
    textarea:        isDark ? 'bg-zinc-800 border-white/15 text-white placeholder-white/25 focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400',
    select:          isDark ? 'bg-zinc-800 border-white/15 text-white focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 focus:border-gray-500',
    cancelBtn:       isDark ? 'border-white/15 text-white/50 hover:bg-white/5'           : 'border-gray-300 text-gray-600 hover:bg-gray-50',
    timelineBox:     isDark ? 'bg-white/4 border-white/8 text-white/60'                  : 'bg-blue-50 border-blue-100 text-blue-700',
    timelineLabel:   isDark ? 'text-white/35'                                            : 'text-gray-400',
  }

  useEffect(() => {
  let cancelled = false

  const fetchAll = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getProjectById(id)
      if (cancelled) return

      setProject(data.project)

      const uid = user?._id?.toString?.() || user?.id?.toString?.()
      const oid = data.project.owner?._id?.toString?.() || data.project.owner?.id?.toString?.()

      const isOwnerViewer = !!(uid && oid && uid === oid)
      const isMemberViewer = !!(
        uid &&
        data.project.teamMembers?.some(
          m =>
            (m.user?._id?.toString?.() || m.user?.id?.toString?.()) === uid
        )
      )

      if (isOwnerViewer || isMemberViewer) {
        try {
          const meetData = await getMeetings(id)
          if (!cancelled) setMeetings(meetData.meetings || [])
        } catch (meetErr) {
          if (!cancelled) setMeetings([])
        }
      } else {
        if (!cancelled) setMeetings([])
      }

     const isCoOwnerViewer = !isOwnerViewer && !!(
  uid &&
  data.project.teamMembers?.some(
    m =>
      (m.user?._id?.toString?.() || m.user?.id?.toString?.()) === uid &&
      m.role === 'co-owner'
  )
)

    if (isOwnerViewer || isCoOwnerViewer) {
      const reqData = await getProjectRequests(id)
      if (!cancelled) setRequests(reqData.requests || [])
    } else if (uid) {
      try {
        const reqData = await getProjectRequests(id)
        if (!cancelled && reqData.requests) {
          const mine = reqData.requests.find(
            r =>
              (r.requester?._id?.toString?.() || r.requester?.id?.toString?.()) === uid &&
              r.status === 'pending'
          )
          if (mine) setMyPendingRequest(mine)
        }
      } catch (_) {
        // ignore 403 for non-owners
      }
    }
    } catch (err) {
      if (!cancelled) setError('Failed to load project.')
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  fetchAll()
  return () => { cancelled = true }
}, [id, user])


  const handleJoinSubmit = async () => {
    setJoinLoading(true)
    setJoinError('')
    try {
      const result = await sendCollaborationRequest(id, {
        message:              joinMessage,
        motivation:           joinMotivation,
        skills:               joinSkills,
        interests:            joinInterests,
        requestedRole:        joinRole,
        levelOfStudy:         joinRole === 'student'    ? joinLevelOfStudy : '',
        programmeOfStudy:     joinRole === 'student'    ? joinProgrammeOfStudy : joinRole === 'supervisor' ? joinSupervisorProgrammes.join(', ') : '',
        department:           joinRole === 'hod'        ? joinDepartment : '',
      })
      // Store the newly created request directly from the POST response
      // so hasPendingRequest becomes true immediately without needing a re-fetch
      setMyPendingRequest(result.collaborationRequest || result.request || { _id: 'temp', status: 'pending' })
      resetModal()
    } catch (err) {
      // This catches "You have already sent a request" from the backend
      setJoinError(err.response?.data?.message || 'Failed to send request.')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    setActionLoading(requestId)
    try {
      await acceptRequest(requestId)
      const [projData, reqData] = await Promise.all([getProjectById(id), getProjectRequests(id)])
      setProject(projData.project)
      setRequests(reqData.requests)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept.')
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
      alert(err.response?.data?.message || 'Failed to reject.')
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
    if (!window.confirm('Leave this project?')) return
    setLeavingProject(true)
    try {
      await leaveProject(id)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave.')
      setLeavingProject(false)
    }
  }
  const resetMeetingModal = () => {
  setShowScheduleModal(false)
  setIsEditingMeeting(false)
  setEditingMeetingId(null)
  setMtError('')
  setMtTitle('')
  setMtDate('')
  setMtVenue('online')
  setMtLink('')
  setMtLocation('')
  setMtAgenda('')
}

const openEditMeetingModal = (meeting) => {
  setIsEditingMeeting(true)
  setEditingMeetingId(meeting._id || meeting.id)
  setMtTitle(meeting.title || '')
  setMtDate(
    meeting.date
      ? new Date(meeting.date).toISOString().slice(0, 16)
      : ''
  )
  setMtVenue(meeting.venue || 'online')
  setMtLink(meeting.meetingLink || '')
  setMtLocation(meeting.location || '')
  setMtAgenda(meeting.agenda || '')
  setMtError('')
  setShowScheduleModal(true)
}

const openMeetingDetailsModal = (meeting) => {
  setSelectedMeeting(meeting)
  setShowMeetingDetailsModal(true)
}

const handleSaveMeeting = async () => {
  setMtLoading(true)
  setMtError('')

  try {
    const payload = {
      title: mtTitle,
      date: mtDate,
      venue: mtVenue,
      meetingLink: mtVenue === 'online' ? normalizeExternalLink(mtLink) : '',
      location: mtVenue === 'in-person' ? mtLocation : '',
      agenda: mtAgenda
    }

    if (isEditingMeeting && editingMeetingId) {
      const result = await updateMeeting(editingMeetingId, payload)
      setMeetings(prev =>
        prev.map(m => ((m._id || m.id) === editingMeetingId ? result.meeting : m))
      )
    } else {
      const result = await scheduleMeeting(id, payload)
      setMeetings(prev => [result.meeting, ...prev])
    }

    resetMeetingModal()
  } catch (err) {
    setMtError(err.response?.data?.message || 'Failed to save meeting.')
  } finally {
    setMtLoading(false)
  }
 }

  const openAttendanceModal = (meeting) => {
    setSelectedMeeting(meeting)
    setAttRecords(meeting.attendance.map(a => ({ ...a, present: a.present })))
    setAttRating(meeting.progressRating || 0)
    setShowAttendanceModal(true)
  }

  const handleMarkAttendance = async () => {
    setAttLoading(true)
    try {
      const result = await markAttendance(selectedMeeting._id || selectedMeeting.id, {
        attendance: attRecords,
        progressRating: attRating
      })
      setMeetings(prev => prev.map(m => (m._id || m.id) === (selectedMeeting._id || selectedMeeting.id) ? result.meeting : m))
      setShowAttendanceModal(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance.')
    } finally { setAttLoading(false) }
  }

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Delete this meeting?')) return
    try {
      await deleteMeeting(meetingId)
      setMeetings(prev => prev.filter(m => (m._id || m.id) !== meetingId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete meeting.')
    }
  }
  

  const resetModal = () => {
  setShowJoinModal(false)
  setJoinError('')
  setJoinMessage('')
  setJoinMotivation('')
  setJoinSkills('')
  setJoinInterests('')
  setJoinRole('')
  setJoinLevelOfStudy('')
  setJoinProgrammeOfStudy('')
  setJoinSupervisorProgrammes([])
  setJoinDepartment('')
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
    if (isCoOwner) return (
      <>
        <span className={`text-xs px-3 py-2 rounded-lg font-medium border ${t.ownerBadge}`}>Co-Owner</span>
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
    if (isCompleted) return (
      <span className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 ${t.lockedBadge}`}>
        <IconLock /> Completed
      </span>
    )
    if (hasPendingRequest) return (
      <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5">
        <IconClock /> Request Sent
      </span>
    )
    if (isTeamFull) return (
      <span className={`text-xs px-3 py-2 rounded-lg font-medium border flex items-center gap-1.5 ${t.lockedBadge}`}>
        <IconUsers /> Team Full
      </span>
    )
    return (
      <button
        onClick={() => setShowJoinModal(true)}
        className="text-sm px-5 py-2 rounded-lg font-medium bg-white hover:bg-gray-100 text-black transition"
      >
        Request to Join
      </button>
    )
  }

  const normalizeExternalLink = (url = '') => {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return dateStr }
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
  const startDate = formatDate(project.startDate)
  const endDate   = formatDate(project.endDate)

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16 space-y-4">

        <button onClick={() => navigate('/projects')} className={`text-sm flex items-center gap-1.5 transition ${t.backBtn}`}>
          <IconArrowLeft /> Back to Projects
        </button>

        {isCompleted && (
          <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.completedBanner}`}>
            <IconCheck />
            <span>
              <strong>This project has been marked as completed.</strong>
              {isOwner && <span className="opacity-70 ml-1">Go to dashboard to reactivate it.</span>}
            </span>
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

          {/* ── Timeline Banner — shows if ANY date/timeline field exists ── */}
          {(startDate || endDate || project.timeline) && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${t.timelineBox}`}>
              <IconCalendar />
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${t.timelineLabel}`}>Timeline</p>
                {startDate && endDate ? (
                  <p className="text-sm font-medium">
                    {startDate} <span className="opacity-50 mx-1">→</span> {endDate}
                  </p>
                ) : (
                  <p className="text-sm font-medium">{project.timeline || startDate || endDate}</p>
                )}
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
              {sortedMembers(project.teamMembers, ownerId).map((member) => {
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
                      {canManage && !isOwnerRow && !isCompleted && (
                        <button
                          onClick={() => handleRemoveMember(memberId, member.user?.name)}
                          disabled={removingMemberId === memberId}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-2 py-1 rounded-lg disabled:opacity-50 transition"
                        >
                          {removingMemberId === memberId ? '...' : 'Remove'}
                        </button>
                      )}
                      {!isOwner && isSelf && !isCompleted && (
                        <button
                          onClick={handleLeaveProject}
                          disabled={leavingProject}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-2 py-1 rounded-lg disabled:opacity-50 transition flex items-center gap-1"
                        >
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

        {/* ── Meeting Plan ── */}
        {(isOwner || isTeamMember) && (
          <div className={`rounded-xl border p-6 space-y-4 ${t.card}`}>
            <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${t.sectionHdr}`}>
              <div className="flex items-center gap-2">
                <IconCalendar />
                <h2 className={`text-sm font-semibold ${t.sectionTitle}`}>Meeting Plan</h2>
              </div>
              {canManage && !isCompleted && (
                <button
                  onClick={() => {
                    setIsEditingMeeting(false)
                    setEditingMeetingId(null)
                    setMtTitle('')
                    setMtDate('')
                    setMtVenue('online')
                    setMtLink('')
                    setMtLocation('')
                    setMtAgenda('')
                    setMtError('')
                    setShowScheduleModal(true)
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white text-black hover:bg-gray-100 transition"
                >
                  + Schedule Meeting
                </button>
              )}
            </div>

            {meetings.length === 0 ? (
              <div className="py-8 text-center">
                <p className={`text-sm ${t.emptyText}`}>No meetings scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map(meeting => {
                  const isPast = new Date(meeting.date) < new Date()
                  return (
                    <div key={meeting._id || meeting.id} className={`border rounded-xl p-4 ${t.reqCard}`}>
                      <div className="flex items-start justify-between gap-4 relative">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className={`text-sm font-semibold ${t.reqName}`}>{meeting.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              meeting.venue === 'online'
                                ? isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
                                : isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200'
                            }`}>
                              {meeting.venue === 'online' ? 'Online' : ' In-Person'}
                            </span>
                            {meeting.attendanceMarked && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                ✓ Attendance Marked
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${t.reqMeta}`}>
                            {new Date(meeting.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {meeting.venue === 'online' && meeting.meetingLink && (
                            <a href={normalizeExternalLink(meeting.meetingLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-blue-400 hover:underline break-all block mt-1">
                              {meeting.meetingLink}
                            </a>
                          )}
                          {meeting.venue === 'in-person' && meeting.location && (
                            <p className={`text-xs mt-1 ${t.reqMeta}`}> {meeting.location}</p>
                          )}
                          {meeting.progressRating && (
                            <p className={`text-xs mt-1 ${t.reqMeta}`}>
                              Progress: {'★'.repeat(meeting.progressRating)}{'☆'.repeat(5 - meeting.progressRating)}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col gap-2 items-end">
                          <button
                            onClick={() => openMeetingDetailsModal(meeting)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition ${t.tasksBtn}`}
                          >
                            View Details
                          </button>

                          <div className="shrink-0 relative">
                            <button
                              onClick={() =>
                                setOpenMeetingMenuId(prev => prev === meeting._id ? null : meeting._id)
                              }
                              className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border font-medium transition ${
                                isDark
                                  ? 'bg-white/5 hover:bg-white/8 text-white/70 border-white/10'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              <IconMore />
                              Actions
                            </button>

                            {openMeetingMenuId === meeting._id && (
                              <div
                                className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-2xl overflow-hidden z-20 ${
                                  isDark
                                    ? 'bg-zinc-900 border-white/10'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    openMeetingDetailsModal(meeting)
                                    setOpenMeetingMenuId(null)
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition ${
                                    isDark ? 'hover:bg-white/5 text-white/80' : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <IconEye />
                                  View Details
                                </button>

                                {canManage && !isCompleted && (
                                  <button
                                    onClick={() => {
                                      openEditMeetingModal(meeting)
                                      setOpenMeetingMenuId(null)
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition ${
                                      isDark ? 'hover:bg-white/5 text-white/80' : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <IconClipboard />
                                    Edit Meeting
                                  </button>
                                )}

                                {canManage && isPast && (
                                  <button
                                    onClick={() => {
                                      openAttendanceModal(meeting)
                                      setOpenMeetingMenuId(null)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-green-400 hover:bg-green-500/10 transition"
                                  >
                                    <IconCheck />
                                    {meeting.attendanceMarked ? 'Edit Attendance' : 'Mark Attendance'}
                                  </button>
                                )}

                                {canManage && (
                                  <button
                                    onClick={() => {
                                      handleDeleteMeeting(meeting._id)
                                      setOpenMeetingMenuId(null)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-red-400 hover:bg-red-500/10 transition border-t border-white/5"
                                  >
                                    <IconTrash />
                                    Delete Meeting
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Schedule Meeting Modal ── */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] ${t.modal}`}>
              <h3 className={`text-lg font-semibold mb-1 ${t.modalHeading}`}>Schedule Meeting</h3>
              <p className={`text-sm mb-4 ${t.modalSub}`}>Fill in the meeting details below.</p>

              {mtError && <div className={`text-sm px-4 py-3 rounded-lg border mb-4 ${t.errorBg}`}>{mtError}</div>}

              <div className="space-y-3 mb-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Meeting Title <span className="text-red-400">*</span></label>
                  <input type="text" value={mtTitle} onChange={e => setMtTitle(e.target.value)}
                    placeholder="e.g. Sprint Review, Kickoff Meeting"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.textarea}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Date & Time <span className="text-red-400">*</span></label>
                  <input type="datetime-local" value={mtDate} onChange={e => setMtDate(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.select}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${t.modalLabel}`}>Venue <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {['online', 'in-person'].map(v => (
                      <button key={v} type="button" onClick={() => setMtVenue(v)}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition capitalize ${
                          mtVenue === v
                            ? isDark ? 'bg-white text-black border-white' : 'bg-gray-900 text-white border-gray-900'
                            : isDark ? 'border-white/15 text-white/50 hover:bg-white/5' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}>{v === 'online' ? ' Online' : ' In-Person'}</button>
                    ))}
                  </div>
                </div>
                {mtVenue === 'online' && (
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Meeting Link <span className="font-normal opacity-60">(optional)</span></label>
                    <input type="url" value={mtLink} onChange={e => setMtLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.textarea}`} />
                  </div>
                )}
                {mtVenue === 'in-person' && (
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Location <span className="font-normal opacity-60">(optional)</span></label>
                    <input type="text" value={mtLocation} onChange={e => setMtLocation(e.target.value)}
                      placeholder="e.g. Library Room 3, Main Campus"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.textarea}`} />
                  </div>
                )}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Agenda <span className="font-normal opacity-60">(optional)</span></label>
                  <textarea value={mtAgenda} onChange={e => setMtAgenda(e.target.value)}
                    placeholder="What will be discussed in this meeting?"
                    rows={3} maxLength={1000}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition ${t.textarea}`} />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleSaveMeeting}
                  disabled={mtLoading || !mtTitle || !mtDate}
                  className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-medium transition">
                  {mtLoading ? (isEditingMeeting ? 'Saving...' : 'Scheduling...') : (isEditingMeeting ? 'Save Changes' : 'Schedule')}
                </button>
                <button onClick={resetMeetingModal}
                  className={`flex-1 border py-2.5 rounded-xl text-sm font-medium transition ${t.cancelBtn}`}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Attendance Modal ── */}
        {showAttendanceModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] ${t.modal}`}>
              <h3 className={`text-lg font-semibold mb-1 ${t.modalHeading}`}>Mark Attendance</h3>
              <p className={`text-sm mb-4 ${t.modalSub}`}>{selectedMeeting.title} — {new Date(selectedMeeting.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

              <div className="space-y-4 mb-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.reqMeta}`}>Attendance</p>
                  <div className={`border rounded-xl p-3 space-y-2 ${t.reqCard}`}>
                    {attRecords.map((rec, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer py-1">
                        <span className={`text-sm ${t.reqName}`}>
                          {rec.member?.name || `Member ${i + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${rec.present ? 'text-green-400' : t.reqMeta}`}>
                            {rec.present ? 'Present' : 'Absent'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAttRecords(prev => prev.map((r, j) => j === i ? { ...r, present: !r.present } : r))}
                            className={`w-10 h-5 rounded-full transition-colors ${rec.present ? 'bg-green-500' : isDark ? 'bg-white/15' : 'bg-gray-300'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white mx-0.5 transition-transform ${rec.present ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.reqMeta}`}>
                    Progress Rating <span className="font-normal normal-case opacity-60">(did this meeting push the project forward?)</span>
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setAttRating(star)}
                        className={`text-2xl transition ${star <= attRating ? 'text-yellow-400' : isDark ? 'text-white/20' : 'text-gray-300'}`}>
                        ★
                      </button>
                    ))}
                    {attRating > 0 && <span className={`text-xs self-center ml-1 ${t.reqMeta}`}>{attRating}/5</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleMarkAttendance} disabled={attLoading || attRating === 0}
                  className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-medium transition">
                  {attLoading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setShowAttendanceModal(false)}
                  className={`flex-1 border py-2.5 rounded-xl text-sm font-medium transition ${t.cancelBtn}`}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showMeetingDetailsModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] ${t.modal}`}>
              <h3 className={`text-lg font-semibold mb-1 ${t.modalHeading}`}>
                {selectedMeeting.title}
              </h3>

              <p className={`text-sm mb-4 ${t.modalSub}`}>
                {new Date(selectedMeeting.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              <div className="space-y-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Venue</p>
                  <p className={`text-sm ${t.reqName}`}>
                    {selectedMeeting.venue === 'online' ? 'Online' : 'In-Person'}
                  </p>
                </div>

                {selectedMeeting.venue === 'online' && selectedMeeting.meetingLink && (
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Meeting Link</p>
                    <a
                      href={normalizeExternalLink(selectedMeeting.meetingLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline break-all"
                    >
                      {selectedMeeting.meetingLink}
                    </a>
                  </div>
                )}

                {selectedMeeting.venue === 'in-person' && selectedMeeting.location && (
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Location</p>
                    <p className={`text-sm ${t.reqName}`}>{selectedMeeting.location}</p>
                  </div>
                )}

                {selectedMeeting.agenda && (
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${t.reqMeta}`}>Agenda</p>
                    <p className={`text-sm px-3 py-2 rounded-lg border italic ${t.reqMsg}`}>
                      {selectedMeeting.agenda}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowMeetingDetailsModal(false)}
                  className={`w-full border py-2.5 rounded-xl text-sm font-medium transition ${t.cancelBtn}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Collaboration Requests (Owner Only) ── */}
        {canManage && (
          <div className={`rounded-xl border p-6 space-y-4 ${t.card}`}>
            <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${t.sectionHdr}`}>
              <div className="flex items-center gap-2">
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
                  <RequestCard
                    key={req._id}
                    req={req}
                    isCompleted={isCompleted}
                    actionLoading={actionLoading}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Join Modal ── */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] ${t.modal}`}>
            <h3 className={`text-lg font-semibold mb-1 ${t.modalHeading}`}>Request to Join</h3>
            <p className={`text-sm mb-4 ${t.modalSub}`}>Fill in the details below to send your collaboration request.</p>

            {joinError && (
              <div className={`text-sm px-4 py-3 rounded-lg border mb-4 ${t.errorBg}`}>{joinError}</div>
            )}

            <div className="space-y-3 mb-4">

              {/* ── Role Selection ── */}
              <div>
                <label className={`block text-xs font-medium mb-2 ${t.modalLabel}`}>
                  I am joining as <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'student',    label: 'Student' },
                    { value: 'supervisor', label: 'Supervisor' },
                    { value: 'hod',        label: 'HOD' },
                    { value: 'co-owner',   label: 'Co-Owner' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setJoinRole(value)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                        joinRole === value
                          ? isDark
                            ? 'bg-white text-black border-white'
                            : 'bg-gray-900 text-white border-gray-900'
                          : isDark
                            ? 'border-white/15 text-white/50 hover:bg-white/5'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Student Fields ── */}
              {joinRole === 'student' && (
                <>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Level of Study</label>
                    <select
                      value={joinLevelOfStudy}
                      onChange={(e) => setJoinLevelOfStudy(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.select}`}
                    >
                      <option value="">Select level...</option>
                      {LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Programme of Study</label>
                    <select
                      value={joinProgrammeOfStudy}
                      onChange={(e) => setJoinProgrammeOfStudy(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.select}`}
                    >
                      <option value="">Select programme...</option>
                      {PROGRAMME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* ── Supervisor Fields ── */}
              {joinRole === 'supervisor' && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>
                    Programmes you supervise
                    <span className={`font-normal ml-1 opacity-60`}>(select all that apply)</span>
                  </label>
                  <div className={`border rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto ${t.select}`}>
                    {PROGRAMME_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={joinSupervisorProgrammes.includes(opt)}
                          onChange={(e) => {
                            setJoinSupervisorProgrammes(prev =>
                              e.target.checked ? [...prev, opt] : prev.filter(p => p !== opt)
                            )
                          }}
                          className="w-3.5 h-3.5 accent-current shrink-0"
                        />
                        <span className={`text-xs ${t.modalLabel}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                  {joinSupervisorProgrammes.length > 0 && (
                    <p className={`text-xs mt-1.5 ${t.reqMeta}`}>
                      {joinSupervisorProgrammes.length} programme{joinSupervisorProgrammes.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* ── HOD Fields ── */}
              {joinRole === 'hod' && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>Department</label>
                  <select
                    value={joinDepartment}
                    onChange={(e) => setJoinDepartment(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.select}`}
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {/* ── Co-Owner Fields ── */}
              {joinRole === 'co-owner' && (
                <div className={`text-xs px-3 py-2.5 rounded-xl border ${
                  isDark
                    ? 'border-white/10 text-white/40 bg-white/3'
                    : 'border-gray-100 text-gray-400 bg-gray-50'
                }`}>
                  Requesting co-ownership gives you owner-level access to manage this project once the owner accepts your request.
                </div>
              )}

              {/* ── Common Fields (shown after role is picked) ── */}
              {joinRole && (
                <>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>
                      Message <span className="font-normal opacity-60">(optional)</span>
                    </label>
                    <textarea
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      placeholder="Anything else you'd like the project owner to know..."
                      rows={2} maxLength={500}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition ${t.textarea}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>
                      Skills <span className="font-normal opacity-60">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={joinSkills}
                      onChange={(e) => setJoinSkills(e.target.value)}
                      placeholder="e.g. React, Python, Machine Learning"
                      maxLength={300}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${t.textarea}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${t.modalLabel}`}>
                      Motivation <span className="font-normal opacity-60">(optional)</span>
                    </label>
                    <textarea
                      value={joinMotivation}
                      onChange={(e) => setJoinMotivation(e.target.value)}
                      placeholder="Why do you want to join this project?"
                      rows={3} maxLength={500}
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none transition ${t.textarea}`}
                    />
                  </div>
                </>
              )}

            </div>

            <div className="flex gap-3">
              <button
                onClick={handleJoinSubmit}
                disabled={joinLoading || !joinRole}
                className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-black py-2.5 rounded-xl text-sm font-medium transition"
              >
                {joinLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={resetModal}
                className={`flex-1 border py-2.5 rounded-xl text-sm font-medium transition ${t.cancelBtn}`}
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