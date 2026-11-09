import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { showError, showSuccess } from "../../../../../services/sweetAlert"
import Loader from "../../../shared/loading"
import { SearchableDropdown } from "../../../shared/SearchableDropdown"

type CategoryOption = {
    _id: string
    name: string
}

interface InvoiceFormItem {
    categoryCode: string
    quantity: string
    price: string
}

export function EditInvoicePurchase() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [invoiceNo, setInvoiceNo] = useState("")
    const [invoiceDate, setInvoiceDate] = useState("")
    const [items, setItems] = useState<InvoiceFormItem[]>([])
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        ;(async () => {
            try {
                if (!id) {
                    showError("رقم الفاتورة غير صحيح")
                    navigate("/invoices/purchase")
                    return
                }

                const [invoiceResult, categoriesResult] = await Promise.all([
                    window.electron.invoicesPurchase.get(id),
                    window.electron.categories.getAllCategories(1, 1000)
                ])

                if (categoriesResult.success) {
                    setCategories(
                        categoriesResult.data.map(category => ({
                            _id: category.code,
                            name: `${category.code} - ${category.name}`
                        }))
                    )
                } else {
                    showError(categoriesResult.message || "فشل جلب التصنيفات")
                }

                if (!invoiceResult.success || !invoiceResult.data) {
                    showError(invoiceResult.message || "فشل جلب بيانات الفاتورة")
                    navigate("/invoices/purchase")
                    return
                }

                const invoice = invoiceResult.data

                setInvoiceNo(invoice.invoiceNo)
                setInvoiceDate(invoice.invoiceDate)
                setItems(
                    invoice.items.map(item => ({
                        categoryCode: item.categoryCode,
                        quantity: String(item.quantity),
                        price: String(item.price)
                    }))
                )
            } catch {
                showError("فشل تحميل بيانات الفاتورة")
                navigate("/invoices/purchase")
            } finally {
                setDataLoading(false)
            }
        })()
    }, [id, navigate])

    const addItem = () => {
        setItems(prev => [
            ...prev,
            {
                categoryCode: "",
                quantity: "",
                price: ""
            }
        ])
        setErrors([])
    }

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
        setErrors([])
    }

    const updateItemField = (
        index: number,
        field: keyof InvoiceFormItem,
        value: string
    ) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          [field]: value
                      }
                    : item
            )
        )
        setErrors([])
    }

    const total = items.reduce(
        (sum, item) =>
            sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
    )

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        const newErrors: FieldError[] = []

        if (!invoiceNo.trim()) {
            newErrors.push({
                type: "field",
                value: invoiceNo,
                msg: "رقم الفاتورة مطلوب",
                path: "invoiceNo",
                location: "body"
            })
        }

        if (!invoiceDate) {
            newErrors.push({
                type: "field",
                value: invoiceDate,
                msg: "تاريخ الفاتورة مطلوب",
                path: "invoiceDate",
                location: "body"
            })
        }

        if (items.length === 0) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "يجب إضافة تصنيف واحد على الأقل",
                path: "items",
                location: "body"
            })
        } else {
            items.forEach((item, index) => {
                const quantity = Number(item.quantity)
                const price = Number(item.price)

                if (!item.categoryCode) {
                    newErrors.push({
                        type: "field",
                        value: "",
                        msg: `يجب اختيار تصنيف في الصف ${index + 1}`,
                        path: `items[${index}].categoryCode`,
                        location: "body"
                    })
                }

                if (
                    item.quantity.trim() === "" ||
                    !Number.isFinite(quantity) ||
                    quantity <= 0
                ) {
                    newErrors.push({
                        type: "field",
                        value: item.quantity,
                        msg: `الكمية في الصف ${index + 1} يجب أن تكون أكبر من صفر`,
                        path: `items[${index}].quantity`,
                        location: "body"
                    })
                }

                if (
                    item.price.trim() === "" ||
                    !Number.isFinite(price) ||
                    price < 0
                ) {
                    newErrors.push({
                        type: "field",
                        value: item.price,
                        msg: `السعر في الصف ${index + 1} غير صحيح`,
                        path: `items[${index}].price`,
                        location: "body"
                    })
                }
            })
        }

        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }

        if (!id) {
            showError("رقم الفاتورة غير صحيح")
            return
        }

        setLoading(true)
        setErrors([])

        try {
            const submitItems: InvoicePurchaseSubmitItem[] = items.map(item => ({
                categoryCode: item.categoryCode,
                quantity: Number(item.quantity),
                price: Number(item.price)
            }))

            const result = await window.electron.invoicesPurchase.update(
                id,
                invoiceNo.trim(),
                invoiceDate,
                submitItems
            )

            if (result.success) {
                showSuccess("تم تحديث الفاتورة بنجاح")
                navigate("/invoices/purchase")
            } else if (result.errors?.length) {
                setErrors(result.errors)
            } else {
                showError(result.message || "فشل تحديث الفاتورة")
            }
        } catch {
            showError("فشل تحديث الفاتورة")
        } finally {
            setLoading(false)
        }
    }

    if (dataLoading) {
        return <Loader force contained />
    }

    const invoiceNoError = errors.find(error => error.path === "invoiceNo")?.msg
    const invoiceDateError = errors.find(error => error.path === "invoiceDate")?.msg
    const itemsError = errors.find(error => error.path === "items")?.msg

    return (
        <div
            className="min-h-full flex items-center justify-center p-4"
            dir="rtl"
        >
            <div className="w-full max-w-4xl">
                <div className="overflow-hidden rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
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
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                تعديل فاتورة شراء
                            </h3>
                            <p className="text-sm text-white/50">
                                تعديل بيانات الفاتورة
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    رقم الفاتورة
                                </label>
                                <input
                                    type="text"
                                    value={invoiceNo}
                                    onChange={event => {
                                        setInvoiceNo(event.target.value)
                                        setErrors([])
                                    }}
                                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                                {invoiceNoError && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {invoiceNoError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    تاريخ الفاتورة
                                </label>
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={event => {
                                        setInvoiceDate(event.target.value)
                                        setErrors([])
                                    }}
                                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                                {invoiceDateError && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {invoiceDateError}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                التصنيفات
                            </label>

                            {itemsError && (
                                <p className="mb-2 text-sm text-red-400">
                                    {itemsError}
                                </p>
                            )}

                            <div className="overflow-visible rounded-lg border border-white/10">
                                <table className="w-full text-center text-white">
                                    <thead className="bg-white/10">
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-bold">
                                                التصنيف
                                            </th>
                                            <th className="px-4 py-3 text-sm font-bold">
                                                الكمية
                                            </th>
                                            <th className="px-4 py-3 text-sm font-bold">
                                                السعر
                                            </th>
                                            <th className="px-4 py-3 text-sm font-bold">
                                                الإجمالي
                                            </th>
                                            <th className="px-4 py-3 text-sm font-bold"></th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/10">
                                        {items.map((item, index) => {
                                            const categoryError = errors.find(
                                                error =>
                                                    error.path === `items[${index}].categoryCode`
                                            )?.msg
                                            const quantityError = errors.find(
                                                error =>
                                                    error.path === `items[${index}].quantity`
                                            )?.msg
                                            const priceError = errors.find(
                                                error =>
                                                    error.path === `items[${index}].price`
                                            )?.msg

                                            return (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="px-4 py-3 overflow-visible relative">
                                                        <SearchableDropdown
                                                            options={categories}
                                                            value={item.categoryCode}
                                                            onChange={value =>
                                                                updateItemField(
                                                                    index,
                                                                    "categoryCode",
                                                                    value
                                                                )
                                                            }
                                                            placeholder="ابحث بالكود أو الاسم واختر التصنيف"
                                                            error={categoryError}
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={event =>
                                                                updateItemField(
                                                                    index,
                                                                    "quantity",
                                                                    event.target.value
                                                                )
                                                            }
                                                            min="1"
                                                            step="1"
                                                            inputMode="numeric"
                                                            className="w-full rounded-xl bg-white/5 px-3 py-2 text-center text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500/50"
                                                        />
                                                        {quantityError && (
                                                            <p className="mt-1 text-xs text-red-400">
                                                                {quantityError}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={event =>
                                                                updateItemField(
                                                                    index,
                                                                    "price",
                                                                    event.target.value
                                                                )
                                                            }
                                                            min="0"
                                                            step="any"
                                                            inputMode="decimal"
                                                            className="w-full rounded-xl bg-white/5 px-3 py-2 text-center text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500/50"
                                                        />
                                                        {priceError && (
                                                            <p className="mt-1 text-xs text-red-400">
                                                                {priceError}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm">
                                                        {(
                                                            (Number(item.quantity) || 0) *
                                                            (Number(item.price) || 0)
                                                        ).toFixed(2)}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <line
                                                                    x1="18"
                                                                    y1="6"
                                                                    x2="6"
                                                                    y2="18"
                                                                />
                                                                <line
                                                                    x1="6"
                                                                    y1="6"
                                                                    x2="18"
                                                                    y2="18"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-3 text-sm text-green-400 hover:text-green-300 transition-colors"
                            >
                                + إضافة تصنيف
                            </button>
                        </div>

                        <div className="flex justify-end text-white bg-white/5 rounded-xl p-4">
                            <span>
                                إجمالي الفاتورة: <strong>{total.toFixed(2)}</strong>
                            </span>
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-blue-500/60 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500/70 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
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
                                        جاري الحفظ...
                                    </span>
                                ) : (
                                    "حفظ التعديلات"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                العودة
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
