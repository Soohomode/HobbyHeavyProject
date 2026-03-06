import api from './axios'

export const createComment = (data) => api.post('/comment', data)
export const updateComment = (data) => api.put('/comment', data)
export const deleteComment = (commentId) => api.delete(`/comment/${commentId}`)