import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getAllGovernorates(): Promise<GovernoratesResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/governorates`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    console.log(data)
    if (!response.ok || !data.success) {
        return { success: false, data: [], message: data.message || "فشل جلب المحافظات" }
    }
    return { success: true, data: data.data || [] }
}
