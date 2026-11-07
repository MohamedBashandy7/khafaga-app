import { useEffect, useRef } from "react"

export function useInputDirection() {
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const input = inputRef.current
        if (!input) return

        const placeholder = input.placeholder || ""
        const hasArabicPlaceholder = /[\u0600-\u06FF]/.test(placeholder)

        const updateDirection = (value: string) => {
            if (value === "") {
                input.style.direction = hasArabicPlaceholder ? "rtl" : "ltr"
            } else {
                const hasArabic = /[\u0600-\u06FF]/.test(value)
                input.style.direction = hasArabic ? "rtl" : "ltr"
            }
        }

        updateDirection("")

        const handleInput = () => {
            updateDirection(input.value)
        }

        input.addEventListener("input", handleInput)

        return () => {
            input.removeEventListener("input", handleInput)
        }
    }, [])

    return inputRef
}
