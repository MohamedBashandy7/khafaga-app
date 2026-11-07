import { useContext } from "react"
import { AuthContext, type AuthContextType } from "../Providers/Auth/AuthContext"

export function useAuth(): AuthContextType {
    return useContext(AuthContext)
}
