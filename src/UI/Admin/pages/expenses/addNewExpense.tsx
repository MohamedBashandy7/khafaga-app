import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { NumberInput } from "../../shared/NumberInput"

export function AddNewExpense() {
    const [name, setName] = useState("")
    const [amount, setAmount] = useState("0")
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: FieldError[] = []

        if (!name.trim()) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "اسم المصروف مطلوب",
                path: "name",
                location: "body"
            })
        }
        if (!amount || parseFloat(amount) < 0) {
            newErrors.push({
                type: "field",
                value: amount,
                msg: "المبلغ غير صالح",
                path: "amount",
                location: "body"
            })
        }

        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)
        setErrors([])

        const result = await window.electron.expenses.createExpense(name.trim(), parseFloat(amount))

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

    const nameError = errors.find((e) => e.path === "name")?.msg
    const amountError = errors.find((e) => e.path === "amount")?.msg

    return (
        <div
            className="min-h-full flex items-center justify-center p-4"
            dir="rtl">
            <div className="w-full max-w-xl">
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
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                />
                                <line
                                    x1="12"
                                    y1="8"
                                    x2="12"
                                    y2="16"
                                />
                                <line
                                    x1="8"
                                    y2="12"
                                    x2="16"
                                />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">مصروف جديد</h3>
                            <p className="text-sm text-white/50">أضف مصروفًا جديدًا</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                اسم المصروف
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="مثال: إيجار"
                                className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${
                                    nameError ? "ring-2 ring-red-500" : (
                                        "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50"
                                    )
                                }`}
                            />
                            {nameError && (
                                <p className="mt-1.5 text-sm text-red-400">{nameError}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                المبلغ
                            </label>
                            <NumberInput
                                value={Number(amount)}
                                onChange={(val) => {
                                    setAmount(String(val))
                                    if (errors.length) setErrors([])
                                }}
                                placeholder="0.00"
                                min={0}
                                step="0.01"
                                error={amountError}
                            />
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer rounded-xl bg-green-500/60 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:bg-green-500/70 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
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
                                        جاري الإضافة...
                                    </span>
                                :   "إضافة المصروف"}
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
