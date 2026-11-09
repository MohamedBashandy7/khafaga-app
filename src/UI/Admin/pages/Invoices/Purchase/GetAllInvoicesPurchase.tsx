
import { useInvoicesPurchase } from "../../../Hooks/useInvoicesPurchase"
import Loader from "../../../shared/loading"
import NoData from "../../../shared/nodata"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
    confirmDelete,
    showError,
    showSuccess
} from "../../../../../services/sweetAlert"

const formatDateValue = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

const getDateFromValue = (value: string) => {
    const [year, month, day] = value.split("-").map(Number)
    return new Date(year, month - 1, day)
}

export function GetAllInvoicesPurchase() {
    const { invoices, loading, error, fetchInvoices } = useInvoicesPurchase()
    const navigate = useNavigate()

    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [invoiceNo, setInvoiceNo] = useState("")
    const [invoiceDate, setInvoiceDate] = useState("")
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const today = new Date()
        return new Date(today.getFullYear(), today.getMonth(), 1)
    })

    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const calendarDays = Array.from(
        { length: daysInMonth },
        (_, index) => index + 1
    )

    const monthName = calendarMonth.toLocaleDateString("ar-EG", {
        month: "long",
        year: "numeric"
    })

    const weekdays = [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت"
    ]

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        fetchInvoices(1, 10, invoiceNo.trim(), invoiceDate)
    }

    const handleResetSearch = () => {
        setInvoiceNo("")
        setInvoiceDate("")
        setCalendarOpen(false)
        fetchInvoices(1, 10, "", "")
    }

    const handleSelectDate = (day: number) => {
        const selectedDate = new Date(year, month, day)
        setInvoiceDate(formatDateValue(selectedDate))
        setCalendarOpen(false)
    }

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete()
        if (!confirmed) return

        setDeletingId(id)

        try {
            const result = await window.electron.invoicesPurchase.delete(id)

            if (result.success) {
                showSuccess("تم حذف الفاتورة بنجاح")
                await fetchInvoices(1, 10, invoiceNo.trim(), invoiceDate)
            } else {
                showError(result.message || "فشل الحذف")
            }
        } catch {
            showError("حدث خطأ أثناء حذف الفاتورة")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="p-6" dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                    فواتير الشراء
                </h1>

                <button
                    onClick={() => navigate("/invoices/purchase/add")}
                    className="cursor-pointer rounded-lg bg-green-500/40 px-4 py-2 text-sm font-semibold text-green-300 transition-colors hover:bg-green-500/50"
                >
                    + فاتورة شراء جديدة
                </button>
            </div>

            <form
                onSubmit={handleSearch}
                className="mb-6 flex flex-wrap items-end gap-3"
            >
                <div className="min-w-[200px] flex-1">
                    <label className="mb-2 block text-sm font-medium text-white">
                        رقم الفاتورة
                    </label>

                    <input
                        type="text"
                        value={invoiceNo}
                        onChange={event => setInvoiceNo(event.target.value)}
                        placeholder="ابحث برقم الفاتورة..."
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/40 focus:border-green-500"
                    />
                </div>

                <div className="relative min-w-[200px] flex-1">
                    <label className="mb-2 block text-sm font-medium text-white">
                        تاريخ الفاتورة
                    </label>

                    <button
                        type="button"
                        onClick={() => {
                            if (invoiceDate) {
                                setCalendarMonth(
                                    new Date(
                                        getDateFromValue(invoiceDate).getFullYear(),
                                        getDateFromValue(invoiceDate).getMonth(),
                                        1
                                    )
                                )
                            }

                            setCalendarOpen(!calendarOpen)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-right text-white outline-none transition-colors hover:border-green-500"
                    >
                        <span className={invoiceDate ? "text-white" : "text-white/40"}>
                            {invoiceDate
                                ? getDateFromValue(invoiceDate).toLocaleDateString("ar-EG")
                                : "اختر تاريخ الفاتورة"}
                        </span>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </button>

                    {calendarOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-[320px] rounded-xl border border-white/10 bg-[#1c1c2b] p-4 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCalendarMonth(
                                            new Date(year, month - 1, 1)
                                        )
                                    }
                                    className="rounded-lg p-2 text-white hover:bg-white/10"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="m15 18-6-6 6-6" />
                                    </svg>
                                </button>

                                <select
                                    value={month}
                                    onChange={event =>
                                        setCalendarMonth(
                                            new Date(
                                                year,
                                                Number(event.target.value),
                                                1
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-white/10 bg-[#29293b] px-3 py-2 text-sm text-white outline-none"
                                >
                                    {Array.from({ length: 12 }, (_, index) => (
                                        <option
                                            key={index}
                                            value={index}
                                            className="bg-[#29293b]"
                                        >
                                            {new Date(2026, index, 1).toLocaleDateString(
                                                "ar-EG",
                                                { month: "long" }
                                            )}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={year}
                                    onChange={event =>
                                        setCalendarMonth(
                                            new Date(
                                                Number(event.target.value),
                                                month,
                                                1
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-white/10 bg-[#29293b] px-3 py-2 text-sm text-white outline-none"
                                >
                                    {Array.from(
                                        { length: 31 },
                                        (_, index) => new Date().getFullYear() - 15 + index
                                    ).map(itemYear => (
                                        <option
                                            key={itemYear}
                                            value={itemYear}
                                            className="bg-[#29293b]"
                                        >
                                            {itemYear}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCalendarMonth(
                                            new Date(year, month + 1, 1)
                                        )
                                    }
                                    className="rounded-lg p-2 text-white hover:bg-white/10"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-2 grid grid-cols-7 gap-1">
                                {weekdays.map(day => (
                                    <div
                                        key={day}
                                        className="py-2 text-center text-xs font-semibold text-white/50"
                                    >
                                        {day.slice(0, 2)}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {Array.from(
                                    { length: firstDay },
                                    (_, index) => (
                                        <div key={`empty-${index}`} />
                                    )
                                )}

                                {calendarDays.map(day => {
                                    const dateValue = formatDateValue(
                                        new Date(year, month, day)
                                    )
                                    const selected = invoiceDate === dateValue
                                    const today =
                                        formatDateValue(new Date()) === dateValue

                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleSelectDate(day)}
                                            className={`h-9 rounded-lg text-sm transition-colors ${
                                                selected
                                                    ? "bg-green-500 font-bold text-white"
                                                    : today
                                                      ? "border border-green-500 text-green-400"
                                                      : "text-white hover:bg-white/10"
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarMonth(
                                            new Date(
                                                new Date().getFullYear(),
                                                new Date().getMonth(),
                                                1
                                            )
                                        )
                                        setInvoiceDate(formatDateValue(new Date()))
                                        setCalendarOpen(false)
                                    }}
                                    className="text-sm text-green-400 hover:text-green-300"
                                >
                                    اليوم
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setInvoiceDate("")
                                        setCalendarOpen(false)
                                    }}
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    مسح التاريخ
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer rounded-lg bg-blue-500/40 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500/50 disabled:opacity-50"
                >
                    بحث
                </button>

                <button
                    type="button"
                    onClick={handleResetSearch}
                    disabled={loading}
                    className="cursor-pointer rounded-lg bg-white/10 px-6 py-3 font-semibold text-white/70 transition-colors hover:bg-white/20 disabled:opacity-50"
                >
                    مسح البحث
                </button>
            </form>

            {error && (
                <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-center text-red-400">
                    {error}
                </div>
            )}

            <div className="overflow-hidden overflow-x-auto rounded-lg bg-black/20 shadow-lg">
                {loading ? (
                    <Loader force contained />
                ) : (
                    <table className="w-full text-center text-white">
                        <thead className="bg-white/10 text-white">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold uppercase">
                                    رقم الفاتورة
                                </th>
                                <th className="px-6 py-4 text-sm font-bold uppercase">
                                    تاريخ الفاتورة
                                </th>
                                <th className="px-6 py-4 text-sm font-bold uppercase">
                                    عدد التصنيفات
                                </th>
                                <th className="px-6 py-4 text-sm font-bold uppercase">
                                    الإجمالي
                                </th>
                                <th className="px-6 py-4 text-sm font-bold uppercase">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/10">
                            {invoices.length > 0 ? (
                                invoices.map(inv => (
                                    <tr
                                        key={inv.id}
                                        className="transition-colors hover:bg-white/5"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            {inv.invoiceNo}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {new Date(inv.invoiceDate).toLocaleDateString("ar-EG")}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {inv.items.length}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {inv.total === null
                                                ? "غير معروف"
                                                : inv.total.toFixed(2)}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    to={`/invoices/purchase/edit/${inv.id}`}
                                                    className="cursor-pointer rounded bg-blue-500/40 px-3 py-1 text-sm text-blue-300 transition-colors hover:bg-blue-500/50"
                                                >
                                                    تعديل
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    disabled={deletingId === inv.id}
                                                    className="cursor-pointer rounded bg-red-500/40 px-3 py-1 text-sm text-red-300 transition-colors hover:bg-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {deletingId === inv.id
                                                        ? "جاري..."
                                                        : "حذف"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8">
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
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10 9 9 9 8 9" />
                                                </svg>
                                            }
                                            message={
                                                invoiceNo || invoiceDate
                                                    ? "لا توجد فواتير مطابقة للبحث"
                                                    : "لا توجد فواتير شراء"
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
