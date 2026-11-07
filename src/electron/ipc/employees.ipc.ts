import { ipcHandle } from "../utils.js"
import * as employeesService from "../services/employees.service.js"

export function registerEmployeesIPC() {
    ipcHandle("employees:getAll", async (params: { page?: number; limit?: number }) => {
        return employeesService.getAllEmployees(params?.page, params?.limit)
    })
    ipcHandle(
        "employees:create",
        async (name: string, salary: number, shiftStart: string, shiftEnd: string) => {
            return employeesService.createEmployee(name, salary, shiftStart, shiftEnd)
        }
    )
    ipcHandle("employees:delete", async (id: string) => {
        return employeesService.deleteEmployee(id)
    })
    ipcHandle("employees:get", async (id: string) => {
        return employeesService.getEmployee(id)
    })
    ipcHandle(
        "employees:update",
        async (id: string, name: string, salary: number, shiftStart: string, shiftEnd: string) => {
            return employeesService.updateEmployee(id, name, salary, shiftStart, shiftEnd)
        }
    )
}
