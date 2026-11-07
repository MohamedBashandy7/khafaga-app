
import { ipcHandle } from "../utils.js"
import * as authService from "../services/auth.service.js"

export function registerAuthIPC() {
    ipcHandle("auth:isSetupRequired", async () => {
        return authService.isSetupRequired()
    })

    ipcHandle("auth:setupSuperAdmin", async (data: SetupAdminCredentials) => {
        return authService.setupSuperAdmin(
            data.name,
            data.email,
            data.password
        )
    })

    ipcHandle("getToken", async () => {
        return authService.getToken()
    })

    ipcHandle("auth:getCurrentUser", async () => {
        return authService.getCurrentUser()
    })

    ipcHandle("login", async (credentials: LoginCredentials) => {
        return authService.login(credentials.email, credentials.password)
    })

    ipcHandle("logout", async () => {
        await authService.logout()
    })
}
