import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SESSION:', session)
      if (session?.user) {
        fetchUser(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('AUTH CHANGE:', _event, session)
        if (session?.user) {
          fetchUser(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser(id) {
    console.log('FETCHING USER:', id)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, neighbourhood, avatar_url')
        .eq('id', id)
        .single()

      console.log('USER DATA:', data, 'ERROR:', error)

      if (data) {
        setUser(data)
      } else {
        setUser({ id, name: 'User', neighbourhood: '', avatar_url: '' })
      }
    } catch(e) {
      console.log('CATCH ERROR:', e)
      setUser({ id, name: 'User', neighbourhood: '', avatar_url: '' })
    } finally {
      console.log('SETTING LOADING FALSE')
      setLoading(false)
    }
  }

async function signOut() {
  await supabase.auth.signOut()
  setUser(null)
  window.location.href = '/'
}

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}