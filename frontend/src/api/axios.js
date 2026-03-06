import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['access'] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const res = await axios.post('/api/reissue', {}, { withCredentials: true })
        const newToken = res.headers['access'] || res.data?.accessToken
        if (newToken) {
          localStorage.setItem('accessToken', newToken)
          originalRequest.headers['access'] = newToken
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
