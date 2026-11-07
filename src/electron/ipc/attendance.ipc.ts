import { ipcHandle } from "../utils.js"
import * as attendanceService from "../services/attendance.service.js"

export function registerAttendanceIPC() {
    ipcHandle("attendance:getActive", async (date: string) => {
        return attendanceService.getActiveAttendance(date)
    })
    ipcHandle("attendance:getReport", async (month: number, year: number) => {
        return attendanceService.getAttendanceReport(month, year)
    })
    ipcHandle(
        "attendance:mark",
        async (employeeId: string, date: string, action: string, time: string) => {
            return attendanceService.markAttendance(employeeId, date, action as "in" | "out", time)
        }
    )
}
