import { createContext } from "react"

export interface Employee {
    _id: string
    name: string
    salary: number
    shiftStart: string
    shiftEnd: string
    created_at: string
    updated_at: string
}

export type EmployeesContextType = {
    employees: Employee[]
    loading: boolean
    error: string | null
    fetchEmployees: (page?: number, limit?: number) => Promise<void>
}

export const EmployeesContext = createContext<EmployeesContextType>({
    employees: [],
    loading: true,
    error: null,
    fetchEmployees: async () => {}
})
