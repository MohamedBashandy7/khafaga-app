import { useExpenses } from "../../Hooks/useExpenses"
import Loader from "../../shared/loading"
import NoData from "../../shared/nodata"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { confirmDelete, showError, showSuccess } from "../../../../services/sweetAlert"
import { Link } from "react-router-dom"

export function GetAllExpenses() {
    const { expenses, loading, error, fetchExpenses } = useExpenses()
    const navigate = useNavigate()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])
    if (loading) {
        return (
            <Loader
                force
                contained
            />
        )
    }

    if (error) {
        return (
            <div
                className="p-6"
                dir="rtl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">المصاريف</h1>
                </div>
                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">{error}</div>
            </div>
        )
    }

    const handleDelete = async (expenseId: string) => {
        const confirmed = await confirmDelete()
        if (!confirmed) return

        setDeletingId(expenseId)
        const result = await window.electron.expenses.deleteExpense(expenseId)
        setDeletingId(null)

        if (result.success) {
            showSuccess("تم حذف المصروف بنجاح")
            fetchExpenses()
        } else {
            showError(result.message || "فشل الحذف")
        }
    }

    return (
        <div
            className="p-6"
            dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">المصاريف</h1>
                    <p className="text-white/70">إدارة مصاريف الشركة</p>
                </div>
                <button
                    onClick={() => navigate("/expenses/add")}
                    className="cursor-pointer rounded-lg bg-green-500/40 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/50 transition-colors">
                    + إضافة مصروف جديد
                </button>
            </div>

            <div className="overflow-x-auto overflow-hidden rounded-lg bg-black/20 shadow-lg">
                <table className="w-full text-center text-white">
                    <thead className="bg-white/10 text-white">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                اسم المصروف
                            </th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                المبلغ
                            </th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                الإجراءات
                            </th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                تاريخ الإنشاء
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {expenses.length > 0 ?
                            expenses.map((expense) => (
                                <tr
                                    key={expense._id}
                                    className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {expense.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2 justify-center">
                                            <Link
                                                to={`/expenses/edit/${expense._id}`}
                                                className="cursor-pointer rounded bg-blue-500/40 px-3 py-1 text-sm text-blue-300 hover:bg-blue-500/50 transition-colors">
                                                تعديل
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                disabled={deletingId === expense._id}
                                                className="cursor-pointer rounded bg-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                {deletingId === expense._id ?
                                                    <span className="flex items-center gap-1">
                                                        <svg
                                                            className="animate-spin h-4 w-4"
                                                            viewBox="0 0 24 24">
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                                fill="none"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                            />
                                                        </svg>
                                                        جاري...
                                                    </span>
                                                :   "حذف"}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                        {new Date(expense.created_at).toLocaleDateString("ar-EG")}
                                    </td>
                                </tr>
                            ))
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
                                                <rect
                                                    x="2"
                                                    y="5"
                                                    width="20"
                                                    height="14"
                                                    rx="2"
                                                />
                                                <line
                                                    x1="2"
                                                    y1="10"
                                                    x2="22"
                                                    y2="10"
                                                />
                                            </svg>
                                        }
                                        message="لا توجد مصاريف"
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
