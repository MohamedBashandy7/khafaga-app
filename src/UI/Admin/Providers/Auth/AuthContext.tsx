
import { createContext } from "react"

export type AuthUser = {
    name: string
    role: string
}

export type FieldError = {
    type: string
    value: string
    msg: string
    path: string
    location: string
}

export type AuthContextType = {
    loading: boolean
    authenticated: boolean
    setupRequired: boolean
    user: AuthUser | null
    setupAdmin: (data: SetupAdminCredentials) => Promise<SetupAdminResult>
    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string; fieldErrors?: FieldError[] }>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
    loading: true,
    authenticated: false,
    setupRequired: false,
    user: null,
    setupAdmin: async () => ({
        success: false,
        message: "حدث خطأ"
    }),
    login: async () => ({ success: false }),
    logout: async () => {}
})
