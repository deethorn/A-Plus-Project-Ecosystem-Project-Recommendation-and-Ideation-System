import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getMyProfile, updateMyProfile } from '../services/userService'

export default function Profile() {
  const { user: authUser, login } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    bio: '',
    institution: '',
    skillsInput: '',
    interestsInput: '',
    skills: [],
    interests: [],
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile()
        const u = data.user
        setForm({
          name: u.name || '',
          bio: u.bio || '',
          institution: u.institution || '',
          skillsInput: '',
          interestsInput: '',
          skills: u.skills || [],
          interests: u.interests || [],
        })
      } catch (err) {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Add skill on Enter or comma
  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = form.skillsInput.trim().replace(',', '')
      if (val && !form.skills.includes(val)) {
        setForm({ ...form, skills: [...form.skills, val], skillsInput: '' })
      }
    }
  }

  // Add interest on Enter or comma
  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = form.interestsInput.trim().replace(',', '')
      if (val && !form.interests.includes(val)) {
        setForm({ ...form, interests: [...form.interests, val], interestsInput: '' })
      }
    }
  }

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })
  }

  const removeInterest = (interest) => {
    setForm({ ...form, interests: form.interests.filter((i) => i !== interest) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const data = await updateMyProfile({
        name: form.name,
        bio: form.bio,
        institution: form.institution,
        skills: form.skills,
        interests: form.interests,
      })
      setSuccess('Profile updated successfully!')

      // Scroll to top to show success message
      window.scrollTo(0, 0)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1">
          Keep your skills and interests updated — they power your project recommendations.
        </p>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
          ✅ {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input
              type="text"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="e.g. Academic City University"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell others about yourself..."
              maxLength={500}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.bio.length}/500 characters
            </p>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
              <span className="text-gray-400 font-normal ml-1">
                (type and press Enter or comma to add)
              </span>
            </label>

            {/* Skill Tags */}
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-400 hover:text-red-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              name="skillsInput"
              value={form.skillsInput}
              onChange={handleChange}
              onKeyDown={handleSkillKeyDown}
              placeholder="e.g. React, Python, Machine Learning"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests
              <span className="text-gray-400 font-normal ml-1">
                (type and press Enter or comma to add)
              </span>
            </label>

            {/* Interest Tags */}
            {form.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.interests.map((interest) => (
                  <span
                    key={interest}
                    className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="text-purple-400 hover:text-red-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              name="interestsInput"
              value={form.interestsInput}
              onChange={handleChange}
              onKeyDown={handleInterestKeyDown}
              placeholder="e.g. AI, Healthcare, Fintech"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
