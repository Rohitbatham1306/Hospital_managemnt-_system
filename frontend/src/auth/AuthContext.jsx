import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingVerification, setPendingVerification] = useState(null)

  useEffect(() => {
    // Load authentication state from localStorage on app start
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      try {
        const { token, user } = JSON.parse(storedAuth)
        setToken(token)
        setUser(user)
      } catch (error) {
        console.error('Error parsing stored auth:', error)
        localStorage.removeItem('auth')
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }))
        return { success: true }
      } else {
        // Check if user needs email verification
        if (data.needsVerification) {
          setPendingVerification({ email: data.email })
          return { success: false, error: data.message, needsVerification: true }
        }
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  async function register(email, password, fullName, role = 'USER') {
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName, role }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful, but user needs to verify email
        setPendingVerification({ email, fullName, role })
        return { success: true, message: data.message, needsVerification: true }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  async function verifyOTP(email, otp) {
    try {
      const response = await fetch('http://localhost:4000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        setPendingVerification(null)
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  async function resendOTP(email) {
    try {
      const response = await fetch('http://localhost:4000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
    setPendingVerification(null)
    localStorage.removeItem('auth')
  }

  function clearPendingVerification() {
    setPendingVerification(null)
  }

  // Function to get the appropriate dashboard path based on user role
  function getDashboardPath(userRole) {
    const roleToPath = { 
      ADMIN: '/admin', 
      DOCTOR: '/doctor', 
      RECEPTIONIST: '/reception', 
      LAB: '/lab' 
    }
    return roleToPath[userRole] || '/admin'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      pendingVerification,
      login, 
      register, 
      logout,
      verifyOTP,
      resendOTP,
      clearPendingVerification,
      getDashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}