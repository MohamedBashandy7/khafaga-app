// import { Settings } from "lucide-react"
// import { useState } from "react"

import { ThemeSwitcher } from "../shared/themeSwitcher"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // const [isThemeOpen, setIsThemeOpen] = useState(false)

    return (
        <>
            {children}
            <ThemeSwitcher />
        </>
    )
}
