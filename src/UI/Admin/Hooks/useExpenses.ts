import { useContext } from "react"
import { ExpensesContext, type ExpensesContextType } from "../Providers/Expenses/ExpensesContext"

export function useExpenses(): ExpensesContextType {
    return useContext(ExpensesContext)
}
