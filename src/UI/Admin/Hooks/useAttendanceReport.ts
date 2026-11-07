import { useContext } from "react"
import {
    AttendanceReportContext,
    type AttendanceReportContextType
} from "../Providers/Attendance/AttendanceReportContext"

export function useAttendanceReport(): AttendanceReportContextType {
    return useContext(AttendanceReportContext)
}
