import { useCallback, useState } from "react"
import { AttendanceReportContext, type MonthlyReportItem } from "./AttendanceReportContext"

export default function AttendanceReportProvider({ children }: { children: React.ReactNode }) {
    const [reportData, setReportData] = useState<MonthlyReportItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchReport = useCallback(async (month: number, year: number) => {
        setLoading(true)
        setError(null)
        try {
            const result = await window.electron.attendance.getReport(month, year)
            if (result.success) {
                setReportData(result.data)
            } else {
                setError(result.message || "فشل جلب التقرير")
                setReportData([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setReportData([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <AttendanceReportContext.Provider value={{ reportData, loading, error, fetchReport }}>
            {children}
        </AttendanceReportContext.Provider>
    )
}
