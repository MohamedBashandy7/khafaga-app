import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { showError, showSuccess } from "../../../../../services/sweetAlert"
import Loader from "../../../shared/loading"
import { SearchableDropdown } from "../../../shared/SearchableDropdown"
import { NumberInput } from "../../../shared/NumberInput"

type ProductOption = { _id: string; name: string }
type SupplierOption = { _id: string; name: string }

interface InvoiceFormItem {
    productId: string
    productName: string
    quantity: number
    purchasePrice: number
}

interface InvoiceSubmitItem {
    product: string
    quantity: number
    purchasePrice: number
}

export function AddInvoicePurchase() {
    const navigate = useNavigate()
    const [supplier, setSupplier] = useState("")
    const [items, setItems] = useState<InvoiceFormItem[]>([])
    const [discount, setDiscount] = useState("0")
    const [tax, setTax] = useState("0")
    const [paid, setPaid] = useState("0")
    const [notes, setNotes] = useState("")
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
    const [products, setProducts] = useState<ProductOption[]>([])
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        ;(async () => {
            try {
                const [supRes, prodRes] = await Promise.all([
                    window.electron.suppliers.getAllSuppliers(1, 1000),
                    window.electron.products.getAllProducts(1, 1000)
                ])
                if (supRes.success)
                    setSuppliers(supRes.data.map((s) => ({ _id: s._id, name: s.name })))
                else showError(supRes.message || "فشل جلب الموردين")
                if (prodRes.success)
                    setProducts(prodRes.data.map((p) => ({ _id: p._id, name: p.name })))
                else showError(prodRes.message || "فشل جلب المنتجات")
            } catch {
                showError("خطأ في الاتصال")
            } finally {
                setDataLoading(false)
            }
        })()
    }, [])

    const addItem = () => {
        setItems([...items, { productId: "", productName: "", quantity: 1, purchasePrice: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItemField = (
        index: number,
        field: keyof InvoiceFormItem,
        value: string | number
    ) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item
                const updated = { ...item }
                switch (field) {
                    case "productId":
                        if (typeof value === "string") {
                            updated.productId = value
                            const prod = products.find((p) => p._id === value)
                            updated.productName = prod ? prod.name : ""
                        }
                        break
                    case "quantity":
                        updated.quantity = Number(value)
                        break
                    case "purchasePrice":
                        updated.purchasePrice = Number(value)
                        break
                }
                return updated
            })
        )
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
    const total = subtotal - Number(discount || 0) + Number(tax || 0)
    const remain = total - Number(paid || 0)
    const paymentStatus =
        !paid || Number(paid) === 0 ? "unpaid"
        : Number(paid) >= total ? "paid"
        : "partial"

    const prepareSubmitItems = (): InvoiceSubmitItem[] =>
        items.map(({ productId, quantity, purchasePrice }) => ({
            product: productId,
            quantity,
            purchasePrice
        }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: FieldError[] = []
        if (!supplier)
            newErrors.push({
                type: "field",
                value: "",
                msg: "المورد مطلوب",
                path: "supplier",
                location: "body"
            })
        if (items.length === 0)
            newErrors.push({
                type: "field",
                value: "",
                msg: "يجب إضافة منتج واحد على الأقل",
                path: "items",
                location: "body"
            })
        else {
            items.forEach((item, idx) => {
                if (!item.productId)
                    newErrors.push({
                        type: "field",
                        value: "",
                        msg: `المنتج في الصف ${idx + 1} مطلوب`,
                        path: `items[${idx}].product`,
                        location: "body"
                    })
                if (!item.quantity || item.quantity <= 0)
                    newErrors.push({
                        type: "field",
                        value: "",
                        msg: `الكمية في الصف ${idx + 1} غير صالحة`,
                        path: `items[${idx}].quantity`,
                        location: "body"
                    })
                if (!item.purchasePrice || item.purchasePrice < 0)
                    newErrors.push({
                        type: "field",
                        value: "",
                        msg: `سعر الشراء في الصف ${idx + 1} غير صالح`,
                        path: `items[${idx}].purchasePrice`,
                        location: "body"
                    })
            })
        }
        if (Number(paid) < 0)
            newErrors.push({
                type: "field",
                value: paid,
                msg: "المدفوع يجب أن يكون ≥ 0",
                path: "paid",
                location: "body"
            })
        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }
        setLoading(true)
        setErrors([])
        try {
            const result = await window.electron.invoicesPurchase.create(
                supplier,
                prepareSubmitItems(),
                Number(discount),
                Number(tax),
                Number(paid),
                notes
            )
            if (result.success) {
                showSuccess("تم إنشاء الفاتورة بنجاح")
                navigate("/invoices/purchase")
            } else {
                if (result.errors?.length) setErrors(result.errors)
                else showError(result.message || "حدث خطأ")
            }
        } catch {
            showError("تعذر الاتصال بالسيرفر")
        } finally {
            setLoading(false)
        }
    }

    if (dataLoading)
        return (
            <Loader
                force
                contained
            />
        )

    const supplierError = errors.find((e) => e.path === "supplier")?.msg
    const itemsError = errors.find((e) => e.path === "items")?.msg
    const paidError = errors.find((e) => e.path === "paid")?.msg

    return (
        <div
            className="min-h-full flex items-center justify-center p-4"
            dir="rtl">
            <div className="w-full max-w-4xl">
                <div className="overflow-hidden rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50">
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
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
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">فاتورة شراء جديدة</h3>
                            <p className="text-sm text-white/50">إنشاء فاتورة شراء</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                المورد
                            </label>
                            <SearchableDropdown
                                options={suppliers}
                                value={supplier}
                                onChange={(val) => {
                                    setSupplier(val)
                                    setErrors([])
                                }}
                                placeholder="اختر المورد"
                                error={supplierError}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                المنتجات
                            </label>
                            {itemsError && (
                                <p className="text-red-400 text-sm mb-2">{itemsError}</p>
                            )}
                            {/* تم تغيير overflow-x-auto إلى overflow-visible */}
                            <div className="overflow-visible rounded-lg border border-white/10">
                                <table className="w-full text-center text-white">
                                    <thead className="bg-white/10">
                                        <tr>
                                            <th className="px-4 py-3 text-sm font-bold">المنتج</th>
                                            <th className="px-4 py-3 text-sm font-bold">الكمية</th>
                                            <th className="px-4 py-3 text-sm font-bold">
                                                سعر الشراء
                                            </th>
                                            <th className="px-4 py-3 text-sm font-bold">
                                                الإجمالي
                                            </th>
                                            <th className="px-4 py-3 text-sm font-bold"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {items.map((item, index) => {
                                            const productError = errors.find(
                                                (e) => e.path === `items[${index}].product`
                                            )?.msg
                                            const qtyError = errors.find(
                                                (e) => e.path === `items[${index}].quantity`
                                            )?.msg
                                            const priceError = errors.find(
                                                (e) => e.path === `items[${index}].purchasePrice`
                                            )?.msg
                                            return (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-white/5 transition-colors">
                                                    {/* تأكد من أن الخلية لا تقص المحتوى */}
                                                    <td className="px-4 py-3 overflow-visible relative">
                                                        <SearchableDropdown
                                                            options={products}
                                                            value={item.productId}
                                                            onChange={(val) =>
                                                                updateItemField(
                                                                    index,
                                                                    "productId",
                                                                    val
                                                                )
                                                            }
                                                            placeholder="اختر المنتج"
                                                            error={productError}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <NumberInput
                                                            value={item.quantity}
                                                            onChange={(val) =>
                                                                updateItemField(
                                                                    index,
                                                                    "quantity",
                                                                    val
                                                                )
                                                            }
                                                            min={1}
                                                            step="1"
                                                            error={qtyError}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <NumberInput
                                                            value={item.purchasePrice}
                                                            onChange={(val) =>
                                                                updateItemField(
                                                                    index,
                                                                    "purchasePrice",
                                                                    val
                                                                )
                                                            }
                                                            min={0}
                                                            step="0.01"
                                                            error={priceError}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {(
                                                            item.quantity * item.purchasePrice
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-400 hover:text-red-300">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2">
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
                                className="mt-3 text-sm text-green-400 hover:text-green-300 transition-colors">
                                + إضافة منتج
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    الخصم
                                </label>
                                <NumberInput
                                    value={Number(discount)}
                                    onChange={(val) => setDiscount(String(val))}
                                    min={0}
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    الضريبة
                                </label>
                                <NumberInput
                                    value={Number(tax)}
                                    onChange={(val) => setTax(String(val))}
                                    min={0}
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    المدفوع
                                </label>
                                <NumberInput
                                    value={Number(paid)}
                                    onChange={(val) => setPaid(String(val))}
                                    min={0}
                                    step="0.01"
                                    error={paidError}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between text-white bg-white/5 rounded-xl p-4">
                            <span>
                                الإجمالي: <strong>{total.toFixed(2)}</strong>
                            </span>
                            <span>
                                المتبقي: <strong>{remain.toFixed(2)}</strong>
                            </span>
                            <span>
                                الحالة:{" "}
                                <strong>
                                    {paymentStatus === "paid" ?
                                        "مدفوعة"
                                    : paymentStatus === "partial" ?
                                        "مدفوعة جزئيًا"
                                    :   "غير مدفوعة"}
                                </strong>
                            </span>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                ملاحظات
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50"
                            />
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-green-500/60 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:bg-green-500/70 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                                {loading ?
                                    <span className="flex items-center gap-2">
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
                                        جاري الحفظ...
                                    </span>
                                :   "حفظ الفاتورة"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                                العودة
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
