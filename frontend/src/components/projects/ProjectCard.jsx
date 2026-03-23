import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const t = {
    card:      isDark ? 'bg-zinc-900 border-white/10 hover:border-white/25'     : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm',
    title:     isDark ? 'text-white'                                             : 'text-gray-800',
    desc:      isDark ? 'text-white/45'                                          : 'text-gray-500',
    tagCat:    isDark ? 'bg-white/10 text-white/70 border-white/10'              : 'bg-blue-50 text-blue-600 border-blue-100',
    tag:       isDark ? 'bg-white/8 text-white/50'                               : 'bg-gray-100 text-gray-500',
    metaText:  isDark ? 'text-white/35'                                          : 'text-gray-500',
    ownerText: isDark ? 'text-white/30'                                          : 'text-gray-400',
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className={`border rounded-xl p-5 cursor-pointer transition ${t.card}`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-semibold text-base leading-snug flex-1 pr-4 ${t.title}`}>
          {project.isAnonymous ? 'Anonymous Project' : project.title}
        </h3>
        <span className={`text-xs px-3 py-1 rounded-full border font-medium whitespace-nowrap ${t.tagCat}`}>
          {project.category}
        </span>
      </div>

      {/* Description */}
      <p className={`text-sm mb-4 line-clamp-2 ${t.desc}`}>
        {project.description}
      </p>

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${t.tag}`}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-3 ${t.metaText}`}>
          <span className="text-xs flex items-center gap-1">
            <IconUsers /> {project.currentTeamSize}/{project.teamSize} members
          </span>
          <span className="text-xs flex items-center gap-1">
            <IconEye /> {project.views}
          </span>
        </div>
        <span className={`text-xs ${t.ownerText}`}>
          {project.isAnonymous ? 'Anonymous' : `by ${project.owner?.name || 'Unknown'}`}
        </span>
      </div>
    </div>
  )
}
