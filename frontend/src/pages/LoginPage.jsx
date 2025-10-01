import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../components/ui/toast.jsx'
import { OTPVerification } from '../components/OTPVerification.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const navigate = useNavigate()
  const { login, getDashboardPath, pendingVerification } = useAuth()
  const toast = useToast()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const result = await login(email, password)
    
    if (result.success) {
      toast?.success('Logged in successfully')
      // Navigate to appropriate dashboard based on user role
      const dashboardPath = getDashboardPath(result.user?.role || 'USER')
      navigate(dashboardPath)
    } else {
      if (result.needsVerification) {
        setShowOTPVerification(true)
        toast?.error(result.error)
      } else {
        setError(result.error)
        toast?.error(result.error)
      }
    }
    
    setLoading(false)
  }

  const handleOTPSuccess = () => {
    toast?.success('Email verified successfully! You can now login.')
    setShowOTPVerification(false)
  }

  const handleOTPCancel = () => {
    setShowOTPVerification(false)
  }

  // Show OTP verification if user needs to verify email
  if (showOTPVerification || pendingVerification) {
    return (
      <OTPVerification 
        email={email || pendingVerification?.email}
        onSuccess={handleOTPSuccess}
        onCancel={handleOTPCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your hospital management account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                New here? <Link className="text-blue-600 hover:text-blue-700 font-medium transition-colors" to="/register">Create an account</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}