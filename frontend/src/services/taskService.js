import api from './api'

// Get all tasks for a project
export const getProjectTasks = async (projectId) => {
  const response = await api.get(`/tasks/project/${projectId}`)
  return response.data
}

// Create a new task
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData)
  return response.data
}

// Toggle task complete/incomplete
export const toggleTask = async (taskId) => {
  const response = await api.put(`/tasks/${taskId}/toggle`)
  return response.data
}

// Delete a task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`)
  return response.data
}

// Update/edit a task
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData)
  return response.data
}
