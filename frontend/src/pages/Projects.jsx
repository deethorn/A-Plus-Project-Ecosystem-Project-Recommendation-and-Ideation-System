import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects } from '../services/projectService'
import { useTheme } from '../context/ThemeContext'

const CATEGORIES = [
  'All', 'Web Development', 'Mobile App', 'Machine Learning', 'Data Science',
  'IoT', 'Game Development', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'Other',
]

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconFolder = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconWarning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export default function Projects() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const t = {
    page:          isDark ? 'bg-black'                                               : 'bg-gray-50',
    sectionHdr:    isDark ? 'bg-white border border-gray-100'                        : 'bg-black border border-black',
    sectionTitle:  isDark ? 'text-gray-900'                                          : 'text-white',
    postBtn:       isDark ? 'bg-black hover:bg-zinc-800 text-white'                  : 'bg-white hover:bg-gray-100 text-black',
    searchWrap:    isDark ? 'bg-zinc-900 border-white/10 text-white/40'              : 'bg-white border-gray-200 text-gray-400',
    searchInput:   isDark ? 'bg-transparent text-white placeholder-white/25'        : 'bg-transparent text-gray-800 placeholder-gray-400',
    clearBtn:      isDark ? 'text-white/30 hover:text-white/60'                     : 'text-gray-400 hover:text-gray-600',
    catActive:     isDark ? 'bg-white text-black border-white'                       : 'bg-black text-white border-black',
    catInactive:   isDark ? 'bg-zinc-900 text-white/50 border-white/10 hover:border-white/30 hover:text-white/80' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400',
    statusActive:  isDark ? 'bg-white/10 text-white border-white/30'                 : 'bg-gray-900 text-white border-gray-900',
    statusInactive:isDark ? 'text-white/40 border-white/10 hover:text-white/60'     : 'text-gray-500 border-gray-200 hover:text-gray-700',
    dividerV:      isDark ? 'bg-white/10'                                            : 'bg-gray-200',
    card:          isDark ? 'bg-zinc-900 border-white/10 hover:border-white/25'      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm',
    cardTitle:     isDark ? 'text-white'                                             : 'text-gray-900',
    cardDesc:      isDark ? 'text-white/45'                                          : 'text-gray-500',
    tag:           isDark ? 'bg-white/8 text-white/55 border-white/10'              : 'bg-gray-100 text-gray-600 border-gray-100',
    tagSkill:      isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200',
    statusBadge:   isDark ? 'bg-green-500/10 text-green-400 border-green-500/20'    : 'bg-green-50 text-green-600 border-green-200',
    statusBadgeDone:isDark? 'bg-white/5 text-white/30 border-white/8'               : 'bg-gray-100 text-gray-400 border-gray-100',
    metaText:      isDark ? 'text-white/35'                                          : 'text-gray-400',
    emptyText:     isDark ? 'text-white/30'                                          : 'text-gray-400',
    emptyTitle:    isDark ? 'text-white/50'                                          : 'text-gray-500',
    errorBg:       isDark ? 'bg-red-500/10 border-red-500/30 text-red-400'           : 'bg-red-50 border-red-200 text-red-600',
    shimmer:       isDark ? 'bg-white/8'                                             : 'bg-gray-200',
    shimmerSub:    isDark ? 'bg-white/5'                                             : 'bg-gray-100',
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const params = {}
        if (selectedCategory !== 'All') params.category = selectedCategory
        const data = await getAllProjects(params)
        setProjects(data.projects)
      } catch (err) {
        setError('Failed to load projects. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [selectedCategory])

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = !search || (() => {
      const lower = search.toLowerCase()
      return (
        p.title?.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.tags?.some((tag) => tag.includes(lower)) ||
        p.skillsNeeded?.some((s) => s.toLowerCase().includes(lower))
      )
    })()
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && p.status === 'active') ||
      (selectedStatus === 'Completed' && p.status === 'completed')
    return matchesSearch && matchesStatus
  })

  const activeCount    = projects.filter(p => p.status === 'active').length
  const hasFilters     = search || selectedCategory !== 'All' || selectedStatus !== 'All'

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${t.page}`}>
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-16 space-y-5">

        {/* ── Header Bar ── */}
        <div className={`rounded-xl px-6 py-4 flex items-center justify-between ${t.sectionHdr}`}>
          <h1 className={`text-base font-semibold ${t.sectionTitle}`}>Browse Projects</h1>
          <button
            onClick={() => navigate('/projects/new')}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition ${t.postBtn}`}
          >
            + Post Project
          </button>
        </div>

        {/* ── Search ── */}
        <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition ${t.searchWrap}`}>
          <IconSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tags, or skills..."
            className={`flex-1 text-sm outline-none ${t.searchInput}`}
          />
          {search && (
            <button onClick={() => setSearch('')} className={`transition ${t.clearBtn}`}>
              <IconX />
            </button>
          )}
        </div>

        {/* ── Filters Row ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status pills */}
          {['All', 'Active', 'Completed'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition ${
                selectedStatus === s ? t.statusActive : t.statusInactive
              }`}
            >
              {s}
              {s === 'Active' && !loading && (
                <span className="ml-1.5 opacity-60">{activeCount}</span>
              )}
            </button>
          ))}

          {/* Vertical divider */}
          <div className={`w-px h-5 mx-1 ${t.dividerV}`} />

          {/* Category pills */}
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition ${
                selectedCategory === cat ? t.catActive : t.catInactive
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Active Filter Summary ── */}
        {hasFilters && !loading && (
          <div className={`text-xs flex items-center gap-2 ${t.metaText}`}>
            <span>Showing {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedStatus('All') }}
              className={`underline transition ${t.clearBtn}`}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className={`text-sm px-4 py-3 rounded-xl border ${t.errorBg}`}>{error}</div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`rounded-xl border p-5 animate-pulse ${t.card}`}>
                <div className={`h-4 rounded-lg w-1/3 mb-3 ${t.shimmer}`} />
                <div className={`h-3 rounded-lg w-2/3 mb-2 ${t.shimmerSub}`} />
                <div className={`h-3 rounded-lg w-1/2 ${t.shimmerSub}`} />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className={`rounded-xl border p-16 text-center ${t.card}`}>
            <div className={`flex justify-center mb-3 ${t.emptyText}`}><IconFolder /></div>
            <p className={`font-medium ${t.emptyTitle}`}>No projects found</p>
            <p className={`text-sm mt-1 ${t.emptyText}`}>
              {search ? 'Try a different search term' : 'Be the first to post a project!'}
            </p>
          </div>
        )}

        {/* ── Project List — each its own card ── */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className={`border rounded-xl p-5 cursor-pointer transition ${t.card}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-semibold ${t.cardTitle}`}>{project.title}</h3>
                      {project.isAnonymous && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${t.tag}`}>Anonymous</span>
                      )}
                    </div>
                    <p className={`text-sm mb-3 line-clamp-2 ${t.cardDesc}`}>{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${t.tag}`}>
                        {project.category}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full border ${t.tag}`}>
                        Team: {project.currentTeamSize}/{project.teamSize}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                        project.status === 'active' ? t.statusBadge : t.statusBadgeDone
                      }`}>
                        {project.status}
                      </span>
                      {project.skillsNeeded?.slice(0, 2).map(skill => (
                        <span key={skill} className={`text-xs px-3 py-1 rounded-full border ${t.tagSkill}`}>
                          {skill}
                        </span>
                      ))}
                      {project.skillsNeeded?.length > 2 && (
                        <span className={`text-xs px-2 py-1 rounded-full border ${t.tag}`}>
                          +{project.skillsNeeded.length - 2} more
                        </span>
                      )}
                      {project.duplicateScore > 50 && (
                        <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                          <IconWarning /> {project.duplicateScore}% similar
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs shrink-0 text-right flex flex-col items-end gap-1 ${t.metaText}`}>
                    <span className="flex items-center gap-1"><IconEye /> {project.views ?? 0}</span>
                    {project.owner?.name && !project.isAnonymous && (
                      <span>{project.owner.name}</span>
                    )}
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
