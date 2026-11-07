import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getAllInvoicesPurchase(
    page = 1,
    limit = 10
): Promise<InvoicesPurchaseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/invoice/purchase?page=${page}&limit=${limit}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        if (data.message === "No data found") return { success: true, data: [] }
        return { success: false, data: [], message: data.message || "فشل جلب الفواتير" }
    }
    return { success: true, data: data.data || [] }
}

export async function getInvoicePurchase(id: string): Promise<GetInvoicePurchaseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/invoice/purchase/${id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل جلب الفاتورة" }
    return { success: true, data: data.data }
}

export async function createInvoicePurchase(
    supplier: string,
    items: { product: string; quantity: number; purchasePrice: number }[],
    discount: number,
    tax: number,
    paid: number,
    notes: string
): Promise<CreateInvoicePurchaseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/invoice/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ supplier, items, discount, tax, paid, notes })
    })
    const data = await response.json()
    console.log(data)
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل إنشاء الفاتورة",
            errors: data.errors
        }
    return { success: true, data: data.data }
}

export async function updateInvoicePurchase(
    id: string,
    supplier: string,
    items: { product: string; quantity: number; purchasePrice: number }[],
    discount: number,
    tax: number,
    paid: number,
    notes: string
): Promise<UpdateInvoicePurchaseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/invoice/purchase/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ supplier, items, discount, tax, paid, notes })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل تحديث الفاتورة",
            errors: data.errors
        }
    return { success: true, data: data.data }
}

export async function deleteInvoicePurchase(id: string): Promise<DeleteInvoicePurchaseResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/invoice/purchase/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل حذف الفاتورة" }
    return { success: true, message: data.message }
}
