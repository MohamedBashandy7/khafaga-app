import { ipcHandle } from "../utils.js"
import * as expensesService from "../services/expenses.service.js"

export function registerExpensesIPC() {
    ipcHandle("expenses:getAll", async (params: { page?: number; limit?: number }) => {
        return expensesService.getAllExpenses(params?.page, params?.limit)
    })
    ipcHandle("expenses:create", async (name: string, amount: number) => {
        return expensesService.createExpense(name, amount)
    })
    ipcHandle("expenses:delete", async (id: string) => {
        return expensesService.deleteExpense(id)
    })
    ipcHandle("expenses:get", async (id: string) => {
        return expensesService.getExpense(id)
    })
    ipcHandle("expenses:update", async (id: string, name: string, amount: number) => {
        return expensesService.updateExpense(id, name, amount)
    })
}
