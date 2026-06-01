import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../auth/ToastContext'
import './RegisterPage.css'

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
]

export default function RegisterPage() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [name, setName]             = useState('')
  const [country, setCountry]       = useState('India')
  const [state, setState]           = useState('')
  const [district, setDistrict]     = useState('')
  const [neighbourhood, setNeighbourhood] = useState('')
  const [apartment, setApartment]   = useState('')
  const [pincode, setPincode]       = useState('')
  const [error, setError]           = useState(null)
  const [loading, setLoading]       = useState(false)
  const navigate                    = useNavigate()
  const { showToast }               = useToast()

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit pincode')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('This email is already registered. Please login instead.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email,
        name,
        country,
        state,
        district,
        neighbourhood,
        apartment,
        pincode: pincode.trim()
      }])

    if (insertError) {
      if (!insertError.message.includes('duplicate')) {
        setError('Profile save failed: ' + insertError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    showToast({ message: 'Account created! Welcome to SkillSwap 🎉' })
    window.location.href = '/'
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

          <div className="auth-section-label">📍 Your Location</div>

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="auth-select"
          >
            <option value="">Select State / UT</option>
            {INDIA_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="District (e.g. Mumbai Suburban)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Area / Neighbourhood (e.g. Bandra West)"
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Apartment / Building (optional)"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />

          <input
            type="text"
            placeholder="Pincode (e.g. 400050)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
            required
          />

          <div className="auth-section-label">🔐 Account Details</div>

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