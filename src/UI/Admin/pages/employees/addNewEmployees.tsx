import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { NumberInput } from "../../shared/NumberInput"

export function AddNewEmployee() {
    const [name, setName] = useState("")
    const [salary, setSalary] = useState("")
    const [shiftStartHour, setShiftStartHour] = useState("")
    const [shiftStartAmPm, setShiftStartAmPm] = useState("")
    const [shiftEndHour, setShiftEndHour] = useState("")
    const [shiftEndAmPm, setShiftEndAmPm] = useState("")
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const buildTime = (hour: string, ampm: string) => `${hour}:00 ${ampm}`

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: FieldError[] = []

        if (!name.trim()) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "اسم الموظف مطلوب",
                path: "name",
                location: "body"
            })
        }
        if (!salary || parseFloat(salary) < 0) {
            newErrors.push({
                type: "field",
                value: salary,
                msg: "الراتب غير صالح",
                path: "salary",
                location: "body"
            })
        }

        if (!shiftStartHour || !shiftStartAmPm) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "وقت الحضور مطلوب",
                path: "shiftStart",
                location: "body"
            })
        }
        if (!shiftEndHour || !shiftEndAmPm) {
            newErrors.push({
                type: "field",
                value: "",
                msg: "وقت الانصراف مطلوب",
                path: "shiftEnd",
                location: "body"
            })
        }

        if (newErrors.length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)
        setErrors([])
        const result = await window.electron.employees.createEmployee(
            name.trim(),
            parseFloat(salary),
            buildTime(shiftStartHour, shiftStartAmPm),
            buildTime(shiftEndHour, shiftEndAmPm)
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

    const nameError = errors.find((e) => e.path === "name")?.msg
    const salaryError = errors.find((e) => e.path === "salary")?.msg
    const shiftStartError = errors.find((e) => e.path === "shiftStart")?.msg
    const shiftEndError = errors.find((e) => e.path === "shiftEnd")?.msg

    return (
        <div
            className="min-h-full flex items-center justify-center p-4"
            dir="rtl">
            <div className="w-full max-w-3xl">
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
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle
                                    cx="8.5"
                                    cy="7"
                                    r="4"
                                />
                                <line
                                    x1="20"
                                    y1="8"
                                    x2="20"
                                    y2="14"
                                />
                                <line
                                    x1="23"
                                    y1="11"
                                    x2="17"
                                    y2="11"
                                />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">موظف جديد</h3>
                            <p className="text-sm text-white/50">أضف موظفًا جديدًا</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    اسم الموظف
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        if (errors.length) setErrors([])
                                    }}
                                    placeholder="مثال: أحمد محمد"
                                    className={`w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all duration-200 ${nameError ? "ring-2 ring-red-500" : "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50"}`}
                                />
                                {nameError && (
                                    <p className="mt-1.5 text-sm text-red-400">{nameError}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    الراتب
                                </label>
                                <NumberInput
                                    value={Number(salary) || 0}
                                    onChange={(val) => {
                                        setSalary(String(val))
                                        if (errors.length) setErrors([])
                                    }}
                                    placeholder="0.00"
                                    min={0}
                                    step="0.01"
                                    error={salaryError}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    وقت الحضور
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={shiftStartHour}
                                        onChange={(e) => {
                                            setShiftStartHour(e.target.value)
                                            if (errors.length) setErrors([])
                                        }}
                                        className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50 appearance-none">
                                        <option
                                            value=""
                                            disabled
                                            className="bg-gray-800 text-white">
                                            الساعة
                                        </option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                            <option
                                                key={h}
                                                value={h.toString().padStart(2, "0")}
                                                className="bg-gray-800 text-white">
                                                {h.toString().padStart(2, "0")}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={shiftStartAmPm}
                                        onChange={(e) => {
                                            setShiftStartAmPm(e.target.value)
                                            if (errors.length) setErrors([])
                                        }}
                                        className="w-24 rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50 appearance-none">
                                        <option
                                            value=""
                                            disabled
                                            className="bg-gray-800 text-white">
                                            --
                                        </option>
                                        <option
                                            value="AM"
                                            className="bg-gray-800 text-white">
                                            AM
                                        </option>
                                        <option
                                            value="PM"
                                            className="bg-gray-800 text-white">
                                            PM
                                        </option>
                                    </select>
                                </div>
                                {shiftStartError && (
                                    <p className="mt-1.5 text-sm text-red-400">{shiftStartError}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">
                                    وقت الانصراف
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={shiftEndHour}
                                        onChange={(e) => {
                                            setShiftEndHour(e.target.value)
                                            if (errors.length) setErrors([])
                                        }}
                                        className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50 appearance-none">
                                        <option
                                            value=""
                                            disabled
                                            className="bg-gray-800 text-white">
                                            الساعة
                                        </option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                            <option
                                                key={h}
                                                value={h.toString().padStart(2, "0")}
                                                className="bg-gray-800 text-white">
                                                {h.toString().padStart(2, "0")}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={shiftEndAmPm}
                                        onChange={(e) => {
                                            setShiftEndAmPm(e.target.value)
                                            if (errors.length) setErrors([])
                                        }}
                                        className="w-24 rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50 appearance-none">
                                        <option
                                            value=""
                                            disabled
                                            className="bg-gray-800 text-white">
                                            --
                                        </option>
                                        <option
                                            value="AM"
                                            className="bg-gray-800 text-white">
                                            AM
                                        </option>
                                        <option
                                            value="PM"
                                            className="bg-gray-800 text-white">
                                            PM
                                        </option>
                                    </select>
                                </div>
                                {shiftEndError && (
                                    <p className="mt-1.5 text-sm text-red-400">{shiftEndError}</p>
                                )}
                            </div>
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
                                :   "إضافة الموظف"}
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
