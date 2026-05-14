import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../services/projectService'
import { useTheme } from '../context/ThemeContext'

const CATEGORIES = [
  'Accounting', 'Banking & Finance', 'Entrepreneurship', 'Human Resource Management', 'Marketing', 'Advertising & Public Relations', 
  'Mass Communication & Journalism', 'Artificial Intelligence', 'Computer Science', 'Information Technology', 'Biomedical Engineering', 
  'Computer Engineering', 'Electrical & Electronics Engineering', 'Electronics & Computer Engineering', 'Unmanned Aerial Systems (UAS) Engineering', 
  'Industrial & Systems Engineering', 'Mechanical Engineering', 'Nuclear Engineering', 'Robotics Engineering', 'Other',
]

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconAlertCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconAlertTriangle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

export default function PostProject() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [projectResult, setProjectResult] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', category: '', teamSize: '',
    skillsNeeded: '', tags: '', isAnonymous: false,
    startDate: '', endDate: '',
  })

  const t = {
    page:         isDark ? 'bg-black'                                               : 'bg-gray-50',
    backBtn:      isDark ? 'text-white/40 hover:text-white'                         : 'text-gray-500 hover:text-gray-900',
    heading:      isDark ? 'text-white'                                             : 'text-gray-900',
    subtext:      isDark ? 'text-white/40'                                          : 'text-gray-500',
    card:         isDark ? 'bg-zinc-900 border-white/10'                            : 'bg-white border-gray-200',
    sectionHdr:   isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle: isDark ? 'text-gray-900'                                          : 'text-white',
    label:        isDark ? 'text-white/70'                                          : 'text-gray-700',
    labelSub:     isDark ? 'text-white/30'                                          : 'text-gray-400',
    input:        isDark ? 'bg-zinc-800 border-white/15 text-white placeholder-white/25 focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-500',
    select:       isDark ? 'bg-zinc-800 border-white/15 text-white focus:border-white/40' : 'bg-white border-gray-300 text-gray-800 focus:border-gray-500',
    checkLabel:   isDark ? 'text-white/60'                                          : 'text-gray-700',
    submitBtn:    isDark ? 'bg-white hover:bg-gray-100 text-black disabled:opacity-50' : 'bg-black hover:bg-zinc-800 text-white disabled:opacity-50',
    cancelBtn:    isDark ? 'border-white/15 text-white/50 hover:bg-white/5'         : 'border-gray-300 text-gray-600 hover:bg-gray-50',
    errorBg:      isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    divider:      isDark ? 'border-white/8'                                         : 'border-gray-100',
    similarRow:   isDark ? 'bg-white/5 border-white/8 text-white/60'                : 'bg-gray-50 border-gray-100 text-gray-700',
    actionBtn:    isDark ? 'border-white/15 text-white/50 hover:bg-white/8'         : 'border-gray-200 text-gray-600 hover:bg-gray-50',
    metaText:     isDark ? 'text-white/35'                                          : 'text-gray-400',
    timelineBox:  isDark ? 'bg-white/4 border-white/8 text-white/60'                : 'bg-blue-50 border-blue-100 text-blue-700',
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const data = await createProject({
        title: form.title,
        description: form.description,
        category: form.category,
        teamSize: Number(form.teamSize),
        skillsNeeded: form.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean),
        isAnonymous: form.isAnonymous,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      })
      setProjectResult(data.project); setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to post project.')
    } finally { setLoading(false) }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  }

  // ── Score Result Screen ──
  if (submitted && projectResult) {
    const score = projectResult.duplicateScore ?? 0
    const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

    const scoreConfig = {
      high: {
        icon: <IconAlertCircle />,
        iconCls: 'text-red-400',
        border: isDark ? 'border-red-500/30 bg-red-500/8' : 'border-red-200 bg-red-50',
        valueCls: isDark ? 'text-red-400' : 'text-red-600',
        label: 'High Similarity',
        msg: 'Your project is highly similar to existing ones. Consider revising your title and description to make it more unique.',
      },
      medium: {
        icon: <IconAlertTriangle />,
        iconCls: 'text-orange-400',
        border: isDark ? 'border-orange-500/30 bg-orange-500/8' : 'border-orange-200 bg-orange-50',
        valueCls: isDark ? 'text-orange-400' : 'text-orange-600',
        label: 'Moderate Similarity',
        msg: 'Your project shares some similarities with existing projects. Review related ones before proceeding.',
      },
      low: {
        icon: <IconCheck />,
        iconCls: 'text-green-400',
        border: isDark ? 'border-green-500/30 bg-green-500/8' : 'border-green-200 bg-green-50',
        valueCls: isDark ? 'text-green-400' : 'text-green-600',
        label: 'Original Idea',
        msg: 'Great! Your project idea appears to be unique in the system.',
      },
    }[level]

    const resStart = formatDate(projectResult.startDate)
    const resEnd   = formatDate(projectResult.endDate)

    return (
      <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
        <div className="max-w-2xl mx-auto px-6 pt-8 pb-16">
          <div className={`rounded-2xl border p-8 ${t.card}`}>

            {/* Success header */}
            <div className={`rounded-xl px-5 py-4 mb-8 flex items-center gap-3 ${t.sectionHdr}`}>
              <div className={t.sectionTitle === 'text-gray-900' ? 'text-gray-700' : 'text-white/70'}>
                <IconCheck />
              </div>
              <div>
                <p className={`font-semibold ${t.sectionTitle}`}>Project Posted Successfully</p>
                <p className={`text-xs mt-0.5 ${t.sectionTitle} opacity-60`}>"{projectResult.title}"</p>
              </div>
            </div>

            {/* Timeline display on result */}
            {(resStart || resEnd) && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${t.timelineBox}`}>
                <IconCalendar />
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${t.metaText}`}>Timeline</p>
                  {resStart && resEnd ? (
                    <p className="text-sm font-medium">{resStart} <span className="opacity-50 mx-1">→</span> {resEnd}</p>
                  ) : (
                    <p className="text-sm font-medium">{resStart || resEnd}</p>
                  )}
                </div>
              </div>
            )}

            {/* Duplicate Score Card */}
            <div className={`border rounded-xl p-6 mb-6 text-center ${scoreConfig.border}`}>
              <div className={`flex justify-center mb-3 ${scoreConfig.iconCls}`}>
                {scoreConfig.icon}
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${scoreConfig.valueCls}`}>
                Duplicate Detection Result
              </p>
              <p className={`text-5xl font-bold mb-1 ${scoreConfig.valueCls}`}>{score}%</p>
              <p className={`text-sm font-medium mb-3 ${scoreConfig.valueCls}`}>{scoreConfig.label}</p>
              <p className={`text-xs ${t.metaText}`}>{scoreConfig.msg}</p>
            </div>

            {/* Similar Projects */}
            {projectResult.similarProjects?.length > 0 && (
              <div className="mb-6">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${t.metaText}`}>
                  Similar Existing Projects
                </p>
                <div className="space-y-2">
                  {projectResult.similarProjects.slice(0, 3).map((item, i) => (
                    <div key={i} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${t.similarRow}`}>
                      <span className="text-sm truncate pr-4">{item.project?.title || item.title}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                        item.similarityScore >= 70 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        item.similarityScore >= 40 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        isDark ? 'bg-white/8 text-white/40 border-white/10' : 'bg-gray-100 text-gray-500 border-gray-100'
                      }`}>
                        {item.similarityScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-3 pt-4 border-t ${t.divider}`}>
              <button onClick={() => navigate(`/projects/${projectResult._id}`)}
                className={`flex-1 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-medium transition ${t.submitBtn}`}>
                <IconEye /> View Project
              </button>
              <button onClick={() => navigate('/projects')}
                className={`flex-1 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-medium border transition ${t.actionBtn}`}>
                <IconGrid /> Browse Projects
              </button>
              <button onClick={() => navigate('/dashboard')}
                className={`flex-1 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-medium border transition ${t.actionBtn}`}>
                <IconHome /> Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ──
  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16 space-y-5">

        <button onClick={() => navigate('/projects')} className={`text-sm flex items-center gap-1.5 transition ${t.backBtn}`}>
          <IconArrowLeft /> Back to Projects
        </button>

        {/* Header Bar */}
        <div className={`rounded-xl px-6 py-4 ${t.sectionHdr}`}>
          <h1 className={`text-base font-semibold ${t.sectionTitle}`}>Post a Project</h1>
          <p className={`text-xs mt-0.5 ${t.sectionTitle} opacity-60`}>Share your project idea with the university community.</p>
        </div>

        {/* Form Card */}
        <div className={`rounded-xl border p-7 ${t.card}`}>
          {error && (
            <div className={`text-sm px-4 py-3 rounded-xl border mb-6 ${t.errorBg}`}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Project Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. AI-Powered Student Feedback System"
                required minLength={5} maxLength={100}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your project idea in detail (minimum 20 characters)..."
                required minLength={20} maxLength={2000} rows={4}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none resize-none transition ${t.input}`} />
            </div>

            {/* Category + Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.select}`}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>Team Size *</label>
                <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange}
                  placeholder="e.g. 3" min={1} max={10} required
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
              </div>
            </div>

            {/* Timeline — Start Date + End Date */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>
                Timeline <span className={`font-normal ${t.labelSub}`}>(optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs mb-1 ${t.labelSub}`}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${t.labelSub}`}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate || undefined}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>
                Skills Needed <span className={`font-normal ${t.labelSub}`}>(comma-separated)</span>
              </label>
              <input type="text" name="skillsNeeded" value={form.skillsNeeded} onChange={handleChange}
                placeholder="e.g. React, Python, Machine Learning"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${t.label}`}>
                Tags <span className={`font-normal ${t.labelSub}`}>(comma-separated)</span>
              </label>
              <input type="text" name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g. ai, healthcare, fintech"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${t.input}`} />
            </div>

            {/* Anonymous toggle */}
            <div className={`flex items-center gap-3 py-3 px-4 rounded-xl border ${isDark ? 'border-white/8 bg-white/3' : 'border-gray-100 bg-gray-50'}`}>
              <input type="checkbox" name="isAnonymous" id="isAnonymous"
                checked={form.isAnonymous} onChange={handleChange}
                className="w-4 h-4 accent-current" />
              <label htmlFor="isAnonymous" className={`text-sm cursor-pointer ${t.checkLabel}`}>
                Post anonymously — your name will be hidden from other users
              </label>
            </div>

            {/* Buttons */}
            <div className={`flex gap-3 pt-2 border-t ${t.divider}`}>
              <button type="submit" disabled={loading}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition ${t.submitBtn}`}>
                {loading ? 'Checking for duplicates...' : 'Post Project'}
              </button>
              <button type="button" onClick={() => navigate('/projects')}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition ${t.cancelBtn}`}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}