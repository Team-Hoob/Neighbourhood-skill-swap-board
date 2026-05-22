import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../auth/ToastContext'
import './RegisterPage.css'

export default function RegisterPage() {
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [name, setName]                   = useState('')
  const [neighbourhood, setNeighbourhood] = useState('')
  const [error, setError]                 = useState(null)
  const [loading, setLoading]             = useState(false)
  const navigate                          = useNavigate()
  const { showToast }                     = useToast()

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Step 1: Sign up
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Step 2: No session means Supabase silently rejected (duplicate email)
    if (!data.session) {
      setError('This email is already registered. Please login instead.')
      setLoading(false)
      return
    }

    // Step 3: Insert profile row
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, name, neighbourhood }])

    if (insertError) {
      // If duplicate key, user already has a profile — still let them in
      if (!insertError.message.includes('duplicate')) {
        setError('Profile save failed: ' + insertError.message)
        setLoading(false)
        return
      }
    }

    // Step 4: Done
    setLoading(false)
    showToast({ message: 'Account created! Welcome to SkillSwap 🎉' })
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join your neighbourhood skill exchange</p>
        <form className="auth-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Neighbourhood (e.g. Bandra West)"
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="auth-error">
              {error}{' '}
              {error.includes('already registered') && (
                <Link to="/login" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                  Go to Login
                </Link>
              )}
            </p>
          )}
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}