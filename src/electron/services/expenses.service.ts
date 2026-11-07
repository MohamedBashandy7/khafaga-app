import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getAllExpenses(page = 1, limit = 10): Promise<ExpensesResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/expenses?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        // Treat "No data found" as empty data, not an error
        if (data.message === "No data found") {
            return { success: true, data: [] }
        }
        return { success: false, data: [], message: data.message || "فشل جلب المصاريف" }
    }
    return { success: true, data: data.data || [] }
}

export async function createExpense(name: string, amount: number): Promise<CreateExpenseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            amount
        })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل إنشاء المصروف",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}

export async function deleteExpense(id: string): Promise<DeleteExpenseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل حذف المصروف" }
    return { success: true, message: data.message }
}

export async function updateExpense(
    id: string,
    name: string,
    amount: number
): Promise<UpdateExpenseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            amount
        })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل تحديث المصروف",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}

export async function getExpense(id: string): Promise<GetExpenseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل الحصول على المصروف",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}
