import { useCallback, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { LoadingContext } from "./LoadingContext"

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [loading, setLoading] = useState(true)

    const showLoading = useCallback(() => {
        setLoading(true)
    }, [])

    const hideLoading = useCallback(() => {
        setLoading(false)
    }, [])

    const value = useMemo(
        () => ({
            loading,
            showLoading,
            hideLoading
        }),
        [loading, showLoading, hideLoading]
    )

    return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
}
