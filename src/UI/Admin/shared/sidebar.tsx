import { NavLink } from "react-router-dom"
import logo from "../../../../src/assets/app-icon.ico"
export default function Sidebar() {
    return (
        <div
            dir="rtl"
            className="fixed top-0 left-0 z-[1000] flex h-full w-[250px] flex-col overflow-hidden bg-black/20 shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out">
            {/* Logo */}
            <div className="flex h-[75px] items-center justify-center border-b border-white/20">
                <a
                    href="/"
                    className="flex items-center gap-2 px-3">
                    <img
                        src={logo}
                        className="h-12 w-12"
                        alt="logo"
                    />
                    <h2 className="text-[20px] uppercase leading-none text-white">شركة اللؤلؤة</h2>
                </a>
            </div>

            {/* Menu list */}
            <ul className="flex flex-col space-y-1 overflow-y-auto p-3">
                <SidebarItem
                    to="/"
                    icon="zmdi-view-dashboard"
                    label="لوحة التحكم"
                    end
                />
                <SidebarItem
                    to="/categories"
                    icon="zmdi-widgets"
                    label="الاصناف"
                    end
                />
                <SidebarItem
                    to="/invoices/purchase"
                    icon="zmdi-receipt"
                    label="فواتير الشراء"
                />
                <SidebarItem
                    to="/categories/stock"
                    icon="zmdi-search"
                    label="بحث الأصناف"
                />
                {/* <SidebarItem
                    to="/categories"
                    icon="zmdi-widgets"
                    label="الأقسام"
                />
                <SidebarItem
                    to="/suppliers"
                    icon="zmdi-truck"
                    label="الموردين"
                />

                <SidebarItem
                    to="/products"
                    icon="zmdi-shopping-basket"
                    label="المنتجات"
                />
                <SidebarItem
                    to="/expenses"
                    icon="zmdi-money"
                    label="المصاريف"
                />
                <SidebarItem
                    to="/employees"
                    icon="zmdi-accounts"
                    label="الموظفين"
                />
                <SidebarItem
                    to="/attendance"
                    icon="zmdi-time"
                    label="الحضور و الانصراف"
                    end
                />
                <SidebarItem
                    to="/attendance/report"
                    icon="zmdi-file-text"
                    label="تقرير الحضور"
                /> */}
                {/* 
                <SidebarItem
                    to="/icons"
                    icon="zmdi-invert-colors"
                    label="الأيقونات"
                />
                <SidebarItem
                    to="/forms"
                    icon="zmdi-format-list-bulleted"
                    label="النماذج"
                />
                <SidebarItem
                    to="/tables"
                    icon="zmdi-grid"
                    label="الجداول"
                />
                <SidebarItem
                    to="/calendar"
                    icon="zmdi-calendar-check"
                    label="التقويم"
                    badge="جديد"
                />
                <SidebarItem
                    to="/profile"
                    icon="zmdi-face"
                    label="الملف الشخصي"
                />
                <SidebarItem
                    to="/login"
                    icon="zmdi-lock"
                    label="تسجيل الدخول"
                    external
                />
                <SidebarItem
                    to="/register"
                    icon="zmdi-account-circle"
                    label="حساب جديد"
                    external
                /> */}

                {/* Section header */}
                {/* <li className="px-2 pt-5 text-xs font-semibold uppercase tracking-wider text-white/50">
                    تسميات
                </li>

                <SidebarItem
                    to="#"
                    icon="zmdi-coffee"
                    label="مهم"
                    color="text-red-500"
                />
                <SidebarItem
                    to="#"
                    icon="zmdi-chart-donut"
                    label="تحذير"
                    color="text-green-500"
                />
                <SidebarItem
                    to="#"
                    icon="zmdi-share"
                    label="معلومات"
                    color="text-blue-400"
                /> */}
            </ul>
        </div>
    )
}

/* Helper component for a single menu item */
function SidebarItem({
    to,
    icon,
    label,
    badge,
    external,
    color = "text-white/65",
    end = false
}: {
    to: string
    icon: string
    label: string
    badge?: string
    external?: boolean
    color?: string
    end?: boolean
}) {
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-2 rounded-r-md border-r-[3px] px-5 py-2.5 text-[15px] transition-all duration-200 ${
            isActive ?
                "border-r-white bg-white/15 text-white"
            :   `border-r-transparent ${color} hover:bg-white/10 hover:text-white`
        }`

    return (
        <li>
            {external ?
                <a
                    href={to}
                    target="_blank"
                    className={linkClass({ isActive: false })}>
                    <i className={`zmdi ${icon} text-lg`}></i>
                    <span>{label}</span>
                </a>
            :   <NavLink
                    to={to}
                    end={end}
                    className={linkClass}>
                    <i className={`zmdi ${icon} text-lg`}></i>
                    <span>{label}</span>
                    {badge && (
                        <span className="mr-auto rounded bg-white/10 px-2 py-0.5 text-xs text-white">
                            {badge}
                        </span>
                    )}
                </NavLink>
            }
        </li>
    )
}
