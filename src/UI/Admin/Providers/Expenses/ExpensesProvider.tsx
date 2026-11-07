import { useCallback, useState } from "react"
import { ExpensesContext, type Expense } from "./ExpensesContext"

export default function ExpensesProvider({ children }: { children: React.ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchExpenses = useCallback(async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        setError(null)

        try {
            const result = await window.electron.expenses.getAllExpenses(page, limit)
            if (result.success) {
                setExpenses(result.data)
            } else {
                setError(result.message || "فشل جلب المصاريف")
                setExpenses([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setExpenses([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <ExpensesContext.Provider
            value={{
                expenses,
                loading,
                error,
                fetchExpenses
            }}>
            {children}
        </ExpensesContext.Provider>
    )
}
