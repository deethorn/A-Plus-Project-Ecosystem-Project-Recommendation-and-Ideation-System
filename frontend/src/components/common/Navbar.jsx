import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getNotifications } from '../../services/notificationService'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getNotifications({ unreadOnly: true, limit: 1 })
        setUnreadCount(data.unreadCount)
      } catch (err) {
        // silent fail
      }
    }
    fetchUnread()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          APPE
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            Projects
          </Link>
          <Link
            to="/recommendations"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            Recommendations
          </Link>
          <Link
            to="/profile"
            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            Profile
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Notification Bell */}
          <Link to="/notifications" className="relative">
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Name */}
          <span className="text-sm text-gray-700 font-medium">
            👋 {user?.name || 'User'}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}
