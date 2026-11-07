import { createContext } from "react"

export type MonthlyReportItem = {
    date: string
    employee: {
        _id: string
        name: string
        salary: number
    }
    shiftStart: string
    shiftEnd: string
    checkIn: string
    checkOut: string
    delayMinutes: number
    earlyMinutes: number
    workedMinutes: number
    deduction: number
}

export type AttendanceReportContextType = {
    reportData: MonthlyReportItem[]
    loading: boolean
    error: string | null
    fetchReport: (month: number, year: number) => Promise<void>
}

export const AttendanceReportContext = createContext<AttendanceReportContextType>({
    reportData: [],
    loading: true,
    error: null,
    fetchReport: async () => {}
})
