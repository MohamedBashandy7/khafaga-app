import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getAllSuppliers(page = 1, limit = 10): Promise<SuppliersResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/suppliers?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        if (data.message === "No data found") {
            return { success: true, data: [] }
        }
        return { success: false, data: [], message: data.message || "فشل جلب الموردين" }
    }
    return { success: true, data: data.data || [] }
}

export async function createSupplier(
    name: string,
    phone: string,
    governorate: string,
    address?: string
): Promise<CreateSupplierResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, governorate, address })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل إنشاء المورد", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}

export async function deleteSupplier(id: string): Promise<DeleteSupplierResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل حذف المورد" }
    return { success: true, message: data.message }
}

export async function updateSupplier(
    id: string,
    name: string,
    phone: string,
    governorate: string,
    address?: string
): Promise<UpdateSupplierResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, governorate, address })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل تحديث المورد", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}

export async function getSupplier(id: string): Promise<GetSupplierResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل جلب المورد", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}
