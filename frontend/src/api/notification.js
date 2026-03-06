import api from './axios'

export const getNotifications = () => api.get('/notifications')
export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/mark-as-read`)