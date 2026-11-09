import { useInvoicesPurchase } from "../../../Hooks/useInvoicesPurchase"
import Loader from "../../../shared/loading"
import NoData from "../../../shared/nodata"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { confirmDelete, showError, showSuccess } from "../../../../../services/sweetAlert"

export function GetAllInvoicesPurchase() {
    const { invoices, loading, error, fetchInvoices } = useInvoicesPurchase()
    const navigate = useNavigate()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

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
                    <h1 className="text-2xl font-bold text-white">فواتير الشراء</h1>
                </div>
                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">{error}</div>
            </div>
        )
    }

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete()
        if (!confirmed) return
        setDeletingId(id)
        const result = await window.electron.invoicesPurchase.delete(id)
        setDeletingId(null)
        if (result.success) {
            showSuccess("تم حذف الفاتورة بنجاح")
            fetchInvoices()
        } else {
            showError(result.message || "فشل الحذف")
        }
    }

    return (
        <div
            className="p-6"
            dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">فواتير الشراء</h1>
                <button
                    onClick={() => navigate("/invoices/purchase/add")}
                    className="cursor-pointer rounded-lg bg-green-500/40 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/50 transition-colors">
                    + فاتورة شراء جديدة
                </button>
            </div>

            <div className="overflow-x-auto overflow-hidden rounded-lg bg-black/20 shadow-lg">
                <table className="w-full text-center text-white">
                    <thead className="bg-white/10 text-white">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold uppercase">رقم الفاتورة</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">تاريخ الفاتورة</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">عدد التصنيفات</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">الإجمالي</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {invoices.length > 0 ?
                            invoices.map((inv) => (
                                <tr
                                    key={inv.id}
                                    className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {inv.invoiceNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {new Date(inv.invoiceDate).toLocaleDateString("ar-EG")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {inv.items.length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {inv.total === null ? "غير معروف" : inv.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2 justify-center">
                                            <Link
                                                to={`/invoices/purchase/edit/${inv.id}`}
                                                className="cursor-pointer rounded bg-blue-500/40 px-3 py-1 text-sm text-blue-300 hover:bg-blue-500/50 transition-colors">
                                                تعديل
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(inv.id)}
                                                disabled={deletingId === inv.id}
                                                className="cursor-pointer rounded bg-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                {deletingId === inv.id ? "جاري..." : "حذف"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        :   <tr>
                                <td
                                    colSpan={5}
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
                                        message="لا توجد فواتير شراء"
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
