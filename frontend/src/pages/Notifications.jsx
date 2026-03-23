import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService'

// ── Icons ──────────────────────────────────────────────────────
const IconHandshake = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconXCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconUserMinus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
)
const IconMessageCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconAtSign = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
  </svg>
)
const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconBellLarge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconFolder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
// ──────────────────────────────────────────────────────────────

const TYPE_ICONS = {
  collaboration_request: <IconHandshake />,
  request_accepted:      <IconCheckCircle />,
  request_rejected:      <IconXCircle />,
  project_update:        <IconFileText />,
  team_member_joined:    <IconUsers />,
  team_member_left:      <IconUserMinus />,
  project_comment:       <IconMessageCircle />,
  mention:               <IconAtSign />,
  system:                <IconBell />,
}

const TYPE_COLORS = {
  collaboration_request: { dark: 'text-blue-400 bg-blue-500/10',   light: 'text-blue-600 bg-blue-50' },
  request_accepted:      { dark: 'text-green-400 bg-green-500/10', light: 'text-green-600 bg-green-50' },
  request_rejected:      { dark: 'text-red-400 bg-red-500/10',     light: 'text-red-600 bg-red-50' },
  project_update:        { dark: 'text-white/50 bg-white/8',       light: 'text-gray-600 bg-gray-100' },
  team_member_joined:    { dark: 'text-green-400 bg-green-500/10', light: 'text-green-600 bg-green-50' },
  team_member_left:      { dark: 'text-orange-400 bg-orange-500/10',light: 'text-orange-600 bg-orange-50' },
  project_comment:       { dark: 'text-purple-400 bg-purple-500/10',light: 'text-purple-600 bg-purple-50' },
  mention:               { dark: 'text-yellow-400 bg-yellow-500/10',light: 'text-yellow-600 bg-yellow-50' },
  system:                { dark: 'text-white/50 bg-white/8',       light: 'text-gray-600 bg-gray-100' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const t = {
    page:          isDark ? 'bg-black'                                               : 'bg-gray-50',
    sectionHdr:    isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle:  isDark ? 'text-gray-900'                                          : 'text-white',
    sectionSub:    isDark ? 'text-gray-500'                                          : 'text-white/60',
    markAllBtn:    isDark ? 'border-gray-300 text-gray-600 hover:bg-gray-100'        : 'border-gray-200 text-gray-600 hover:bg-gray-100',
    cardUnread:    isDark ? 'bg-zinc-800 border-white/15 hover:border-white/30'      : 'bg-blue-50 border-blue-200 hover:border-blue-300',
    cardRead:      isDark ? 'bg-zinc-900 border-white/8 hover:border-white/18'       : 'bg-white border-gray-200 hover:border-gray-300',
    titleUnread:   isDark ? 'text-white'                                             : 'text-gray-900',
    titleRead:     isDark ? 'text-white/60'                                          : 'text-gray-700',
    message:       isDark ? 'text-white/40'                                          : 'text-gray-500',
    metaText:      isDark ? 'text-white/25'                                          : 'text-gray-400',
    folderLink:    isDark ? 'text-white/40 flex items-center gap-1'                  : 'text-blue-500 flex items-center gap-1',
    deleteBtn:     isDark ? 'text-white/15 hover:text-red-400 hover:bg-red-500/10'   : 'text-gray-300 hover:text-red-400 hover:bg-red-50',
    unreadDot:     'bg-blue-500',
    errorBg:       isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    emptyText:     isDark ? 'text-white/30'                                          : 'text-gray-400',
    emptyTitle:    isDark ? 'text-white/50'                                          : 'text-gray-500',
    shimmer:       isDark ? 'bg-white/8'                                             : 'bg-gray-200',
    shimmerSub:    isDark ? 'bg-white/5'                                             : 'bg-gray-100',
    card:          isDark ? 'bg-zinc-900 border-white/10'                            : 'bg-white border-gray-200',
  }

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id)
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch {}
    }
    if (notification.relatedProject?._id)
      navigate(`/projects/${notification.relatedProject._id}`)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { alert('Failed to mark all as read.') }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch { alert('Failed to delete notification.') }
  }

  const getIconStyle = (type, isDark) => {
    const config = TYPE_COLORS[type] || TYPE_COLORS.system
    return isDark ? config.dark : config.light
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 space-y-5">

        {/* ── Header Bar ── */}
        <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
          <div>
            <h1 className={`text-base font-semibold ${t.sectionTitle}`}>Notifications</h1>
            {unreadCount > 0 && (
              <p className={`text-xs mt-0.5 ${t.sectionSub}`}>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${t.markAllBtn}`}>
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`rounded-xl border p-4 animate-pulse flex gap-4 ${t.card}`}>
                <div className={`w-9 h-9 rounded-xl shrink-0 ${t.shimmer}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 rounded-lg w-2/5 ${t.shimmer}`} />
                  <div className={`h-3 rounded-lg w-3/4 ${t.shimmerSub}`} />
                  <div className={`h-3 rounded-lg w-1/4 ${t.shimmerSub}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className={`text-sm px-4 py-3 rounded-xl border ${t.errorBg}`}>{error}</div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && notifications.length === 0 && (
          <div className={`rounded-xl border p-16 text-center ${t.card}`}>
            <div className={`flex justify-center mb-3 ${t.emptyText}`}><IconBellLarge /></div>
            <p className={`font-medium ${t.emptyTitle}`}>No notifications yet</p>
            <p className={`text-sm mt-1 ${t.emptyText}`}>
              You'll be notified when someone requests to join your project.
            </p>
          </div>
        )}

        {/* ── Notification List ── */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleClick(notification)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${
                  notification.isRead ? t.cardRead : t.cardUnread
                }`}
              >
                {/* Icon badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getIconStyle(notification.type, isDark)}`}>
                  {TYPE_ICONS[notification.type] || <IconBell />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notification.isRead ? t.titleRead : t.titleUnread}`}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${t.unreadDot}`} />
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 ${t.message}`}>{notification.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs ${t.metaText}`}>{timeAgo(notification.createdAt)}</span>
                    {notification.relatedProject?.title && (
                      <span className={`text-xs ${t.folderLink}`}>
                        <IconFolder /> {notification.relatedProject.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(e, notification._id)}
                  className={`shrink-0 p-1.5 rounded-lg transition ${t.deleteBtn}`}
                  title="Delete"
                >
                  <IconX />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
