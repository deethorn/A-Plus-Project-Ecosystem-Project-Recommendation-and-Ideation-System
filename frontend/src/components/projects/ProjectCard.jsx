import { useNavigate } from 'react-router-dom'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition cursor-pointer"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-base leading-snug flex-1 pr-4">
          {project.isAnonymous ? 'Anonymous Project' : project.title}
        </h3>
        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium whitespace-nowrap">
          {project.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            👥 {project.currentTeamSize}/{project.teamSize} members
          </span>
          <span className="text-xs text-gray-500">
            👁 {project.views} views
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {project.isAnonymous ? 'Anonymous' : `by ${project.owner?.name || 'Unknown'}`}
        </span>
      </div>
    </div>
  )
}
