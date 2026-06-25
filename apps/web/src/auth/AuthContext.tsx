import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  type AuthUser,
} from '../api/authApi'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    setLoading(true)

    try {
      const response = await getMe()
      setUser(response.user)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Session hydration on mount; /api/auth/me is the source of truth.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(
    async (email: string, password: string) => {
      await loginRequest(email, password)
      await refreshSession()
    },
    [refreshSession],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      refreshSession,
    }),
    [user, isAuthenticated, loading, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
