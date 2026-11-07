import { useContext } from "react"
import {
    EmployeesContext,
    type EmployeesContextType
} from "../Providers/Employees/EmployeesContext"

export function useEmployees(): EmployeesContextType {
    return useContext(EmployeesContext)
}
