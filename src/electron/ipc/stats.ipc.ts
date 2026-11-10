import { ipcHandle } from "../utils.js"
import { getDashboardStats } from "../services/stats.service.js"

export function registerStatsIPC() {
    ipcHandle("stats:getDashboard", async () => {
        return getDashboardStats()
    })
}