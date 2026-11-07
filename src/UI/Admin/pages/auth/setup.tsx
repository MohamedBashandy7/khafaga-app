
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Mail, User } from "lucide-react"
import AuthLayout from "../../layouts/auth.layout"
import { useAuth } from "../../Hooks/useAuth"

export default function Setup() {
    const navigate = useNavigate()
    const { setupAdmin } = useAuth()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSetup = async () => {
        if (submitting) return

        setError("")

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("من فضلك أدخل جميع البيانات")
            return
        }

        if (password.length < 8) {
            setError("كلمة المرور يجب ألا تقل عن 8 أحرف")
            return
        }

        if (password !== confirmPassword) {
            setError("كلمتا المرور غير متطابقتين")
            return
        }

        setSubmitting(true)

        try {
            const result = await setupAdmin({
                name,
                email,
                password
            })

            if (!result.success) {
                setError(result.message || "فشل إنشاء الحساب")
                return
            }

            navigate("/login", { replace: true })
        } catch {
            setError("حدث خطأ أثناء إنشاء الحساب")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthLayout>
            <div dir="rtl" className="flex min-h-screen items-center justify-center p-6">
                <div className="mb-[25px] w-full max-w-md rounded-2xl border-none bg-black/20 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                    <div className="p-8">
                        <h1 className="mb-3 text-center text-3xl font-bold text-white">
                            شركة اللؤلؤة
                        </h1>

                        <p className="mb-8 text-center text-sm text-white/70">
                            إنشاء حساب المدير الرئيسي
                        </p>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                الاسم
                            </label>

                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
                                />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="أدخل اسم المدير"
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/80 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                البريد الإلكتروني
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="أدخل البريد الإلكتروني"
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/80 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                كلمة المرور
                            </label>

                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
                                />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="8 أحرف على الأقل"
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/80 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30"
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                تأكيد كلمة المرور
                            </label>

                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
                                />

                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="أعد إدخال كلمة المرور"
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/80 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="mb-4 text-sm text-red-400">{error}</p>
                        )}

                        <button
                            onClick={handleSetup}
                            disabled={submitting}
                            className="h-12 w-full rounded-xl bg-[#004B77] font-semibold text-white transition hover:bg-[#005d95] disabled:opacity-60"
                        >
                            {submitting ? "جاري إنشاء الحساب..." : "إنشاء حساب المدير"}
                        </button>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}
