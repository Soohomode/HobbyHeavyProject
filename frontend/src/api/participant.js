import api from './axios'

export const joinMeetup = (meetupId) => api.post(`/participant/${meetupId}`)
export const cancelWaiting = (meetupId) => api.put(`/participant/waiting-cancel/${meetupId}`)
export const getWaitingParticipants = (meetupId) => api.get(`/participant/waiting/${meetupId}`)
export const toggleAlarm = (meetupId) => api.put(`/participant/alarm/${meetupId}`)
export const setParticipantStatus = (data) => api.put('/participant/status', data)
export const withdrawFromMeetup = (meetupId) => api.put(`/participant/withdraw/${meetupId}`)
export const changeRole = (data) => api.put('/participant/sub-host', data)