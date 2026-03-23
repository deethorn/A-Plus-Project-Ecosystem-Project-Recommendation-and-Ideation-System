import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { LampContainer } from '@/components/ui/lamp'

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
    <div className="min-h-screen bg-black">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black sticky top-0 z-50">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          APPE
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleProtectedLink('/dashboard')}
            className="text-sm text-white/80 hover:text-white font-medium transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => handleProtectedLink('/projects')}
            className="text-sm text-white/80 hover:text-white font-medium transition"
          >
            Projects
          </button>
          <button
            onClick={() => handleProtectedLink('/recommendations')}
            className="text-sm text-white/80 hover:text-white font-medium transition"
          >
            Recommendations
          </button>
          <button
            onClick={() => handleProtectedLink('/profile')}
            className="text-sm text-white/80 hover:text-white font-medium transition"
          >
            Profile
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => handleProtectedLink('/notifications')}
                className="text-white/80 hover:text-white transition p-1"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <span className="text-sm text-white/70 font-medium hidden md:inline">
                {user.name}
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm bg-white hover:bg-white/90 text-black px-4 py-2 rounded-lg font-medium transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="text-sm border border-white/30 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-white/80 hover:text-white font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-white hover:bg-white/90 text-black px-4 py-2 rounded-lg font-medium transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── LAMP HERO ── */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0.5, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="flex flex-col items-center text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            What's The Big Idea?
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/75 max-w-xl leading-relaxed">
            APPE helps university students ideate, post, and collaborate on academic projects.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-white hover:bg-white/90 text-black px-7 py-3 rounded-lg font-semibold text-sm transition"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white hover:bg-white/90 text-black px-7 py-3 rounded-lg font-semibold text-sm transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-7 py-3 rounded-lg font-medium transition"
                >
                  Login to Dashboard
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </LampContainer>

      {/* ── FEATURES SECTION ── */}
      <section className="py-20 px-6 bg-black -mt-40">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-white/40 uppercase tracking-widest mb-12 font-medium">
            Everything you need to ship your idea
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Post Project */}
            <div className="bg-zinc-950 rounded-xl border border-white/10 p-6 hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] transition cursor-default">
              <div className="mb-4 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {/* Lightbulb SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/><path d="M10 22h4"/>
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Post Project</h3>
              <p className="text-sm text-white/55 leading-relaxed">
                Share your academic project ideas with the university community and attract the right collaborators.
              </p>
            </div>

            {/* Duplicate Detection */}
            <div className="bg-zinc-950 rounded-xl border border-white/10 p-6 hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] transition cursor-default">
              <div className="mb-4 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {/* Search/scan SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <path d="M11 8v6"/><path d="M8 11h6"/>
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Duplicate Detection</h3>
              <p className="text-sm text-white/55 leading-relaxed">
                Our system automatically flags similar existing projects so your idea stays unique and original.
              </p>
            </div>

            {/* Find Collaborators */}
            <div className="bg-zinc-950 rounded-xl border border-white/10 p-6 hover:border-white/25 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] transition cursor-default">
              <div className="mb-4 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                {/* Users SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Find Collaborators</h3>
              <p className="text-sm text-white/55 leading-relaxed">
                Connect with students who share your interests and build your dream team for any project.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="text-center py-8 text-xs text-white/30 border-t border-white/10 bg-black">
        © 2026 APPE — A Plus Project Ecosystem
      </footer>

    </div>
  )
}
