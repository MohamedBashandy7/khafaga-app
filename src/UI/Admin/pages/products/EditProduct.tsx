import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Loader from "../../shared/loading"

interface FieldError {
    type: string
    value: string
    msg: string
    path: string
    location: string
}

function NumberInput({
    value,
    onChange,
    placeholder,
    className,
    disabled
}: {
    value: string
    onChange: (val: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const el = inputRef.current
        if (!el) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            el.blur()
        }

        el.addEventListener("wheel", handleWheel, { passive: false })
        return () => el.removeEventListener("wheel", handleWheel)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        if (/^\d*\.?\d*$/.test(raw)) {
            onChange(raw)
        }
    }

    return (
        <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={handleChange}
            onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault()
                }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] ${className}`}
        />
    )
}

export function EditProduct() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [wholesaleWholesalePrice, setWholesaleWholesalePrice] = useState("")
    const [wholesalePrice, setWholesalePrice] = useState("")
    const [sellingPrice, setSellingPrice] = useState("")
    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    window.electron.products.getProduct(id!),
                    window.electron.categories.getAllCategories()
                ])

                if (!productRes.success || !productRes.data) {
                    setFetchError(productRes.message || "فشل تحميل المنتج")
                    return
                }

                const product = productRes.data
                setName(product.name)
                setCategoryId(
                    typeof product.category_id === "object" ?
                        product.category_id._id
                    :   product.category_id
                )
                setWholesaleWholesalePrice(product.wholesale_wholesale_price.toString())
                setWholesalePrice(product.wholesale_price.toString())
                setSellingPrice(product.selling_price.toString())

                if (categoriesRes.success) {
                    setCategories(categoriesRes.data)
                }
            } catch {
                setFetchError("تعذر الاتصال بالسيرفر")
            } finally {
                setLoadingData(false)
            }
        }
        loadData()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: FieldError[] = []

        if (!name.trim())
            newErrors.push({
                type: "field",
                value: "",
                msg: "اسم المنتج مطلوب",
                path: "name",
                location: "body"
            })
        if (!categoryId)
            newErrors.push({
                type: "field",
                value: "",
                msg: "القسم مطلوب",
                path: "categoryId",
                location: "body"
            })

        const wwp = parseFloat(wholesaleWholesalePrice)
        const wp = parseFloat(wholesalePrice)
        const sp = parseFloat(sellingPrice)

        if (isNaN(wwp) || wwp < 0)
            newErrors.push({
                type: "field",
                value: wholesaleWholesalePrice,
                msg: "سعر جملة الجملة غير صالح",
                path: "wholesaleWholesalePrice",
                location: "body"
            })
        if (isNaN(wp) || wp < 0)
            newErrors.push({
                type: "field",
                value: wholesalePrice,
                msg: "سعر الجملة غير صالح",
                path: "wholesalePrice",
                location: "body"
            })
        if (isNaN(sp) || sp < 0)
            newErrors.push({
                type: "field",
                value: sellingPrice,
                msg: "سعر البيع غير صالح",
                path: "sellingPrice",
                location: "body"
            })

        if (!isNaN(wwp) && !isNaN(wp) && wp <= wwp) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "سعر الجملة يجب أن يكون أكبر من سعر جملة الجملة",
                path: "wholesalePrice",
                location: "body"
            })
        }
        if (!isNaN(wp) && !isNaN(sp) && sp <= wp) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "سعر البيع يجب أن يكون أكبر من سعر الجملة",
                path: "sellingPrice",
                location: "body"
            })
        }

        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)
        setErrors([])
        const result = await window.electron.products.updateProduct(
            id!,
            name.trim(),
            categoryId,
            wwp,
            wp,
            sp
        )

        if (result.success) {
            navigate(-1)
        } else {
            if (result.errors && result.errors.length > 0) {
                setErrors(result.errors)
            } else {
                alert(result.message || "حدث خطأ")
            }
        }
        setLoading(false)
    }

    const getError = (path: string) => errors.find((e) => e.path === path)?.msg

    if (loadingData) {
        return (
            <Loader
                force
                contained
            />
        )
    }

    if (fetchError) {
        return (
            <div
                className="min-h-full flex items-center justify-center p-4"
                dir="rtl">
                <div className="rounded-lg bg-red-500/20 p-4 text-center text-red-400">
                    {fetchError}
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-full flex items-center justify-center p-4"
            dir="rtl">
            <div className="w-full max-w-xl">
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
                                strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line
                                    x1="12"
                                    y1="22.08"
                                    x2="12"
                                    y2="12"></line>
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">تعديل المنتج</h3>
                            <p className="text-sm text-white/50">قم بتعديل بيانات المنتج الحالي</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                اسم المنتج
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="مثال: تي شيرت أسود"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    getError("name") ? "ring-2 ring-red-500" : (
                                        "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                                    )
                                }`}
                            />
                            {getError("name") && (
                                <p className="mt-1.5 text-sm text-red-400">{getError("name")}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                القسم
                            </label>
                            {categories.length === 0 ?
                                <div className="text-white/50 text-sm">جاري تحميل الأقسام...</div>
                            :   <select
                                    value={categoryId}
                                    onChange={(e) => {
                                        setCategoryId(e.target.value)
                                        if (errors.length) setErrors([])
                                    }}
                                    className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none transition-all duration-200 ${
                                        getError("categoryId") ? "ring-2 ring-red-500" : (
                                            "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                                        )
                                    }`}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: "left 0.5rem center",
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "1.5em 1.5em",
                                        appearance: "none"
                                    }}>
                                    <option
                                        value=""
                                        disabled
                                        className="bg-gray-800 text-white">
                                        اختر القسم
                                    </option>
                                    {categories.map((cat) => (
                                        <option
                                            key={cat._id}
                                            value={cat._id}
                                            className="bg-gray-800 text-white">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            }
                            {getError("categoryId") && (
                                <p className="mt-1.5 text-sm text-red-400">
                                    {getError("categoryId")}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                سعر جملة الجملة (ج.م)
                            </label>
                            <NumberInput
                                value={wholesaleWholesalePrice}
                                onChange={(val) => {
                                    setWholesaleWholesalePrice(val)
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="مثال: 40.00"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    getError("wholesaleWholesalePrice") ? "ring-2 ring-red-500" : (
                                        "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                                    )
                                }`}
                            />
                            {getError("wholesaleWholesalePrice") && (
                                <p className="mt-1.5 text-sm text-red-400">
                                    {getError("wholesaleWholesalePrice")}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                سعر الجملة (ج.م)
                            </label>
                            <NumberInput
                                value={wholesalePrice}
                                onChange={(val) => {
                                    setWholesalePrice(val)
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="مثال: 50.00"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    getError("wholesalePrice") ? "ring-2 ring-red-500" : (
                                        "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                                    )
                                }`}
                            />
                            {getError("wholesalePrice") && (
                                <p className="mt-1.5 text-sm text-red-400">
                                    {getError("wholesalePrice")}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                سعر البيع (ج.م)
                            </label>
                            <NumberInput
                                value={sellingPrice}
                                onChange={(val) => {
                                    setSellingPrice(val)
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="مثال: 80.00"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    getError("sellingPrice") ? "ring-2 ring-red-500" : (
                                        "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                                    )
                                }`}
                            />
                            {getError("sellingPrice") && (
                                <p className="mt-1.5 text-sm text-red-400">
                                    {getError("sellingPrice")}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-blue-500/60 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500/70 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
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
                                        جاري التحديث...
                                    </span>
                                :   "تحديث المنتج"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                                العودة إلى الصفحة السابقة
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
