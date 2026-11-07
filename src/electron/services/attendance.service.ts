import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getActiveAttendance(date: string): Promise<ActiveAttendanceResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/attendance/${date}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        return { success: false, data: [], message: data.message || "فشل جلب الحضور" }
    }
    return { success: true, data: data.data }
}

export async function getAttendanceReport(
    month: number,
    year: number
): Promise<MonthlyReportResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/attendance/report?month=${month}&year=${year}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        return { success: false, data: [], message: data.message || "فشل جلب التقرير" }
    }
    return { success: true, data: data.data }
}

export async function markAttendance(
    employeeId: string,
    date: string,
    action: "in" | "out",
    time: string
): Promise<MarkAttendanceResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId, date, action, time })
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        return { success: false, message: data.message || "فشل تسجيل الحضور", errors: data.errors }
    }
    return { success: true, data: data.data, message: data.message }
}
