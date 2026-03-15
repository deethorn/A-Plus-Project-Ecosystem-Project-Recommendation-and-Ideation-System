import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleProtectedLink = (path) => {
    if (user) {
      navigate(path)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">APPE</Link>

        {/* Nav Links — always visible */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => handleProtectedLink('/dashboard')} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            Dashboard
          </button>
          <button onClick={() => handleProtectedLink('/projects')} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            Projects
          </button>
          <button onClick={() => handleProtectedLink('/recommendations')} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            Recommendations
          </button>
          <button onClick={() => handleProtectedLink('/profile')} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
            Profile
          </button>
        </div>

        {/* Right side — changes based on auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button onClick={() => handleProtectedLink('/notifications')} className="text-xl">
                🔔
              </button>
              <span className="text-sm text-gray-700 font-medium hidden md:inline">
                👋 {user.name}
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          What's The Big
          <span className="text-blue-600"> Idea?</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
          APPE helps university students ideate, post, and collaborate on
          academic projects.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm">
                Get Started
              </Link>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium border border-gray-200 px-6 py-3 rounded-lg">
                Login to Dashboard
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl mb-4">💡</div>
            <h3 className="font-semibold text-gray-800 mb-2">Post Project Ideas</h3>
            <p className="text-sm text-gray-500">
              Share your academic project ideas with the university community and attract the right collaborators.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-800 mb-2">Duplicate Detection</h3>
            <p className="text-sm text-gray-500">
              Our system automatically flags similar existing projects so your idea stays unique and original.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="font-semibold text-gray-800 mb-2">Find Collaborators</h3>
            <p className="text-sm text-gray-500">
              Connect with students who share your interests and build your dream team for any project.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100">
        © 2026 APPE — A Plus Project Ecosystem
      </footer>

    </div>
  )
}
