import { useState, useEffect } from 'react'
import { getAllProjects } from '../services/projectService'
import ProjectCard from '../components/projects/ProjectCard'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile App',
  'Machine Learning',
  'Data Science',
  'IoT',
  'Game Development',
  'Blockchain',
  'Cybersecurity',
  'Cloud Computing',
  'Other',
]

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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

  // Filter by search on the frontend
  const filteredProjects = projects.filter((p) => {
    if (!search) return true
    const lower = search.toLowerCase()
    return (
      p.title?.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower) ||
      p.tags?.some((t) => t.includes(lower)) ||
      p.skillsNeeded?.some((s) => s.toLowerCase().includes(lower))
    )
  })

  return (
    <div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Browse Projects</h1>
          <p className="text-gray-500 mt-1">
            Discover project ideas and find ones to collaborate on.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
        >
          + Post Project
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, tags, or skills..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-1.5 rounded-full font-medium border transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Loading projects...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No projects found</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search term' : 'Be the first to post a project!'}
          </p>
        </div>
      )}

      {/* Project Grid */}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

    </div>
  )
}
