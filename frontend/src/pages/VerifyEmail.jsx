import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import appe from '../assets/appe.svg'
import api from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const hasVerifiedRef = useRef(false)

 useEffect(() => {
  if (hasVerifiedRef.current) return;

  const token = searchParams.get('token');

  if (!token) {
    setStatus('error');
    return;
  }

  hasVerifiedRef.current = true;

  api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    .then((res) => {
      if (res.data?.success) {
        setStatus('success');
        setTimeout(() => navigate('/login?verified=true'), 2500);
      } else {
        setStatus('error');
      }
    })
    .catch(() => {
      setStatus('error');
    });
 }, [searchParams, navigate]);

  const t = {
    page:    isDark ? 'bg-black' : 'bg-gray-50',
    card:    isDark ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-gray-200',
    heading: isDark ? 'text-white' : 'text-gray-900',
    sub:     isDark ? 'text-white/40' : 'text-gray-500',
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${t.page}`}>
      <div className={`rounded-2xl p-10 w-full max-w-sm text-center ${t.card}`}>
        <img src={appe} alt="APPE" className="w-12 h-12 mx-auto mb-6 object-contain" />

        {status === 'verifying' && (
          <>
            <h2 className={`text-lg font-semibold mb-2 ${t.heading}`}>Verifying your email...</h2>
            <p className={`text-sm ${t.sub}`}>Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 13.01 9 10.01"/>
              </svg>
            </div>
            <h2 className={`text-lg font-semibold mb-2 ${t.heading}`}>Email verified!</h2>
            <p className={`text-sm ${t.sub}`}>Redirecting you to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2 className={`text-lg font-semibold mb-2 ${t.heading}`}>Link invalid or expired</h2>
            <p className={`text-sm mb-6 ${t.sub}`}>This verification link has expired or already been used. Please register again.</p>
            <button onClick={() => navigate('/register')}
              className={`w-full py-2.5 rounded-xl text-sm font-medium ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
  )
}