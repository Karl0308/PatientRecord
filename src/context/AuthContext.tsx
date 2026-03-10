import { createContext, useContext, useState, ReactNode } from 'react'
import type { AuthUser } from '@/types'

const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: 'PAT-001', username: 'juan.delacruz',  password: 'password', name: 'Juan Dela Cruz',  role: 'Patient', initials: 'JD', email: 'juan.delacruz@email.com' },
  { id: 'PAT-002', username: 'maria.santos',   password: 'password', name: 'Maria Clara Santos', role: 'Patient', initials: 'MS', email: 'maria.santos@email.com' },
  { id: 'ADM-001', username: 'admin.rosa',     password: 'password', name: 'Admin Rosa',     role: 'Admin',   initials: 'AR', email: 'admin.rosa@clinic.com' },
  { id: 'ADM-002', username: 'admin.jose',     password: 'password', name: 'Admin Jose',     role: 'Admin',   initials: 'AJ', email: 'admin.jose@clinic.com' },
]

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  function login(username: string, password: string): boolean {
    const match = MOCK_USERS.find(
      u => u.username === username.trim().toLowerCase() && u.password === password
    )
    if (match) {
      const { password: _pw, ...authUser } = match
      setUser(authUser)
      return true
    }
    return false
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
