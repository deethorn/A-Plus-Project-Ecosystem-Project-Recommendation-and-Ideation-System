import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getRecommendations } from '../services/recommendationService'
import { useTheme } from '../context/ThemeContext'

const IconTarget = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function Recommendations() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileIncomplete, setProfileIncomplete] = useState(false)

  const t = {
    page:          isDark ? 'bg-black'                                               : 'bg-gray-50',
    sectionHdr:    isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle:  isDark ? 'text-gray-900'                                          : 'text-white',
    sectionSub:    isDark ? 'text-gray-500'                                          : 'text-white/60',
    card:          isDark ? 'bg-zinc-900 border-white/10 hover:border-white/25'      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm',
    cardTitle:     isDark ? 'text-white'                                             : 'text-gray-900',
    cardDesc:      isDark ? 'text-white/45'                                          : 'text-gray-500',
    tag:           isDark ? 'bg-white/8 text-white/55 border-white/10'               : 'bg-gray-100 text-gray-600 border-gray-100',
    tagCat:        isDark ? 'bg-white/10 text-white/70 border-white/10'              : 'bg-blue-50 text-blue-600 border-blue-100',
    metaText:      isDark ? 'text-white/35'                                          : 'text-gray-400',
    divider:       isDark ? 'border-white/8'                                         : 'border-gray-100',
    skillTag:      isDark ? 'bg-green-500/10 text-green-400 border-green-500/20'     : 'bg-green-50 text-green-600 border-green-200',
    interestTag:   isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'  : 'bg-purple-50 text-purple-600 border-purple-200',
    scoreHigh:     isDark ? 'bg-green-500/10 text-green-400 border-green-500/25'     : 'bg-green-50 text-green-700 border-green-200',
    scoreMid:      isDark ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'  : 'bg-yellow-50 text-yellow-700 border-yellow-200',
    scoreLow:      isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/25'  : 'bg-orange-50 text-orange-700 border-orange-200',
    infoCard:      isDark ? 'bg-zinc-900 border-white/10'                            : 'bg-white border-gray-200',
    infoTitle:     isDark ? 'text-white'                                             : 'text-gray-800',
    infoSub:       isDark ? 'text-white/40'                                          : 'text-gray-500',
    profileBtn:    isDark ? 'bg-white hover:bg-gray-100 text-black'                  : 'bg-black hover:bg-zinc-800 text-white',
    profileLink:   isDark ? 'text-white/40 hover:text-white'                         : 'text-gray-500 hover:text-gray-800',
    errorBg:       isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    emptyText:     isDark ? 'text-white/30'                                          : 'text-gray-400',
    emptyTitle:    isDark ? 'text-white/50'                                          : 'text-gray-500',
    shimmer:       isDark ? 'bg-white/8'                                             : 'bg-gray-200',
    shimmerSub:    isDark ? 'bg-white/5'                                             : 'bg-gray-100',
    refreshBtn: isDark ? 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'border-gray-200 text-gray-500 hover:bg-gray-100',
    matchLabel:    isDark ? 'text-white/30'                                          : 'text-gray-400',
  }

  const fetchRecommendations = async () => {
    setLoading(true); setError('')
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

  useEffect(() => { fetchRecommendations() }, [])

  const getScoreConfig = (score) => {
    if (score >= 70) return t.scoreHigh
    if (score >= 40) return t.scoreMid
    return t.scoreLow
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 space-y-5">

        {/* ── Header Bar ── */}
        <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
          <div>
            <h1 className={`text-base font-semibold ${t.sectionTitle}`}>Recommended Projects</h1>
            <p className={`text-xs mt-0.5 ${t.sectionSub}`}>
              Projects matched to your skills and interests
            </p>
          </div>
          {!loading && !profileIncomplete && recommendations.length > 0 && (
            <button
              onClick={fetchRecommendations}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${t.refreshBtn}`}
            >
              <IconRefresh /> Refresh
            </button>
          )}
        </div>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`rounded-xl border p-6 animate-pulse ${t.infoCard}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4 space-y-2">
                    <div className={`h-4 rounded-lg w-2/5 ${t.shimmer}`} />
                    <div className={`h-3 rounded-lg w-1/4 ${t.shimmerSub}`} />
                  </div>
                  <div className={`w-16 h-14 rounded-xl ${t.shimmer}`} />
                </div>
                <div className={`h-3 rounded-lg w-full mb-2 ${t.shimmerSub}`} />
                <div className={`h-3 rounded-lg w-3/4 ${t.shimmerSub}`} />
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className={`text-sm px-4 py-3 rounded-xl border ${t.errorBg}`}>{error}</div>
        )}

        {/* ── Profile Incomplete ── */}
        {!loading && profileIncomplete && (
          <div className={`rounded-xl border p-14 text-center ${t.infoCard}`}>
            <div className={`flex justify-center mb-4 ${t.emptyText}`}><IconTarget /></div>
            <h2 className={`text-lg font-semibold mb-2 ${t.infoTitle}`}>
              Your profile needs skills and interests
            </h2>
            <p className={`text-sm mb-6 max-w-sm mx-auto ${t.infoSub}`}>
              Add your skills and interests to your profile so we can recommend
              projects that match what you know and care about.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/profile" className={`text-sm px-6 py-2.5 rounded-xl font-medium transition ${t.profileBtn}`}>
                Update Profile
              </Link>
              <Link to="/projects" className={`text-sm flex items-center gap-1.5 transition ${t.profileLink}`}>
                Browse all projects <IconArrowRight />
              </Link>
            </div>
          </div>
        )}

        {/* ── No Matches ── */}
        {!loading && !error && !profileIncomplete && recommendations.length === 0 && (
          <div className={`rounded-xl border p-14 text-center ${t.infoCard}`}>
            <div className={`flex justify-center mb-4 ${t.emptyText}`}><IconSearch /></div>
            <p className={`font-medium ${t.emptyTitle}`}>No matching projects found</p>
            <p className={`text-sm mt-1 mb-5 ${t.emptyText}`}>
              Try adding more skills and interests to your profile.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/profile" className={`text-sm px-5 py-2 rounded-xl font-medium transition ${t.profileBtn}`}>
                Update Profile
              </Link>
              <Link to="/projects" className={`text-sm flex items-center gap-1.5 transition ${t.profileLink}`}>
                Browse all projects <IconArrowRight />
              </Link>
            </div>
          </div>
        )}

        {/* ── Recommendation Cards ── */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((project, index) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className={`border rounded-xl p-6 cursor-pointer transition ${t.card}`}
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Left content */}
                  <div className="flex-1 min-w-0">

                    {/* Rank + title row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold tabular-nums ${t.metaText}`}>
                        #{index + 1}
                      </span>
                      <h3 className={`font-semibold ${t.cardTitle}`}>
                        {project.isAnonymous ? 'Anonymous Project' : project.title}
                      </h3>
                    </div>

                    {/* Category + team */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${t.tagCat}`}>
                        {project.category}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${t.metaText}`}>
                        <IconUsers /> {project.currentTeamSize}/{project.teamSize} members
                      </span>
                      {!project.isAnonymous && project.owner?.name && (
                        <span className={`text-xs flex items-center gap-1 ${t.metaText}`}>
                          <IconUser /> {project.owner.name}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-4 line-clamp-2 ${t.cardDesc}`}>
                      {project.description}
                    </p>

                    {/* Match reasons */}
                    <div className={`space-y-2 pt-3 border-t ${t.divider}`}>
                      {project.matchedSkills?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-medium ${t.metaText}`}>Skills:</span>
                          {project.matchedSkills.map(skill => (
                            <span key={skill} className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${t.skillTag}`}>
                              <IconCheck /> {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.matchedInterests?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs font-medium ${t.metaText}`}>Interests:</span>
                          {project.matchedInterests.map(interest => (
                            <span key={interest} className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${t.interestTag}`}>
                              <IconCheck /> {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className={`shrink-0 border rounded-xl px-4 py-3 text-center min-w-[64px] ${getScoreConfig(project.matchScore)}`}>
                    <p className="text-2xl font-bold leading-none">{project.matchScore}%</p>
                    <p className={`text-xs mt-1 ${t.matchLabel}`}>match</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
