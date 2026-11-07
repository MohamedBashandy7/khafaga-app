import { Outlet } from "react-router-dom"
import { ThemeSwitcher } from "../shared/themeSwitcher"
import Header from "../shared/header"
import Footer from "../shared/footer"
import { useSidebar } from "../Hooks/useSidebar"
import Sidebar from "../shared/sidebar"

export default function MainLayout() {
    const { isSidebarOpen, toggleSidebar } = useSidebar()
    return (
        <>
            <ThemeSwitcher />
            <style>{`
                .main-content::-webkit-scrollbar {
                    width: 8px;
                }

                .main-content::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .main-content::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }

                .main-content::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
            <div
                className="grid h-screen overflow-hidden"
                style={{
                    gridTemplateRows: "repeat(9, 1fr)",
                    gridTemplateColumns: "repeat(12, minmax(0, 1fr))"
                }}>
                <div
                    className={`col-start-11 col-span-2 row-start-1 row-span-9 transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}>
                    <Sidebar />
                </div>
                <header
                    className={`col-start-1 row-start-1 z-[999] bg-black/20 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? "col-span-10" : "col-span-12"}`}>
                    <Header toggleSidebar={toggleSidebar} />
                </header>
                <div
                    className={`col-start-1 row-start-9 transition-all duration-300 ease-in-out ${isSidebarOpen ? "col-span-10" : "col-span-12"}`}>
                    <Footer />
                </div>
                <div
                    className={`main-content relative col-start-1 row-start-2 row-span-7 overflow-y-auto p-6 transition-all duration-300 ease-in-out ${isSidebarOpen ? "col-span-10" : "col-span-12"}`}>
                    <Outlet />
                </div>
            </div>
        </>
    )
}
