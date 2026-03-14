import api from './api'

// Get all notifications
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params })
  return response.data
}

// Mark one notification as read
export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`)
  return response.data
}

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all')
  return response.data
}

// Delete a notification
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`)
  return response.data
}
