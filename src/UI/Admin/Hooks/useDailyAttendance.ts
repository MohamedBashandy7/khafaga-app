import { useContext } from "react"
import {
    DailyAttendanceContext,
    type DailyAttendanceContextType
} from "../Providers/Attendance/DailyAttendanceContext"

export function useDailyAttendance(): DailyAttendanceContextType {
    return useContext(DailyAttendanceContext)
}
