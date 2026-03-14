import api from './api'

// Send a collaboration request to join a project
export const sendCollaborationRequest = async (projectId, message) => {
  const response = await api.post('/collaboration-requests', { projectId, message })
  return response.data
}

// Revoke / cancel a pending collaboration request
export const revokeRequest = async (requestId) => {
  const response = await api.delete(`/collaboration-requests/${requestId}/revoke`)
  return response.data
}

// Get all requests for a specific project (owner only)
export const getProjectRequests = async (projectId) => {
  const response = await api.get(`/collaboration-requests/project/${projectId}`)
  return response.data
}

// Get the logged-in user's own sent requests
export const getMyRequests = async () => {
  const response = await api.get('/collaboration-requests/my-requests')
  return response.data
}

// Accept a collaboration request (owner only)
export const acceptRequest = async (requestId) => {
  const response = await api.put(`/collaboration-requests/${requestId}/accept`)
  return response.data
}

// Reject a collaboration request (owner only)
export const rejectRequest = async (requestId) => {
  const response = await api.put(`/collaboration-requests/${requestId}/reject`)
  return response.data
}
