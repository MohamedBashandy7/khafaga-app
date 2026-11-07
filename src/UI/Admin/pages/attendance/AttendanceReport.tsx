import { useState, useEffect } from "react"
import { useAttendanceReport } from "../../Hooks/useAttendanceReport"
import Loader from "../../shared/loading"
import NoData from "../../shared/nodata"

function minutesToHours(mins: number): string {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}:${String(m).padStart(2, "0")}`
}

export function AttendanceReport() {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 2026 + 1 }, (_, i) => 2026 + i)
    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

    const { reportData, loading, error, fetchReport } = useAttendanceReport()

    useEffect(() => {
        fetchReport(selectedMonth, selectedYear)
    }, [selectedMonth, selectedYear, fetchReport])

    return (
        <div
            className="p-6"
            dir="rtl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">تقارير الحضور والانصراف</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded-xl bg-gray-800 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50">
                    {years.map((y) => (
                        <option
                            key={y}
                            value={y}
                            className="bg-gray-800 text-white">
                            {y}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="rounded-xl bg-gray-800 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50">
                    {months.map((m) => (
                        <option
                            key={m}
                            value={m}
                            className="bg-gray-800 text-white">
                            {m}
                        </option>
                    ))}
                </select>
            </div>

            {loading ?
                <Loader
                    force
                    contained
                />
            : error ?
                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">{error}</div>
            :   <div className="overflow-x-auto overflow-hidden rounded-lg bg-black/20 shadow-lg">
                    <table className="w-full text-center text-white">
                        <thead className="bg-white/10 text-white">
                            <tr>
                                <th className="px-4 py-3 text-sm font-bold">التاريخ</th>
                                <th className="px-4 py-3 text-sm font-bold">الموظف</th>
                                <th className="px-4 py-3 text-sm font-bold">بداية الدوام</th>
                                <th className="px-4 py-3 text-sm font-bold">الحضور</th>
                                <th className="px-4 py-3 text-sm font-bold">تأخير</th>
                                <th className="px-4 py-3 text-sm font-bold">نهاية الدوام</th>
                                <th className="px-4 py-3 text-sm font-bold">الانصراف</th>
                                <th className="px-4 py-3 text-sm font-bold">خروج مبكر</th>
                                <th className="px-4 py-3 text-sm font-bold">ساعات العمل</th>
                                <th className="px-4 py-3 text-sm font-bold">الخصم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {reportData.length > 0 ?
                                reportData.map((item, idx) => (
                                    <tr
                                        key={`${item.date}-${item.employee._id}-${idx}`}
                                        className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-sm">{item.date}</td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {item.employee.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{item.shiftStart}</td>
                                        <td className="px-4 py-3 text-sm">{item.checkIn}</td>
                                        <td className="px-4 py-3 text-sm text-yellow-400">
                                            {item.delayMinutes > 0 ?
                                                minutesToHours(item.delayMinutes)
                                            :   "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{item.shiftEnd}</td>
                                        <td className="px-4 py-3 text-sm">{item.checkOut}</td>
                                        <td className="px-4 py-3 text-sm text-red-400">
                                            {item.earlyMinutes > 0 ?
                                                minutesToHours(item.earlyMinutes)
                                            :   "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.workedMinutes > 0 ?
                                                minutesToHours(item.workedMinutes)
                                            :   "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{item.deduction}%</td>
                                    </tr>
                                ))
                            :   <tr>
                                    <td
                                        colSpan={10}
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
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line
                                                        x1="16"
                                                        y1="13"
                                                        x2="8"
                                                        y2="13"
                                                    />
                                                    <line
                                                        x1="16"
                                                        y1="17"
                                                        x2="8"
                                                        y2="17"
                                                    />
                                                    <polyline points="10 9 9 9 8 9" />
                                                </svg>
                                            }
                                            message="لا توجد بيانات لهذا الشهر"
                                        />
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}
