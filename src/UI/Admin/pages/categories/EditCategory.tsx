import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { showError, showSuccess } from "../../../../services/sweetAlert"
import Loader from "../../shared/loading"

export function EditCategory() {
    const { id } = useParams<{ id: string }>()
    const [name, setName] = useState("")
    const [errors, setErrors] = useState<FieldError[]>([])
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!id) return
        ;(async () => {
            const result = await window.electron.categories.getCategory(id)
            if (result.success && result.data) {
                setName(result.data.name)
            } else {
                showError("فشل تحميل بيانات القسم")
                navigate("/categories")
            }
            setPageLoading(false)
        })()
    }, [id, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) {
            setErrors([
                { type: "field", value: "", msg: "اسم القسم مطلوب", path: "name", location: "body" }
            ])
            return
        }
        setLoading(true)
        setErrors([])
        const result = await window.electron.categories.updateCategory(id!, trimmed)
        if (result.success) {
            showSuccess("تم تحديث القسم بنجاح")
            navigate("/categories")
        } else {
            if (result.errors?.length) setErrors(result.errors)
            else showError(result.message || "فشل التحديث")
        }
        setLoading(false)
    }

    if (pageLoading)
        return (
            <Loader
                force
                contained
            />
        )

    const nameError = errors.find((e) => e.path === "name")?.msg

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
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-white">تعديل القسم</h3>
                            <p className="text-sm text-white/50">عدل اسم القسم</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                اسم القسم
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
                                    nameError ? "ring-2 ring-red-500" : (
                                        "ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50"
                                    )
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
