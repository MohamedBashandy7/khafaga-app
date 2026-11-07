import { useState } from "react"

export function useSidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return {
        isSidebarOpen,
        toggleSidebar
    }
}
