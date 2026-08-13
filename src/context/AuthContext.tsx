import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { SessionUser } from '../lib/types'

interface AuthValue {
  user: SessionUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let active = true

    api
      .getUser()
      .then((current) => {
        if (active) setUser(current)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const unsubscribe = api.onUserChange((next) => {
      if (!active) return
      setUser(next)
      // Al cambiar de cuenta no debe quedar en pantalla nada del usuario anterior.
      queryClient.clear()
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  const signIn = useCallback(
    async (email: string, password: string) => {
      await api.signIn(email, password)
      setUser(await api.getUser())
    },
    [],
  )

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      await api.signUp(email, password, displayName)
      setUser(await api.getUser())
    },
    [],
  )

  const signOut = useCallback(async () => {
    await api.signOut()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return value
}
