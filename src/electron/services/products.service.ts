import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getAllProducts(page = 1, limit = 10): Promise<ProductsResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        if (data.message === "No data found") {
            return { success: true, data: [] }
        }
        return { success: false, data: [], message: data.message || "فشل جلب المنتجات" }
    }
    return { success: true, data: data.data || [] }
}
export async function deleteProduct(id: string): Promise<DeleteProductResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل حذف المنتج" }
    return { success: true, message: data.message }
}

export async function getProduct(id: string): Promise<GetProductResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
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
            message: data.message || "فشل الحصول على المنتج",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}
export async function createProduct(
    name: string,
    categoryId: string,
    wholesaleWholesalePrice: number,
    wholesalePrice: number,
    sellingPrice: number
): Promise<CreateProductResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            category_id: categoryId,
            wholesale_wholesale_price: wholesaleWholesalePrice,
            wholesale_price: wholesalePrice,
            selling_price: sellingPrice
        })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل إنشاء المنتج",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}

export async function updateProduct(
    id: string,
    name: string,
    categoryId: string,
    wholesaleWholesalePrice: number,
    wholesalePrice: number,
    sellingPrice: number
): Promise<UpdateProductResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            category_id: categoryId,
            wholesale_wholesale_price: wholesaleWholesalePrice,
            wholesale_price: wholesalePrice,
            selling_price: sellingPrice
        })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل تحديث المنتج",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}
