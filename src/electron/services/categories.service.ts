import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"
export async function getAllCategories(page = 1, limit = 10): Promise<CategoriesResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/categories?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        // Treat "No data found" as empty data, not an error
        if (data.message === "No data found") {
            return { success: true, data: [] }
        }
        return { success: false, data: [], message: data.message || "فشل جلب الأقسام" }
    }
    return { success: true, data: data.data || [] }
}

export async function createCategory(name: string): Promise<CreateCategoryResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(name)
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل إنشاء القسم", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}
export async function deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل حذف القسم" }
    return { success: true, message: data.message }
}
export async function updateCategory(id: string, name: string): Promise<UpdateCategoryResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل تحديث القسم", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}
export async function getCategory(id: string): Promise<GetCategoryResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل الحصول على القسم",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}
