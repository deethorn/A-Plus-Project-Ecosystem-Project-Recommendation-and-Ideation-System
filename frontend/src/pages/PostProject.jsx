import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../services/projectService'

const CATEGORIES = [
  'Web Development', 'Mobile App', 'Machine Learning', 'Data Science',
  'IoT', 'Game Development', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'Other',
]

export default function PostProject() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // NEW: capture result after submission
  const [submitted, setSubmitted] = useState(false)
  const [projectResult, setProjectResult] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    teamSize: '',
    skillsNeeded: '',
    tags: '',
    isAnonymous: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await createProject({
        title: form.title,
        description: form.description,
        category: form.category,
        teamSize: Number(form.teamSize),
        skillsNeeded: form.skillsNeeded.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        isAnonymous: form.isAnonymous,
      })

      // ✅ Capture the result and show score instead of immediately navigating
      setProjectResult(data.project)
      setSubmitted(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to post project. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ✅ Score result screen shown after submission
  if (submitted && projectResult) {
    const score = projectResult.duplicateScore ?? 0

    const scoreColor =
      score >= 70 ? 'red' :
      score >= 40 ? 'orange' :
      'green'

    const scoreConfig = {
      red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    label: 'High Similarity', icon: '🚨' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Moderate Similarity', icon: '⚠️' },
      green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  label: 'Original Idea', icon: '✅' },
    }[scoreColor]

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">

          {/* Success */}
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Project Posted!</h2>
          <p className="text-sm text-gray-500 mb-8">
            "{projectResult.title}" has been submitted successfully.
          </p>

          {/* Duplicate Score Card */}
          <div className={`${scoreConfig.bg} ${scoreConfig.border} border rounded-xl p-6 mb-8`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">{scoreConfig.icon}</span>
              <span className={`text-sm font-semibold ${scoreConfig.text}`}>
                Duplicate Detection Result
              </span>
            </div>

            {/* Score Circle */}
            <div className={`text-5xl font-bold ${scoreConfig.text} mb-2`}>
              {score}%
            </div>
            <p className={`text-sm font-medium ${scoreConfig.text} mb-2`}>
              {scoreConfig.label}
            </p>
            <p className="text-xs text-gray-500">
              {score >= 70
                ? 'Your project is highly similar to existing ones. Consider revising your title and description to make it more unique.'
                : score >= 40
                ? 'Your project shares some similarities with existing projects. Review related projects before proceeding.'
                : 'Great! Your project idea appears to be unique in the system.'}
            </p>
          </div>

          {/* Similar Projects if any */}
          {projectResult.similarProjects?.length > 0 && (
            <div className="text-left mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Similar Existing Projects</h3>
              <div className="space-y-2">
                {projectResult.similarProjects.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <span className="text-sm text-gray-700 truncate pr-4">
                      {item.project?.title || item.title}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                      item.similarityScore >= 70 ? 'bg-red-100 text-red-600' :
                      item.similarityScore >= 40 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {item.similarityScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/projects/${projectResult._id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
            >
              View Project
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium"
            >
              Browse Projects
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Post a Project</h1>
        <p className="text-gray-500 mt-1">Share your project idea with the university community.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. AI-Powered Student Feedback System" required minLength={5} maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Describe your project idea in detail (minimum 20 characters)..."
              required minLength={20} maxLength={2000} rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Size *</label>
              <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange}
                placeholder="e.g. 3" min={1} max={10} required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills Needed <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input type="text" name="skillsNeeded" value={form.skillsNeeded} onChange={handleChange}
              placeholder="e.g. React, Python, Machine Learning"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="e.g. ai, healthcare, fintech"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" name="isAnonymous" id="isAnonymous" checked={form.isAnonymous}
              onChange={handleChange} className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isAnonymous" className="text-sm text-gray-700">
              Post anonymously (your name will be hidden from other users)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
              {loading ? 'Checking for duplicates...' : 'Post Project'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
