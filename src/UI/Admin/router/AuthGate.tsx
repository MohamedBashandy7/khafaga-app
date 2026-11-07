
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../Hooks/useAuth"

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { loading, setupRequired, authenticated } = useAuth()
    const location = useLocation()

    if (loading) return null

    if (setupRequired && location.pathname !== "/setup") {
        return <Navigate to="/setup" replace />
    }

    if (!setupRequired && location.pathname === "/setup") {
        return <Navigate to={authenticated ? "/" : "/login"} replace />
    }

    return <>{children}</>
}
