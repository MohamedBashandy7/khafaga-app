import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, User } from "lucide-react"
import AuthLayout from "../../layouts/auth.layout"
import { useInputDirection } from "../../../../Hooks/useInputDirection"
import { useAuth } from "../../Hooks/useAuth"

export default function Login() {
    const usernameRef = useInputDirection()
    const passwordRef = useInputDirection()
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleLogin = async () => {
        if (submitting) return
        setError("")
        setEmailError("")
        setPasswordError("")

        if (!email || !password) {
            setError("من فضلك ادخل اسم المستخدم وكلمة المرور")
            return
        }

        setSubmitting(true)

        const result = await login(email, password)
        setSubmitting(false)

        if (!result.success) {
            // Handle field-specific errors
            if (result.fieldErrors) {
                result.fieldErrors.forEach((fieldError) => {
                    if (fieldError.path === "email") {
                        setEmailError(fieldError.msg)
                    } else if (fieldError.path === "password") {
                        setPasswordError(fieldError.msg)
                    }
                })
            } else {
                // Only show general error if no field-specific errors
                setError(result.message || "فشل تسجيل الدخول")
            }
            return
        }
        navigate("/", { replace: true })
    }

    return (
        <AuthLayout>
            <div
                dir="rtl"
                className="flex min-h-screen items-center justify-center p-6">
                <div className="mb-[25px] w-full max-w-md rounded-2xl border-none bg-black/20 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                    <div className="p-8">
                        <h1 className="mb-8 text-center text-3xl font-bold text-white">
                            شركة اللؤلؤة
                        </h1>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                ايميل المستخدم
                            </label>
                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
                                />
                                <input
                                    ref={usernameRef}
                                    type="text"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        setEmailError("")
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                    placeholder="أدخل ايميلك"
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/80 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30"
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-400">{emailError}</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60"
                                />
                                <input
                                    ref={passwordRef}
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        setPasswordError("")
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                    placeholder="أدخل كلمة المرور"
                                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/80 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30"
                                />
                                {passwordError && (
                                    <p className="mt-1 text-sm text-red-400">{passwordError}</p>
                                )}
                            </div>
                        </div>

                        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

                        <div className="mb-6 flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-white/30 bg-white/10"
                                />
                                تذكرني
                            </label>
                            <button className="text-sm text-sky-300 hover:underline">
                                إعادة تعيين كلمة المرور
                            </button>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={submitting}
                            className="h-12 w-full rounded-xl bg-[#004B77] font-semibold text-white transition hover:bg-[#005d95] disabled:opacity-60">
                            {submitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </button>
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}
