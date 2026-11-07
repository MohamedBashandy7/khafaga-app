import { createContext } from "react"

export interface Expense {
    _id: string
    name: string
    amount: number
    created_at: string
    updated_at: string
}

export type ExpensesContextType = {
    expenses: Expense[]
    loading: boolean
    error: string | null
    fetchExpenses: (page?: number, limit?: number) => Promise<void>
}

export const ExpensesContext = createContext<ExpensesContextType>({
    expenses: [],
    loading: true,
    error: null,
    fetchExpenses: async () => {}
})
