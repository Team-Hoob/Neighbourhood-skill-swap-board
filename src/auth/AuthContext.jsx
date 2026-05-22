/**
 * AuthContext.jsx — Placeholder
 * 
 * This file will be fully implemented by Harshit Singh (Module 2).
 * The Navbar and other components import `useAuth()` from here.
 * 
 * Shape of the context value:
 * {
 *   user: { id, name, neighbourhood, avatar_url } | null,
 *   loading: boolean,
 *   signOut: () => void,
 * }
 */

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // TODO: Harshit Singh — replace this with real Supabase auth
  const [user, setUser] = useState(null);

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading: false, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
