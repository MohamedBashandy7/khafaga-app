import { Navigate } from "react-router-dom"
import { useAuth } from "../Hooks/useAuth"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { loading, authenticated } = useAuth()

    if (loading) {
        return null
    }
    if (!authenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }
    return <>{children}</>
}
