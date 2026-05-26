import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import appe from '../assets/appe.svg'
import logo from '../assets/logo.svg'

const IconAlertCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark } = useTheme()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    page:       isDark ? 'bg-black'                                                 : 'bg-gray-50',
    overlay:    isDark ? 'bg-black/80'                                              : 'bg-gray-50/85',
    card:       isDark ? 'bg-zinc-900 border border-white/10'                       : 'bg-white border border-gray-200',
    heading:    isDark ? 'text-white'                                               : 'text-gray-900',
    subtext:    isDark ? 'text-white/40'                                            : 'text-gray-500',
    label:      isDark ? 'text-white/70'                                            : 'text-gray-700',
    inputWrap:  isDark ? 'bg-zinc-800 border-white/15 focus-within:border-white/40' : 'bg-white border-gray-300 focus-within:border-gray-500',
    inputText:  isDark ? 'text-white placeholder-white/25 bg-transparent'          : 'text-gray-800 placeholder-gray-400 bg-transparent',
    iconColor:  isDark ? 'text-white/25'                                            : 'text-gray-400',
    submitBtn:  isDark ? 'bg-white hover:bg-gray-100 text-black disabled:opacity-50' : 'bg-black hover:bg-zinc-800 text-white disabled:opacity-50',
    linkAccent: isDark ? 'text-white hover:text-white/70 font-semibold'             : 'text-gray-900 hover:text-gray-600 font-semibold',
    errorBg:    isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'             : 'bg-red-50 border-red-200 text-red-600',
    divider:    isDark ? 'border-white/8'                                           : 'border-gray-100',
    backBtn:    isDark ? 'text-white/40 hover:text-white/80 hover:bg-white/8'       : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60',
  }

  const location = useLocation()

    useEffect(() => {
      const params = new URLSearchParams(location.search)
      if (params.get('verified') === 'true') {
        setVerifiedMsg(true)
      }
  }, [location])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }
  const [verifiedMsg, setVerifiedMsg] = useState(false)

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 relative overflow-hidden ${t.page}`}>

      {/* ── Background watermark ── */}
      <img
        src={appe}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        style={{ opacity: isDark ? 0.20 : 0.28 }}
      />

      {/* ── Overlay ── */}
      <div className={`absolute inset-0 ${t.overlay}`} />

      {/* ── Back to Home button ── */}
      <Link
        to="/"
        className={`absolute top-5 left-5 z-20 flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition ${t.backBtn}`}
      >
        <IconArrowLeft />
        <span>Back To Home</span>
      </Link>

      {/* ── Foreground content ── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <img src={appe} alt="APPE Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
          <h1 className={`text-2xl font-bold ${t.heading}`}>Sign in to APPE</h1>
          <p className={`text-sm mt-1 ${t.subtext}`}>A Plus Project Ecosystem</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-8 ${t.card}`}>

          {verifiedMsg && (
            <div className={`text-sm px-4 py-3 rounded-xl border mb-5 flex items-center gap-2 ${
              isDark
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-green-50 border-green-200 text-green-600'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 13.01 9 10.01"/>
              </svg>
              Email verified! You can now sign in.
            </div>
          )}

          {error && (
            <div className={`text-sm px-4 py-3 rounded-xl border mb-5 flex items-center gap-2 ${t.errorBg}`}>
              <IconAlertCircle /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Email Address</label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 transition ${t.inputWrap}`}>
                <span className={t.iconColor}><IconMail /></span>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  required placeholder="student@university.edu"
                  className={`flex-1 text-sm outline-none ${t.inputText}`} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Password</label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 transition ${t.inputWrap}`}>
                <span className={t.iconColor}><IconLock /></span>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  required placeholder="••••••••"
                  className={`flex-1 text-sm outline-none ${t.inputText}`} />
              </div>
            </div>

            <div className="pt-1">
              <button type="submit" disabled={loading}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${t.submitBtn}`}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

          </form>

          <div className={`mt-6 pt-5 text-center border-t ${t.divider}`}>
            <p className={`text-sm ${t.subtext}`}>
              Don't have an account?{' '}
              <Link to="/register" className={`transition ${t.linkAccent}`}>
                Register here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login
