
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { showError, showSuccess } from "../../../../services/sweetAlert"

export function AddNewCategory() {
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedCode = code.trim()
        const trimmedName = name.trim()
        const validationErrors: FieldError[] = []

        if (!/^[0-9]{8,12}$/.test(trimmedCode)) {
            validationErrors.push({
                type: "field",
                value: trimmedCode,
                msg: "الكود يجب أن يتكون من 8 إلى 12 رقمًا",
                path: "code",
                location: "body"
            })
        }

        if (!trimmedName) {
            validationErrors.push({
                type: "field",
                value: trimmedName,
                msg: "اسم التصنيف مطلوب",
                path: "name",
                location: "body"
            })
        }

        if (validationErrors.length) {
            setErrors(validationErrors)
            return
        }

        setLoading(true)
        setErrors([])

        try {
            const result = await window.electron.categories.createCategory(
                trimmedCode,
                trimmedName
            )

            if (result.success) {
                showSuccess("تم إضافة التصنيف بنجاح")
                navigate("/categories")
            } else {
                if (result.errors?.length) {
                    setErrors(result.errors)
                } else {
                    showError(result.message || "حدث خطأ أثناء إضافة التصنيف")
                }
            }
        } catch {
            showError("حدث خطأ أثناء إضافة التصنيف")
        } finally {
            setLoading(false)
        }
    }

    const codeError = errors.find((e) => e.path === "code")?.msg
    const nameError = errors.find((e) => e.path === "name")?.msg

    return (
        <div className="min-h-full flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-xl">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl shadow-black/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
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
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </span>

                        <div>
                            <h3 className="text-lg font-semibold text-white">تصنيف جديد</h3>
                            <p className="text-sm text-white/50">أضف تصنيفًا جديدًا إلى المتجر</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                كود التصنيف
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                value={code}
                                maxLength={12}
                                onChange={(e) => {
                                    setCode(e.target.value.replace(/[^0-9]/g, ""))
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="أدخل كودًا من 8 إلى 12 رقمًا"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    codeError
                                        ? "ring-2 ring-red-500"
                                        : "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50"
                                }`}
                            />

                            {codeError && (
                                <p className="mt-1.5 text-sm text-red-400">{codeError}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                اسم التصنيف
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="مثال: ملابس رجالي"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    nameError
                                        ? "ring-2 ring-red-500"
                                        : "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50"
                                }`}
                            />

                            {nameError && (
                                <p className="mt-1.5 text-sm text-red-400">{nameError}</p>
                            )}
                        </div>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-green-500/60 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-200 hover:bg-green-500/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                                        جاري الإضافة...
                                    </span>
                                ) : (
                                    "إضافة التصنيف"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition-all duration-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                العودة إلى الصفحة السابقة
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
