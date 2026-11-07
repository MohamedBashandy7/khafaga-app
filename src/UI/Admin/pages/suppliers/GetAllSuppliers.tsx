import { useSuppliers } from "../../Hooks/useSuppliers"
import Loader from "../../shared/loading"
import NoData from "../../shared/nodata"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { confirmDelete, showError, showSuccess } from "../../../../services/sweetAlert"

export function GetAllSuppliers() {
    const { suppliers, loading, error, fetchSuppliers } = useSuppliers()
    const navigate = useNavigate()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetchSuppliers()
    }, [fetchSuppliers])

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
                    <h1 className="text-2xl font-bold text-white">الموردين</h1>
                </div>
                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">{error}</div>
            </div>
        )
    }

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete()
        if (!confirmed) return
        setDeletingId(id)
        const result = await window.electron.suppliers.deleteSupplier(id)
        setDeletingId(null)
        if (result.success) {
            showSuccess("تم حذف المورد بنجاح")
            fetchSuppliers()
        } else {
            showError(result.message || "فشل الحذف")
        }
    }

    return (
        <div
            className="p-6"
            dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">الموردين</h1>
                <button
                    onClick={() => navigate("/suppliers/add")}
                    className="cursor-pointer rounded-lg bg-green-500/40 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/50 transition-colors">
                    + إضافة مورد جديد
                </button>
            </div>

            <div className="overflow-x-auto overflow-hidden rounded-lg bg-black/20 shadow-lg">
                <table className="w-full text-center text-white">
                    <thead className="bg-white/10 text-white">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold uppercase">الاسم</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">رقم الهاتف</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">المحافظة</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">العنوان</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">الإجراءات</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase">تاريخ الإنشاء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {suppliers.length > 0 ?
                            suppliers.map((supplier) => (
                                <tr
                                    key={supplier._id}
                                    className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {supplier.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {supplier.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {supplier.governorate?.name || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {supplier.address || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2 justify-center">
                                            <Link
                                                to={`/suppliers/edit/${supplier._id}`}
                                                className="cursor-pointer rounded bg-blue-500/40 px-3 py-1 text-sm text-blue-300 hover:bg-blue-500/50 transition-colors">
                                                تعديل
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(supplier._id)}
                                                disabled={deletingId === supplier._id}
                                                className="cursor-pointer rounded bg-red-500/40 px-3 py-1 text-sm text-red-300 hover:bg-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                {deletingId === supplier._id ?
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
                                        {new Date(supplier.created_at).toLocaleDateString("ar-EG")}
                                    </td>
                                </tr>
                            ))
                        :   <tr>
                                <td
                                    colSpan={6}
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
                                        message="لا يوجد موردين"
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
