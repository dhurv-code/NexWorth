import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const TOKEN_KEY = 'pig_token'
const USER_KEY = 'pig_user'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  getUser: () => JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
}

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
}

export const transactionsApi = {
  all: () => api.get('/transaction/all'),
  add: (payload) => api.post('/transaction/add', payload),
  update: (id, payload) => api.put(`/transaction/update/${id}`, payload),
  remove: (id) => api.delete(`/transaction/delete/${id}`),
  summary: () => api.get('/transaction/summary'),
  analytics: () => api.get('/transaction/analytics'),
  networth: () => api.get('/transaction/networth'),
}

export const goalsApi = {
  all: () => api.get('/goals/all'),
  add: (payload) => api.post('/goals/add', payload),
  update: (id, payload) => api.put(`/goals/update/${id}`, payload),
  remove: (id) => api.delete(`/goals/delete/${id}`),
}

export const liabilitiesApi = {
  all: () => api.get('/liabilities/all'),
  add: (payload) => api.post('/liabilities/add', payload),
  update: (id, payload) => api.put(`/liabilities/update/${id}`, payload),
  remove: (id) => api.delete(`/liabilities/delete/${id}`),
}

export const profileApi = {
  me: () => api.get('/profile/me'),
  save: (payload) => api.post('/profile/save', payload),
}

export const advisorApi = {
  plan: () => api.get('/ai/plan'),
}

