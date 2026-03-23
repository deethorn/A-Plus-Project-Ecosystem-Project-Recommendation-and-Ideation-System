import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import { getMyProfile, updateMyProfile } from '../services/userService'

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconAlertCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export default function Profile() {
  const { isDark } = useTheme()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '', bio: '', institution: '',
    skillsInput: '', interestsInput: '',
    skills: [], interests: [],
  })

  const t = {
    page:          isDark ? 'bg-black'                                               : 'bg-gray-50',
    sectionHdr:    isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle:  isDark ? 'text-gray-900'                                          : 'text-white',
    sectionSub:    isDark ? 'text-gray-500'                                          : 'text-white/60',
    card:          isDark ? 'bg-zinc-900 border-white/10'                            : 'bg-white border-gray-200',
    label:         isDark ? 'text-white/70'                                          : 'text-gray-700',
    labelSub:      isDark ? 'text-white/30'                                          : 'text-gray-400',
    input:         isDark ? 'bg-zinc-800 border-white/15 text-white placeholder-white/25 focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-500',
    charCount:     isDark ? 'text-white/25'                                          : 'text-gray-400',
    skillTag:      isDark ? 'bg-white/8 text-white/70 border-white/15'               : 'bg-blue-50 text-blue-600 border-blue-200',
    skillRemove:   isDark ? 'text-white/30 hover:text-red-400'                       : 'text-blue-400 hover:text-red-500',
    interestTag:   isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'  : 'bg-purple-50 text-purple-600 border-purple-200',
    interestRemove:isDark ? 'text-purple-400/50 hover:text-red-400'                  : 'text-purple-400 hover:text-red-500',
    submitBtn:     isDark ? 'bg-white hover:bg-gray-100 text-black disabled:opacity-50' : 'bg-black hover:bg-zinc-800 text-white disabled:opacity-50',
    divider:       isDark ? 'border-white/8'                                         : 'border-gray-100',
    successBg:     isDark ? 'bg-green-500/10 border-green-500/25 text-green-400'     : 'bg-green-50 border-green-200 text-green-700',
    errorBg:       isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    shimmer:       isDark ? 'bg-white/8'                                             : 'bg-gray-200',
    shimmerSub:    isDark ? 'bg-white/5'                                             : 'bg-gray-100',
    metaText:      isDark ? 'text-white/35'                                          : 'text-gray-400',
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile()
        const u = data.user
        setForm({
          name: u.name || '', bio: u.bio || '', institution: u.institution || '',
          skillsInput: '', interestsInput: '',
          skills: u.skills || [], interests: u.interests || [],
        })
      } catch (err) {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = form.skillsInput.trim().replace(',', '')
      if (val && !form.skills.includes(val))
        setForm({ ...form, skills: [...form.skills, val], skillsInput: '' })
    }
  }

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = form.interestsInput.trim().replace(',', '')
      if (val && !form.interests.includes(val))
        setForm({ ...form, interests: [...form.interests, val], interestsInput: '' })
    }
  }

  const removeSkill    = (skill)    => setForm({ ...form, skills: form.skills.filter(s => s !== skill) })
  const removeInterest = (interest) => setForm({ ...form, interests: form.interests.filter(i => i !== interest) })

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      await updateMyProfile({
        name: form.name, bio: form.bio,
        institution: form.institution,
        skills: form.skills, interests: form.interests,
      })
      setSuccess('Profile updated successfully!')
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  // ── Loading ──
  if (loading) return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 space-y-4">
        <div className={`rounded-xl border p-8 animate-pulse ${t.card}`}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-5">
              <div className={`h-3 rounded-lg w-1/4 mb-2 ${t.shimmer}`} />
              <div className={`h-10 rounded-xl w-full ${t.shimmerSub}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 space-y-5">

        {/* ── Header Bar ── */}
        <div className={`rounded-xl px-6 py-4 flex items-center gap-3 ${t.sectionHdr}`}>
          <IconUser />
          <div>
            <h1 className={`text-base font-semibold ${t.sectionTitle}`}>My Profile</h1>
            <p className={`text-xs mt-0.5 ${t.sectionSub}`}>
              Keep your skills and interests updated — they power your recommendations
            </p>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.successBg}`}>
            <IconCheckCircle /> {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${t.errorBg}`}>
            <IconAlertCircle /> {error}
          </div>
        )}

        {/* ── Form Card ── */}
        <div className={`rounded-xl border p-7 ${t.card}`}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                required minLength={2} maxLength={50}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Institution */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Institution</label>
              <input type="text" name="institution" value={form.institution} onChange={handleChange}
                placeholder="e.g. Academic City University"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Bio */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                placeholder="Tell others about yourself..." maxLength={500} rows={3}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition ${t.input}`} />
              <p className={`text-xs mt-1 ${t.charCount}`}>{form.bio.length}/500</p>
            </div>

            {/* Skills */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>
                Skills <span className={`font-normal ${t.labelSub}`}>(press Enter or comma to add)</span>
              </label>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.skills.map(skill => (
                    <span key={skill} className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${t.skillTag}`}>
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className={`transition ${t.skillRemove}`}>
                        <IconX />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input type="text" name="skillsInput" value={form.skillsInput}
                onChange={handleChange} onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React, Python, Machine Learning"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Interests */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>
                Interests <span className={`font-normal ${t.labelSub}`}>(press Enter or comma to add)</span>
              </label>
              {form.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.interests.map(interest => (
                    <span key={interest} className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${t.interestTag}`}>
                      {interest}
                      <button type="button" onClick={() => removeInterest(interest)} className={`transition ${t.interestRemove}`}>
                        <IconX />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input type="text" name="interestsInput" value={form.interestsInput}
                onChange={handleChange} onKeyDown={handleInterestKeyDown}
                placeholder="e.g. AI, Healthcare, Fintech"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Submit */}
            <div className={`pt-2 border-t ${t.divider}`}>
              <button type="submit" disabled={saving}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition ${t.submitBtn}`}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
