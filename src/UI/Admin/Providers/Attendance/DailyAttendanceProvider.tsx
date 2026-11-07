import { useCallback, useState } from "react"
import { DailyAttendanceContext, type ActiveAttendanceItem } from "./DailyAttendanceContext"

export default function DailyAttendanceProvider({ children }: { children: React.ReactNode }) {
    const [records, setRecords] = useState<ActiveAttendanceItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async (date: string) => {
        setLoading(true)
        setError(null)
        try {
            const result = await window.electron.attendance.getActive(date)
            if (result.success) {
                setRecords(result.data)
            } else {
                setError(result.message || "فشل جلب البيانات")
                setRecords([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setRecords([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <DailyAttendanceContext.Provider value={{ records, loading, error, fetchData }}>
            {children}
        </DailyAttendanceContext.Provider>
    )
}
