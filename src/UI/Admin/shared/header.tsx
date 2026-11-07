import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Menu,
    Search,
    User,
    LogOut
    //  Settings, Wallet, Inbox
} from "lucide-react"
import { useAuth } from "../Hooks/useAuth"
import { customConfirm } from "../../../services/sweetAlert"
// Mail, Bell, Flag
interface HeaderProps {
    toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
    // const [showLanguage, setShowLanguage] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        setShowUserMenu(false)
        const confirmed = await customConfirm(
            "تسجيل الخروج",
            "هل أنت متأكد أنك تريد تسجيل الخروج؟",
            "نعم، تسجيل الخروج",
            "إلغاء"
        )
        if (!confirmed) return
        await logout()
        navigate("/login", { replace: true })
    }

    return (
        <nav className="flex flex-row flex-nowrap justify-between items-center px-4 h-full bg-black/20 shadow-lg w-full">
            <div className="flex items-center gap-4">
                {/* User Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <User
                                size={20}
                                className="text-white"
                            />
                        </div>
                    </button>
                    {showUserMenu && (
                        <div className="absolute left-0 top-full mt-2 bg-white/10 backdrop-blur-md rounded-lg shadow-xl border border-white/20 py-2 min-w-[200px]">
                            <div className="px-4 py-3 border-b border-white/20">
                                <h6 className="text-white font-semibold">محمد صلاح بشندي</h6>
                                <p className="text-white/60 text-sm">mohamed@example.com</p>
                            </div>
                            {/* <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <Inbox size={16} /> البريد الوارد
                            </button>
                            <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <Wallet size={16} /> الحساب
                            </button>
                            <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <Settings size={16} /> الإعدادات
                            </button> */}
                            {/* <div className="border-t border-white/20 my-2"></div> */}
                            <button className="w-full px-4 py-2 text-right text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2"></button>
                            <div className="border-t border-white/20 my-2"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-right text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2">
                                <LogOut size={16} /> تسجيل الخروج
                            </button>
                        </div>
                    )}
                </div>

                {/* Language Dropdown */}
                {/* <div className="relative">
                    <button
                        onClick={() => setShowLanguage(!showLanguage)}
                        className="text-white hover:text-white/80 transition-colors">
                        <Flag size={20} />
                    </button>
                    {showLanguage && (
                        <div className="absolute left-0 top-full mt-2 bg-white/10 backdrop-blur-md rounded-lg shadow-xl border border-white/20 py-2 min-w-[150px]">
                            <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <span className="text-lg">🇬🇧</span> الإنجليزية
                            </button>
                            <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <span className="text-lg">🇫🇷</span> الفرنسية
                            </button>
                            <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <span className="text-lg">🇨🇳</span> الصينية
                            </button>
                            <button className="w-full px-4 py-2 text-right text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                <span className="text-lg">🇩🇪</span> الألمانية
                            </button>
                        </div>
                    )}
                </div> */}

                {/* <button className="text-white hover:text-white/80 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="text-white hover:text-white/80 transition-colors relative">
                    <Mail size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button> */}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <form className="relative">
                    <input
                        type="text"
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 pl-10 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 w-64"
                        placeholder="أدخل كلمات البحث"
                    />
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                        size={16}
                    />
                </form>
                <button
                    onClick={toggleSidebar}
                    className="text-white hover:text-white/80 transition-colors">
                    <Menu size={20} />
                </button>
            </div>
        </nav>
    )
}
