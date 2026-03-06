import api from './axios'

export const createSchedule = (data) => api.post('/schedules', data)
export const getSchedule = (scheduleId) => api.get(`/schedules/${scheduleId}`)
export const getAllSchedules = () => api.get('/schedules')
export const updateSchedule = (scheduleId, data) => api.put(`/schedules/${scheduleId}`, data)
export const deleteSchedule = (scheduleId) => api.delete(`/schedules/${scheduleId}`)
export const voteSchedule = (scheduleId) => api.post(`/schedules/${scheduleId}/vote`)
export const unvoteSchedule = (scheduleId) => api.post(`/schedules/${scheduleId}/unvote`)
export const confirmSchedule = (scheduleId) => api.post(`/schedules/${scheduleId}/confirm`)
export const cancelSchedule = (scheduleId, reason) =>
  api.post(`/schedules/${scheduleId}/cancel`, { reason })