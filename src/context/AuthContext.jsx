/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

export { AuthProvider, useAuth }