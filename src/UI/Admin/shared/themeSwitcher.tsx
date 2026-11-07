import { useState } from "react"
import "material-design-iconic-font/dist/css/material-design-iconic-font.min.css"

import theme1 from "../../../assets/themes/1.png"
import theme2 from "../../../assets/themes/2.png"
import theme4 from "../../../assets/themes/4.png"
import theme5 from "../../../assets/themes/5.png"
import theme6 from "../../../assets/themes/6.png"

const imageThemes = [theme1, theme2, theme4, theme5, theme5, theme6]

const gradientThemes = [
    "linear-gradient(45deg, #0c675e, #069e90)",
    "linear-gradient(567deg, rgba(165, 42, 4, 0.89), rgba(113, 102, 8, 0.89), rgba(13, 95, 16, 0.93), rgba(4, 79, 88, 0.94), rgba(19, 56, 86, 0.9), rgba(24, 32, 78, 0.94), rgba(100, 8, 115, 0.95))",
    "linear-gradient(45deg, #29323c, #485563)",
    "linear-gradient(45deg, #795548, #945c48)",
    "linear-gradient(45deg, #1565C0, #1E88E5)",
    "linear-gradient(45deg, #65379b, #886aea)",
    "linear-gradient(180deg, #ff5447, #f1076f)",
    "linear-gradient(180deg, #08a50e, #69bb03)",
    "linear-gradient(45deg, #6a11cb, #2575fc)"
]

const themeItemClass =
    "float-right w-[85px] h-[75px] ml-[15px] mb-[15px] rounded border-0 cursor-pointer"
const applyImageTheme = async (image: string, onClose?: () => void) => {
    document.body.style.backgroundImage = `url(${image})`
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center"
    document.body.style.backgroundRepeat = "no-repeat"
    await window.electron.theme.set({
        type: "image",
        value: image
    })
    onClose?.()
}

const applyGradientTheme = async (gradient: string, onClose?: () => void) => {
    document.body.style.backgroundImage = gradient
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center"
    document.body.style.backgroundRepeat = "no-repeat"
    await window.electron.theme.set({
        type: "gradient",
        value: gradient
    })
    onClose?.()
}
export function ThemeSwitcher() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <style>{`
                .theme-sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .theme-sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .theme-sidebar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 3px;
                }

                .theme-sidebar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
            `}</style>

            <div
                dir="rtl"
                className={`theme-sidebar fixed top-0 z-[9999] w-[250px] h-full max-h-full overflow-y-auto overflow-x-hidden bg-black p-2.5 text-center shadow-[0_16px_38px_-12px_rgba(0,0,0,0.56),0_4px_25px_0_rgba(0,0,0,0.12),0_8px_10px_-5px_rgba(0,0,0,0.2)] transition-all duration-300 ${
                    isOpen ? "left-0" : "-left-[250px]"
                }`}>
                <div
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`fixed top-60 h-10 w-10 cursor-pointer rounded-r bg-black text-center text-[22px] leading-10 text-white shadow-[0_16px_38px_-12px_rgba(0,0,0,0.56),0_4px_25px_0_rgba(0,0,0,0.12),0_8px_10px_-5px_rgba(0,0,0,0.2)] transition-all duration-300 ${
                        isOpen ? "left-[250px]" : "left-0"
                    }`}>
                    <i className="zmdi zmdi-settings zmdi-hc-spin" />
                </div>

                <ul className="mr-5 mt-4 list-none overflow-hidden p-0">
                    {imageThemes.map((theme, index) => (
                        <li
                            key={index}
                            className={themeItemClass}
                            onClick={() => applyImageTheme(theme, () => setIsOpen(false))}
                            style={{
                                backgroundImage: `url(${theme})`,
                                backgroundSize: "100% 100%",
                                backgroundPosition: "center"
                            }}
                        />
                    ))}
                </ul>

                <ul className="mr-5 list-none overflow-hidden p-0">
                    {gradientThemes.map((theme, index) => (
                        <li
                            key={index}
                            className={themeItemClass}
                            onClick={() => applyGradientTheme(theme, () => setIsOpen(false))}
                            style={{
                                backgroundImage: theme,
                                backgroundSize: "100% 100%",
                                backgroundPosition: "center"
                            }}
                        />
                    ))}
                </ul>
            </div>
        </>
    )
}
