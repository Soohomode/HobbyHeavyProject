import api from './axios'

export const getReviews = (scheduleId, page = 0, size = 10) =>
  api.get(`/review/${scheduleId}?page=${page}&size=${size}`)
export const getReview = (reviewId) => api.get(`/review/info/${reviewId}`)
export const createReview = (data) => api.post('/review/create', data)
export const updateReview = (reviewId, data) => api.put(`/review/${reviewId}`, data)
export const deleteReview = (reviewId) => api.delete(`/review/${reviewId}`)