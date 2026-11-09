
import { useCallback, useState } from "react"
import { CategoriesContext, type Category } from "./CategoriesContext"

export default function CategoriesProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(
        async (page: number = 1, limit: number = 10) => {
            setLoading(true)
            setError(null)

            try {
                const result = await window.electron.categories.getAllCategories(
                    page,
                    limit
                )

                if (result.success) {
                    setCategories(result.data)
                } else {
                    setError(result.message || "فشل جلب التصنيفات")
                    setCategories([])
                }
            } catch {
                setError("فشل جلب التصنيفات من قاعدة البيانات")
                setCategories([])
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return (
        <CategoriesContext.Provider
            value={{
                categories,
                loading,
                error,
                fetchCategories
            }}
        >
            {children}
        </CategoriesContext.Provider>
    )
}
