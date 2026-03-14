import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService'

const TYPE_ICONS = {
  collaboration_request: '🤝',
  request_accepted: '✅',
  request_rejected: '❌',
  project_update: '📝',
  team_member_joined: '👥',
  team_member_left: '👋',
  project_comment: '💬',
  mention: '📣',
  system: '🔔',
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id)
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        // silent fail — non-critical
      }
    }

    // Navigate if there's a related project
    if (notification.relatedProject?._id) {
      navigate(`/projects/${notification.relatedProject._id}`)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      alert('Failed to mark all as read.')
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation() // prevent triggering handleClick
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (err) {
      alert('Failed to delete notification.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-4 py-2 rounded-lg"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Loading notifications...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">
            You'll be notified when someone requests to join your project.
          </p>
        </div>
      )}

      {/* Notification List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleClick(notification)}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${
                notification.isRead
                  ? 'bg-white border-gray-200 hover:border-gray-300'
                  : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              {/* Icon */}
              <div className="text-2xl mt-0.5 shrink-0">
                {TYPE_ICONS[notification.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${
                    notification.isRead ? 'text-gray-700' : 'text-gray-900'
                  }`}>
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {notification.message}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">
                    {timeAgo(notification.createdAt)}
                  </span>
                  {notification.relatedProject?.title && (
                    <span className="text-xs text-blue-500">
                      📁 {notification.relatedProject.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(e, notification._id)}
                className="shrink-0 text-gray-300 hover:text-red-400 text-lg transition"
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
