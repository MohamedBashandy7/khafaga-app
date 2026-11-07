
import { useCallback, useEffect, useState } from "react"
import { AuthContext, type AuthUser, type FieldError } from "./AuthContext"
import { useLoading } from "../../Hooks/useLoading"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)
    const [setupRequired, setSetupRequired] = useState(false)
    const [user, setUser] = useState<AuthUser | null>(null)

    const { hideLoading } = useLoading()

    useEffect(() => {
        let mounted = true

        async function checkAuth() {
            try {
                const required = await window.electron.auth.isSetupRequired()

                if (!mounted) return

                setSetupRequired(required)

                if (required) {
                    setAuthenticated(false)
                    setUser(null)
                    return
                }

                const currentUser = await window.electron.auth.getCurrentUser()

                if (!mounted) return

                setUser(currentUser)
                setAuthenticated(!!currentUser)
            } catch (error) {
                console.error("Authentication Error:", error)

                if (!mounted) return

                setAuthenticated(false)
                setUser(null)
            } finally {
                if (mounted) {
                    hideLoading()
                    setLoading(false)
                }
            }
        }

        checkAuth()

        return () => {
            mounted = false
        }
    }, [hideLoading])

    const setupAdmin = useCallback(async (data: SetupAdminCredentials) => {
        const result = await window.electron.auth.setupSuperAdmin(data)

        if (result.success) {
            setSetupRequired(false)
        }

        return result
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        const result = await window.electron.auth.login({ email, password })

        if (!result.success) {
            const errorResult = result as {
                success: false
                message: string
                fieldErrors?: FieldError[]
            }

            return {
                success: false,
                message: errorResult.message,
                fieldErrors: errorResult.fieldErrors
            }
        }

        setAuthenticated(true)
        setUser(result.user)

        return { success: true }
    }, [])

    const logout = useCallback(async () => {
        await window.electron.auth.logout()
        setAuthenticated(false)
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider
            value={{
                loading,
                authenticated,
                setupRequired,
                user,
                setupAdmin,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
