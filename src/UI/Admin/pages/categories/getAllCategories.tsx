import { useCategories } from "../../Hooks/useCategories"
import Loader from "../../shared/loading"
import NoData from "../../shared/nodata"
import Pagination from "../../shared/Pagination"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
    confirmDelete,
    showError,
    showSuccess
} from "../../../../services/sweetAlert"

export function GetAllCategories() {
    const {
        categories,
        total,
        totalPages,
        loading,
        error,
        fetchCategories
    } = useCategories()

    const navigate = useNavigate()

    const [deletingCode, setDeletingCode] = useState<string | null>(null)
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 10

    useEffect(() => {
        fetchCategories(currentPage, itemsPerPage, searchTerm)
    }, [fetchCategories, currentPage, searchTerm])

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setCurrentPage(1)
        setSearchTerm(searchInput.trim())
    }

    const handleResetSearch = () => {
        setSearchInput("")
        setSearchTerm("")
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleDelete = async (code: string) => {
        const confirmed = await confirmDelete()
        if (!confirmed) return

        setDeletingCode(code)

        try {
            const result = await window.electron.categories.deleteCategory(code)

            if (result.success) {
                showSuccess("تم حذف التصنيف بنجاح")

                const nextTotal = total - 1
                const nextTotalPages = Math.ceil(nextTotal / itemsPerPage)
                const nextPage = Math.min(
                    currentPage,
                    Math.max(nextTotalPages, 1)
                )

                if (nextPage !== currentPage) {
                    setCurrentPage(nextPage)
                } else {
                    await fetchCategories(
                        currentPage,
                        itemsPerPage,
                        searchTerm
                    )
                }
            } else {
                showError(result.message || "فشل حذف التصنيف")
            }
        } catch {
            showError("حدث خطأ أثناء حذف التصنيف")
        } finally {
            setDeletingCode(null)
        }
    }

    if (loading) {
        return <Loader force contained />
    }

    if (error) {
        return (
            <div className="p-6" dir="rtl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">
                        التصنيفات
                    </h1>
                </div>

                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6" dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        التصنيفات
                    </h1>
                    <p className="text-white/70">
                        إدارة تصنيفات الملابس والمنتجات
                    </p>
                </div>

                <button
                    onClick={() => navigate("/categories/add")}
                    className="cursor-pointer rounded-lg bg-green-500/40 px-4 py-2 text-sm font-semibold text-green-300 transition-colors hover:bg-green-500/50"
                >
                    + إضافة تصنيف جديد
                </button>
            </div>

            <form
                onSubmit={handleSearch}
                className="mb-5 flex flex-wrap gap-3"
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    placeholder="ابحث بكود التصنيف أو اسمه..."
                    className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/40 focus:border-green-500"
                />

                <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-blue-500/40 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500/50"
                >
                    بحث
                </button>

                <button
                    type="button"
                    onClick={handleResetSearch}
                    className="cursor-pointer rounded-lg bg-white/10 px-6 py-3 font-semibold text-white/70 transition-colors hover:bg-white/20"
                >
                    مسح البحث
                </button>
            </form>

            <div className="mb-3 text-sm text-white/60">
                عدد التصنيفات: {total}
            </div>

            <div className="overflow-hidden overflow-x-auto rounded-lg bg-black/20 shadow-lg">
                <table className="w-full text-center text-white">
                    <thead className="bg-white/10 text-white">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                كود التصنيف
                            </th>

                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                اسم التصنيف
                            </th>

                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                        {categories.length > 0 ? (
                            categories.map(category => (
                                <tr
                                    key={category.code}
                                    className="transition-colors hover:bg-white/5"
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        {category.code}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                        {category.name}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                to={`/categories/edit/${category.code}`}
                                                className="cursor-pointer rounded bg-blue-500/40 px-3 py-1 text-sm text-blue-300 transition-colors hover:bg-blue-500/50"
                                            >
                                                تعديل
                                            </Link>

                                            <button
                                                onClick={() =>
                                                    handleDelete(category.code)
                                                }
                                                disabled={
                                                    deletingCode === category.code
                                                }
                                                className="cursor-pointer rounded bg-red-500/40 px-3 py-1 text-sm text-red-300 transition-colors hover:bg-red-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingCode === category.code ? (
                                                    <span className="flex items-center gap-1">
                                                        <svg
                                                            className="h-4 w-4 animate-spin"
                                                            viewBox="0 0 24 24"
                                                        >
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
                                                ) : (
                                                    "حذف"
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-8">
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
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4z" />
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                <line
                                                    x1="12"
                                                    y1="22.08"
                                                    x2="12"
                                                    y2="12"
                                                />
                                            </svg>
                                        }
                                        message={
                                            searchTerm
                                                ? "لا توجد نتائج مطابقة للبحث"
                                                : "لا توجد تصنيفات"
                                        }
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {total > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        total={total}
                        onPageChange={handlePageChange}
                        isRtl
                    />
                </div>
            )}
        </div>
    )
}