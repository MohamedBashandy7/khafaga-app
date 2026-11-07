import { useCallback, useState } from "react"
import { EmployeesContext, type Employee } from "./EmployeesContext"

export default function EmployeesProvider({ children }: { children: React.ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEmployees = useCallback(async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        setError(null)
        try {
            const result = await window.electron.employees.getAllEmployees(page, limit)
            if (result.success) {
                setEmployees(result.data)
            } else {
                setError(result.message || "فشل جلب الموظفين")
                setEmployees([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setEmployees([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <EmployeesContext.Provider
            value={{
                employees,
                loading,
                error,
                fetchEmployees
            }}>
            {children}
        </EmployeesContext.Provider>
    )
}
