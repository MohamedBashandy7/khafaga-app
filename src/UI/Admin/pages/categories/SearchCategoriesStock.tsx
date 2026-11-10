
import { useState } from "react"
import NoData from "../../shared/nodata"
import Loader from "../../shared/loading"
import { SearchX } from "lucide-react"

export function SearchCategoriesStock() {
    const [searchInput, setSearchInput] = useState("")
    const [categories, setCategories] = useState<StockCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [deductAmounts, setDeductAmounts] = useState<Record<string, string>>({})
    const [processing, setProcessing] = useState<string | null>(null)

    const loadCategories = async (search: string) => {
        const result =
            await window.electron.categories.searchCategoriesStock(search)

        if (result.success) {
            setCategories(result.data)
            return true
        }

        setCategories([])
        setError(result.message || "فشل البحث عن الصنف")
        return false
    }

    const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const search = searchInput.trim()

        if (!search) {
            setCategories([])
            setSearched(false)
            setError("")
            setSuccess("")
            return
        }

        setLoading(true)
        setError("")
        setSuccess("")
        setSearched(true)

        try {
            await loadCategories(search)
        } catch {
            setCategories([])
            setError("حدث خطأ أثناء البحث عن الصنف")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setSearchInput("")
        setCategories([])
        setSearched(false)
        setError("")
        setSuccess("")
        setDeductAmounts({})
    }

    const handleDeduct = async (
        invoice: StockInvoice,
        categoryCode: string
    ) => {
        const key = `${categoryCode}-${invoice.invoiceId}`
        const amount = Number(deductAmounts[key])

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("أدخل كمية صحيحة أكبر من صفر")
            setSuccess("")
            return
        }

        if (
            invoice.isClosed === 1 ||
            invoice.hasUnknownQuantity === 1 ||
            invoice.remainingQuantity === null
        ) {
            setError("لا يمكن الخصم من هذا الصنف")
            setSuccess("")
            return
        }

        if (amount > invoice.remainingQuantity) {
            setError("الكمية المراد خصمها أكبر من الكمية المتبقية")
            setSuccess("")
            return
        }

        setProcessing(key)
        setError("")
        setSuccess("")

        try {
            const result = await window.electron.invoicesPurchase.deduct(
                String(invoice.invoiceId),
                categoryCode,
                amount
            )

            if (!result.success) {
                setError(result.message || "فشل خصم الكمية")
                return
            }

            setDeductAmounts(previous => ({
                ...previous,
                [key]: ""
            }))

            await loadCategories(searchInput.trim())
            setSuccess(result.message || "تم خصم الكمية بنجاح")
        } catch {
            setError("حدث خطأ أثناء خصم الكمية")
        } finally {
            setProcessing(null)
        }
    }

    const handleClose = async (
        invoice: StockInvoice,
        categoryCode: string
    ) => {
        const key = `${categoryCode}-${invoice.invoiceId}`

        setProcessing(key)
        setError("")
        setSuccess("")

        try {
            const result = await window.electron.invoicesPurchase.closeCategory(
                String(invoice.invoiceId),
                categoryCode
            )

            if (!result.success) {
                setError(result.message || "فشل إنهاء الصنف")
                return
            }

            setDeductAmounts(previous => ({
                ...previous,
                [key]: ""
            }))

setCategories(previous =>
    previous.map(category => {
        if (category.code !== categoryCode) {
            return category
        }

        return {
            ...category,
            invoiceCount: Math.max(0, category.invoiceCount - 1),
            availableQuantity: Math.max(
                0,
                category.availableQuantity -
                    (invoice.remainingQuantity ?? 0)
            ),
            unknownQuantityInvoices: Math.max(
                0,
                category.unknownQuantityInvoices -
                    (invoice.hasUnknownQuantity === 1 ? 1 : 0)
            ),
            invoices: category.invoices.map(item =>
                item.invoiceId === invoice.invoiceId
                    ? {
                          ...item,
                          remainingQuantity: 0,
                          isClosed: 1,
                          hasUnknownQuantity: 0
                      }
                    : item
            )
        }
    })
)

setSuccess(result.message || "تم إنهاء الصنف بنجاح")
        } catch {
            setError("حدث خطأ أثناء إنهاء الصنف")
        } finally {
            setProcessing(null)
        }
    }

    return (
        <div className="p-6" dir="rtl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">
                    بحث الأصناف
                </h1>
                <p className="text-white/70">
                    البحث عن الأصناف ومعرفة الكميات والفواتير المرتبطة بها
                </p>
            </div>

            <form
                onSubmit={handleSearch}
                className="mb-5 flex flex-wrap gap-3"
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    placeholder="ابحث بكود الصنف أو اسمه..."
                    className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-white/40 focus:border-green-500"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer rounded-lg bg-blue-500/40 px-6 py-3 font-semibold text-blue-300 transition-colors hover:bg-blue-500/50 disabled:opacity-50"
                >
                    بحث
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="cursor-pointer rounded-lg bg-white/10 px-6 py-3 font-semibold text-white/70 transition-colors hover:bg-white/20"
                >
                    مسح البحث
                </button>
            </form>

            {error && (
                <div className="mb-5 rounded-lg bg-red-500/20 p-4 text-center text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-5 rounded-lg bg-green-500/20 p-4 text-center text-green-400">
                    {success}
                </div>
            )}

            {loading && <Loader force contained />}

            {!loading && searched && !error && categories.length === 0 && (
                <div className="rounded-lg bg-black/20 p-8">
                    <NoData
                        icon={<SearchX size={48} />}
                        message="لا توجد أصناف مطابقة للبحث"
                    />                
                </div>
            )}

            {!loading && categories.length > 0 && (
                <div className="space-y-5">
                    {categories.map(category => (
                        <div
                            key={category.code}
                            className="overflow-hidden rounded-lg bg-black/20 shadow-lg"
                        >
                            <div className="border-b border-white/10 bg-white/5 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {category.name}
                                        </h2>
                                        <p className="mt-1 text-sm text-white/60">
                                            كود الصنف: {category.code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                    <p className="text-center text-sm text-white/60">
                                        عدد فواتير الشراء
                                    </p>
                                    <p className="mt-2 text-center text-2xl font-bold text-blue-300">
                                        {category.invoiceCount}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                    <p className="text-center text-sm text-white/60">
                                        إجمالي الكمية المتاحة
                                    </p>
                                    <p className="mt-2 text-center text-2xl font-bold text-green-300">
                                        {category.availableQuantity}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                    <p className="text-center text-sm text-white/60">
                                        عدد الفواتير بكمية مجهولة
                                    </p>
                                    <p className="mt-2 text-center text-2xl font-bold text-yellow-300">
                                        {category.unknownQuantityInvoices}
                                    </p>
                                </div>
                            </div>

                            <div className="px-5 pb-5">
                                <h3 className="mb-3 font-bold text-white">
                                    فواتير الشراء
                                </h3>

                                <div className="overflow-x-auto rounded-lg border border-white/10">
                                    <table className="w-full text-center text-white">
                                        <thead className="bg-white/10">
                                            <tr>
                                                <th className="px-4 py-3 text-sm">
                                                    رقم الفاتورة
                                                </th>
                                                <th className="px-4 py-3 text-sm">
                                                    تاريخ الفاتورة
                                                </th>
                                                <th className="px-4 py-3 text-sm">
                                                    الكمية الأصلية
                                                </th>
                                                <th className="px-4 py-3 text-sm">
                                                    الكمية المتبقية
                                                </th>
                                                <th className="px-4 py-3 text-sm">
                                                    الحالة
                                                </th>
                                                <th className="px-4 py-3 text-sm">
                                                    خصم كمية
                                                </th>
                                                <th className="px-4 py-3 text-sm">
                                                    الإجراءات
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-white/10">
                                            {category.invoices.map(invoice => {
                                                const key = `${category.code}-${invoice.invoiceId}`
                                                const isClosed = invoice.isClosed === 1
                                                const isUnknown = invoice.hasUnknownQuantity === 1
                                                const isProcessing = processing === key

                                                return (
                                                    <tr
                                                        key={invoice.invoiceId}
                                                        className={`transition-colors ${
                                                            isClosed
                                                                ? "bg-red-500/15 text-red-300"
                                                                : "hover:bg-white/5"
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3 text-sm">
                                                            {invoice.invoiceNo}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm">
                                                            {invoice.invoiceDate}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm">
                                                            {isUnknown
                                                                ? "كمية غير معروفة"
                                                                : invoice.quantity ?? 0}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm font-bold">
                                                            {isClosed
                                                                ? 0
                                                                : isUnknown
                                                                    ? "غير معروفة"
                                                                    : invoice.remainingQuantity ?? 0}
                                                        </td>

                                                        <td className="px-4 py-3 text-sm">
                                                            {isClosed ? (
                                                                <span className="font-bold text-red-400">
                                                                    منتهي
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-green-400">
                                                                    مفتوح
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                value={deductAmounts[key] ?? ""}
                                                                disabled={
                                                                    isClosed ||
                                                                    isUnknown ||
                                                                    isProcessing
                                                                }
                                                                onChange={event =>
                                                                    setDeductAmounts(previous => ({
                                                                        ...previous,
                                                                        [key]: event.target.value
                                                                    }))
                                                                }
                                                                placeholder="الكمية"
                                                                className="w-24 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center text-white outline-none focus:border-blue-500 disabled:opacity-40"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-wrap justify-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        isClosed ||
                                                                        isUnknown ||
                                                                        isProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        handleDeduct(invoice, category.code)
                                                                    }
                                                                    className="rounded-lg bg-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    {isProcessing
                                                                        ? "جاري التنفيذ..."
                                                                        : "حفظ"}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={isClosed || isProcessing}
                                                                    onClick={() =>
                                                                        handleClose(invoice, category.code)
                                                                    }
                                                                    className="rounded-lg bg-red-500/30 px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    إنهاء
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
