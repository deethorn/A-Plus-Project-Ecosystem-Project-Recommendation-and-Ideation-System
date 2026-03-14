import api from './api'

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData)
  return response.data
}

export const getAllProjects = async (params = {}) => {
  const response = await api.get('/projects', { params })
  return response.data
}

export const getMyProjects = async () => {
  const response = await api.get('/projects/user/my-projects')
  return response.data
}

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`)
  return response.data
}

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`)
  return response.data
}

export const updateProjectStatus = async (id, status) => {
  const response = await api.patch(`/projects/${id}/status`, { status })
  return response.data
}

// Owner removes a specific team member
export const removeMember = async (projectId, memberId) => {
  const response = await api.delete(`/projects/${projectId}/members/${memberId}`)
  return response.data
}

// Logged-in team member leaves a project
export const leaveProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}/leave`)
  return response.data
}
