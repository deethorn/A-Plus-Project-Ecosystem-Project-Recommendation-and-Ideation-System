import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { getNotifications } from '../../services/notificationService'

const IconSun = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const IconMoon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
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

  // Theme-aware class sets
  const nav     = isDark ? 'bg-black border-white/10'    : 'bg-white border-gray-200'
  const logo    = isDark ? 'text-white'                  : 'text-gray-900'
  const link    = isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
  const name    = isDark ? 'text-white/60'               : 'text-gray-600'
  const bell    = isDark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-800'
  const logout_ = isDark
    ? 'border-white/20 hover:bg-white/10 text-white/70 hover:text-white'
    : 'border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
  const toggleBtn = isDark
    ? 'bg-white/10 hover:bg-white/15 text-white/70 border-white/15'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'

  return (
    <nav className={`border-b px-6 py-4 transition-colors duration-300 ${nav}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className={`text-xl font-bold tracking-tight transition-colors ${logo}`}>
          APPE
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className={`text-sm font-medium transition-colors ${link}`}>Dashboard</Link>
          <Link to="/projects" className={`text-sm font-medium transition-colors ${link}`}>Projects</Link>
          <Link to="/recommendations" className={`text-sm font-medium transition-colors ${link}`}>Recommendations</Link>
          <Link to="/profile" className={`text-sm font-medium transition-colors ${link}`}>Profile</Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Dark / Light Toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${toggleBtn}`}
          >
            {isDark ? <IconSun /> : <IconMoon />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Bell */}
          <Link to="/notifications" className={`relative p-1 transition-colors ${bell}`} aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Name */}
          <span className={`text-sm font-medium hidden md:inline ${name}`}>
            {user?.name || 'User'}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`text-sm border px-4 py-2 rounded-lg font-medium transition-colors ${logout_}`}
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}
