import api from './axios'

export const getMeetups = (page = 0, size = 12) =>
  api.get(`/meetup?page=${page}&size=${size}`)

export const getMeetupsByHobby = (hobbyName, page = 0, size = 12) =>
  api.get(`/meetup/hobby/${hobbyName}?page=${page}&size=${size}`)

export const searchMeetups = (keyword, page = 0, size = 12) =>
  api.get(`/meetup/search/${keyword}?page=${page}&size=${size}`)

export const getMeetupsByLocation = (loc, page = 0, size = 12) =>
  api.get(`/meetup/location/${loc}?page=${page}&size=${size}`)

export const getMeetup = (meetupId) => api.get(`/meetup/${meetupId}`)

export const getMyMeetups = () => api.get('/meetup/my-list')

export const createMeetup = (data) => api.post('/meetup/create', data)

export const updateMeetup = (meetupId, data) => api.put(`/meetup/${meetupId}`, data)

export const deleteMeetup = (meetupId) => api.delete(`/meetup/${meetupId}`)

export const uploadThumbnail = (meetupId, formData) =>
  api.put(`/meetup/thumbnail/${meetupId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })