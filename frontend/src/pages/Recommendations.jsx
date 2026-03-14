import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getRecommendations } from '../services/recommendationService'

export default function Recommendations() {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileIncomplete, setProfileIncomplete] = useState(false)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations()
        setRecommendations(data.recommendations)
        setProfileIncomplete(data.profileIncomplete)
      } catch (err) {
        setError('Failed to load recommendations.')
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-300'
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    return 'bg-orange-100 text-orange-700 border-orange-300'
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Recommended Projects</h1>
        <p className="text-gray-500 mt-1">
          Projects matched to your skills and interests.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Finding projects for you...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Profile Incomplete */}
      {!loading && profileIncomplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Your profile needs skills and interests
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Add your skills and interests to your profile so we can recommend
            projects that match what you know and care about.
          </p>
          <Link
            to="/profile"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2.5 rounded-lg font-medium"
          >
            Update Profile
          </Link>
        </div>
      )}

      {/* No Matches */}
      {!loading && !error && !profileIncomplete && recommendations.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No matching projects found</p>
          <p className="text-sm mt-1">
            Try adding more skills and interests to your profile.
          </p>
          <Link
            to="/profile"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            Update Profile →
          </Link>
        </div>
      )}

      {/* Recommendation Cards */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">
                      {project.isAnonymous ? 'Anonymous Project' : project.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                      {project.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      👥 {project.currentTeamSize}/{project.teamSize} members
                    </span>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className={`shrink-0 border px-3 py-2 rounded-xl text-center ${getScoreColor(project.matchScore)}`}>
                  <p className="text-xl font-bold leading-none">{project.matchScore}%</p>
                  <p className="text-xs mt-0.5">match</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {project.description}
              </p>

              {/* Why it matched */}
              <div className="space-y-2">
                {project.matchedSkills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Skills:</span>
                    {project.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                )}
                {project.matchedInterests?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Interests:</span>
                    {project.matchedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full"
                      >
                        ✓ {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}
