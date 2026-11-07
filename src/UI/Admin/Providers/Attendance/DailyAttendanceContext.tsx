import { createContext } from "react"

export type ActiveAttendanceItem = {
    employee: {
        _id: string
        name: string
        salary: number
        shiftStart: string
        shiftEnd: string
    }
    attendance: {
        _id: string
        checkIn: string | null
        checkOut: string | null
        date: string
    } | null
}

export type DailyAttendanceContextType = {
    records: ActiveAttendanceItem[]
    loading: boolean
    error: string | null
    fetchData: (date: string) => Promise<void>
}

export const DailyAttendanceContext = createContext<DailyAttendanceContextType>({
    records: [],
    loading: true,
    error: null,
    fetchData: async () => {}
})
