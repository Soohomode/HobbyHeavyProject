import axios from 'axios'
import api from './axios'

export const login = async (userId, password) => {
  const res = await axios.post('/api/login', { userId, password }, { withCredentials: true })
  const token = res.headers['access'] || res.data?.accessToken
  if (token) localStorage.setItem('accessToken', token)
  return res.data
}

export const signup = (data) => axios.post('/api/join', data)

export const logout = async () => {
  try {
    await api.post('/logout')
  } finally {
    localStorage.removeItem('accessToken')
  }
}

export const getMyInfo = () => api.get('/user/my-info')
export const updateMyInfo = (data) => api.put('/user/my-info', data)
export const updatePassword = (data) => api.put('/user/password', data)
export const deleteUser = (data) => api.delete('/user', { data })
