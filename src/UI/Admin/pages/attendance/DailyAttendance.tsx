import { useEffect, useState } from "react"
import { useDailyAttendance } from "../../Hooks/useDailyAttendance"
import Loader from "../../shared/loading"
import NoData from "../../shared/nodata"
import { showError, showSuccess } from "../../../../services/sweetAlert"

function getTodayDate(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function getCurrentTime(): string {
    const now = new Date()
    let hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    if (hours === 0) hours = 12
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`
}

export function DailyAttendance() {
    const today = getTodayDate()
    const { records, loading, error, fetchData } = useDailyAttendance()
    const [markingId, setMarkingId] = useState<string | null>(null)

    useEffect(() => {
        fetchData(today)
    }, [fetchData, today])

    const handleMark = async (employeeId: string, action: "in" | "out") => {
        setMarkingId(employeeId)
        try {
            const result = await window.electron.attendance.mark(
                employeeId,
                today,
                action,
                getCurrentTime()
            )
            if (result.success) {
                showSuccess(action === "in" ? "تم تسجيل الحضور" : "تم تسجيل الانصراف")
                await fetchData(today)
            } else {
                showError(result.message || "فشل التسجيل")
            }
        } catch {
            showError("خطأ في الاتصال")
        } finally {
            setMarkingId(null)
        }
    }

    if (loading)
        return (
            <Loader
                force
                contained
            />
        )

    if (error) {
        return (
            <div
                className="p-6"
                dir="rtl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">تسجيل الحضور والانصراف</h1>
                </div>
                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">{error}</div>
            </div>
        )
    }

    return (
        <div
            className="p-6"
            dir="rtl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">تسجيل الحضور والانصراف</h1>
                <p className="text-white/50 mt-1">تاريخ اليوم: {today}</p>
            </div>

            <div className="overflow-x-auto overflow-hidden rounded-lg bg-black/20 shadow-lg">
                <table className="w-full text-center text-white">
                    <thead className="bg-white/10 text-white">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold uppercase">اسم الموظف</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">وقت الحضور</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">وقت الانصراف</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {records.length > 0 ?
                            records.map((item) => {
                                const emp = item.employee
                                const att = item.attendance
                                const checkedIn = att?.checkIn
                                const checkedOut = att?.checkOut

                                return (
                                    <tr
                                        key={emp._id}
                                        className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {emp.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {checkedIn || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {checkedOut || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {!checkedIn && (
                                                <button
                                                    onClick={() => handleMark(emp._id, "in")}
                                                    disabled={markingId === emp._id}
                                                    className="cursor-pointer rounded bg-green-500/40 px-3 py-1 text-sm text-green-300 hover:bg-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {markingId === emp._id ?
                                                        "جاري..."
                                                    :   "تسجيل حضور"}
                                                </button>
                                            )}
                                            {checkedIn && !checkedOut && (
                                                <button
                                                    onClick={() => handleMark(emp._id, "out")}
                                                    disabled={markingId === emp._id}
                                                    className="cursor-pointer rounded bg-blue-500/40 px-3 py-1 text-sm text-blue-300 hover:bg-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {markingId === emp._id ?
                                                        "جاري..."
                                                    :   "تسجيل انصراف"}
                                                </button>
                                            )}
                                            {checkedIn && checkedOut && (
                                                <span className="text-green-400 text-sm">
                                                    مكتمل
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        :   <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-8">
                                    <NoData
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle
                                                    cx="9"
                                                    cy="7"
                                                    r="4"
                                                />
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        }
                                        message="لا يوجد موظفين ضمن وقت العمل الحالي"
                                    />
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
