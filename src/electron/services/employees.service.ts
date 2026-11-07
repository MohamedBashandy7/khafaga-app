import { isDev } from "../utils.js"
import * as tokenStore from "../security/tokenStore.js"

const API_BASE_URL =
    isDev() ? "http://localhost:3005/api" : "https://your-production-domain.com/api"

export async function getAllEmployees(page = 1, limit = 10): Promise<EmployeesResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, data: [], message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/employees?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
        if (data.message === "No data found") {
            return { success: true, data: [] }
        }
        return { success: false, data: [], message: data.message || "فشل جلب الموظفين" }
    }
    return { success: true, data: data.data || [] }
}

export async function createEmployee(
    name: string,
    salary: number,
    shiftStart: string,
    shiftEnd: string
): Promise<CreateEmployeeResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, salary, shiftStart, shiftEnd })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل إنشاء الموظف", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}

export async function deleteEmployee(id: string): Promise<DeleteEmployeeResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل حذف الموظف" }
    return { success: true, message: data.message }
}

export async function updateEmployee(
    id: string,
    name: string,
    salary: number,
    shiftStart: string,
    shiftEnd: string
): Promise<UpdateEmployeeResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, salary, shiftStart, shiftEnd })
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return { success: false, message: data.message || "فشل تحديث الموظف", errors: data.errors }
    return { success: true, data: data.data, message: data.message }
}

export async function getEmployee(id: string): Promise<GetEmployeeResponse> {
    const token = await tokenStore.getToken()
    if (!token) return { success: false, message: "غير مصرح" }

    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (!response.ok || !data.success)
        return {
            success: false,
            message: data.message || "فشل الحصول على الموظف",
            errors: data.errors
        }
    return { success: true, data: data.data, message: data.message }
}
