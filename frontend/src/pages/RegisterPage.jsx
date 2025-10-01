import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Card, CardHeader, CardContent } from '../components/ui/card.jsx'
import { Input } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../components/ui/toast.jsx'
import { OTPVerification } from '../components/OTPVerification.jsx'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('USER')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const navigate = useNavigate()
  const { register, getDashboardPath, pendingVerification } = useAuth()
  const toast = useToast()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const result = await register(email, password, fullName, role)
    
    if (result.success) {
      if (result.needsVerification) {
        setShowOTPVerification(true)
        toast?.success(result.message)
      } else {
        toast?.success(`Account created successfully as ${role}!`)
        const dashboardPath = getDashboardPath(role)
        navigate(dashboardPath)
      }
    } else {
      setError(result.error)
      toast?.error(result.error)
    }
    
    setLoading(false)
  }

  const handleOTPSuccess = () => {
    toast?.success('Email verified successfully! You can now login.')
    navigate('/login')
  }

  const handleOTPCancel = () => {
    setShowOTPVerification(false)
  }

  // Show OTP verification if user just registered or if there's pending verification
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600">Join our hospital management system</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  required
                  minLength={6}
                />
                {password && (
                  <div className="text-xs text-gray-500">
                    Password strength: {password.length < 6 ? 'Too short' : password.length < 8 ? 'Good' : 'Strong'}
                  </div>
                )}
              </div>
              <div>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-green-500 focus:ring-green-500 focus:outline-none"
                  required
                >
                  <option value="USER">Select Role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="LAB">Lab Technician</option>
                </select>
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link className="text-green-600 hover:text-green-700 font-medium transition-colors" to="/login">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}