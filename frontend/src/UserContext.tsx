import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import type { User, UserContextValue } from './common/types.ts'
import { API_BASE_URL } from './common/api'
import { getSecureToken } from './common/secureStorage'

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const refreshMe = useCallback(async () => {
        const token = getSecureToken()

        if (!token) {
            setUser(null)
            setError(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { data: payload } = await axios.get<{
                id: number
                firstName: string
                lastName: string
                email: string
                roles: string[]
            }>(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            setUser({
                id: payload.id,
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                roles: payload.roles,
            })
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status

                if (status === 401 || status === 403) {
                    setUser(null)
                    setError('Unauthorized. Please login again.')
                    const publicPaths = ['/', '/login', '/register']
                    if (!publicPaths.includes(location.pathname)) {
                        navigate('/login', { replace: true })
                    }
                    return
                }

                setError(err.message || 'Failed to load current user.')
                return
            }

            setError('Failed to load current user.')
        } finally {
            setLoading(false)
        }
    }, [navigate, location])

    const clearUser = useCallback(() => {
        setUser(null)
        setError(null)
    }, [])

    useEffect(() => {
        void refreshMe()
    }, [refreshMe])

    const value = useMemo(
        () => ({ user, loading, error, refreshMe, clearUser }),
        [user, loading, error, refreshMe, clearUser],
    )

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
    const context = useContext(UserContext)

    if (!context) {
        throw new Error('useUser must be used inside UserProvider')
    }

    return context
}
