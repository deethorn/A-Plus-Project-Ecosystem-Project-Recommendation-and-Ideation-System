import api from './api'

// Get personalized recommendations for the logged-in user
export const getRecommendations = async () => {
  const response = await api.get('/recommendations')
  return response.data
}
