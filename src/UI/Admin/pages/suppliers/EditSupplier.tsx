import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { showError, showSuccess } from "../../../../services/sweetAlert"
import Loader from "../../shared/loading"
import { SearchableDropdown } from "../../shared/SearchableDropdown"

export function EditSupplier() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [governorate, setGovernorate] = useState("")
    const [address, setAddress] = useState("")
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [governorates, setGovernorates] = useState<Governorate[]>([])
    const [govLoading, setGovLoading] = useState(true)

    useEffect(() => {
        ;(async () => {
            try {
                const res = await window.electron.governorates.getAll()
                if (res.success) setGovernorates(res.data)
                else showError(res.message || "فشل جلب المحافظات")
            } catch {
                showError("خطأ في الاتصال")
            } finally {
                setGovLoading(false)
            }
        })()
    }, [])

    useEffect(() => {
        if (!id) return
        ;(async () => {
            try {
                const result = await window.electron.suppliers.getSupplier(id)
                if (result.success && result.data) {
                    setName(result.data.name)
                    setPhone(result.data.phone)
                    setGovernorate(result.data.governorate?._id || "")
                    setAddress(result.data.address || "")
                } else {
                    showError(result.message || "فشل تحميل بيانات المورد")
                    navigate("/suppliers")
                }
            } catch {
                showError("تعذر الاتصال بالسيرفر")
                navigate("/suppliers")
            } finally {
                setPageLoading(false)
            }
        })()
    }, [id, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: FieldError[] = []

        if (!name.trim())
            newErrors.push({
                type: "field",
                value: "",
                msg: "اسم المورد مطلوب",
                path: "name",
                location: "body"
            })
        if (!phone.trim())
            newErrors.push({
                type: "field",
                value: "",
                msg: "رقم الهاتف مطلوب",
                path: "phone",
                location: "body"
            })
        if (!governorate)
            newErrors.push({
                type: "field",
                value: "",
                msg: "المحافظة مطلوبة",
                path: "governorate",
                location: "body"
            })

        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)
        setErrors([])
        try {
            const result = await window.electron.suppliers.updateSupplier(
                id!,
                name.trim(),
                phone.trim(),
                governorate,
                address.trim()
            )
            if (result.success) {
                showSuccess("تم تحديث المورد بنجاح")
                navigate("/suppliers")
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

    if (pageLoading || govLoading)
        return (
            <Loader
                force
                contained
            />
        )

    const nameError = errors.find((e) => e.path === "name")?.msg
    const phoneError = errors.find((e) => e.path === "phone")?.msg
    const govError = errors.find((e) => e.path === "governorate")?.msg

    return (
        <div
            className="min-h-full flex items-center justify-center p-4"
            dir="rtl">
            <div className="w-full max-w-2xl">
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
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">تعديل المورد</h3>
                            <p className="text-sm text-white/50">عدل بيانات المورد</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    اسم المورد
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        setErrors([])
                                    }}
                                    placeholder="اسم المورد"
                                    className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50 ${nameError ? "ring-2 ring-red-500" : ""}`}
                                />
                                {nameError && (
                                    <p className="mt-1.5 text-sm text-red-400">{nameError}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    رقم الهاتف
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value)
                                        setErrors([])
                                    }}
                                    placeholder="رقم الهاتف"
                                    className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50 ${phoneError ? "ring-2 ring-red-500" : ""}`}
                                />
                                {phoneError && (
                                    <p className="mt-1.5 text-sm text-red-400">{phoneError}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                المحافظة
                            </label>
                            <SearchableDropdown
                                options={governorates}
                                value={governorate}
                                onChange={(val) => {
                                    setGovernorate(val)
                                    setErrors([])
                                }}
                                placeholder="اختر المحافظة"
                                error={govError}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                العنوان
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => {
                                    setAddress(e.target.value)
                                    setErrors([])
                                }}
                                placeholder="العنوان (اختياري)"
                                className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-blue-500/60 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500/70 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
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
                                :   "حفظ التعديلات"}
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
