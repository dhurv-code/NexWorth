import { createContext, createElement, useContext, useMemo, useState } from 'react'
import { authApi, authStorage } from '../services/api.js'

const AuthContext = createContext(null)

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authStorage.getToken())
  const [user, setUser] = useState(authStorage.getUser())

  const login = async (payload) => {
    const { data } = await authApi.login(payload)
    const jwtUser = parseJwt(data.token)
    authStorage.setToken(data.token)
    authStorage.setUser(jwtUser)
    setToken(data.token)
    setUser(jwtUser)
    return data
  }

  const register = async (payload) => authApi.register(payload)

  const logout = () => {
    authStorage.clear()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ isAuthenticated: Boolean(token), login, logout, register, token, user }),
    [token, user],
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export const useAuth = () => useContext(AuthContext)
