import { useCallback, useState } from "react"
import {
    CategoriesContext,
    type Category
} from "./CategoriesContext"

export default function CategoriesProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [categories, setCategories] = useState<Category[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(
        async (
            page: number = 1,
            limit: number = 10,
            search: string = ""
        ) => {
            setLoading(true)
            setError(null)

            try {
                const result = await window.electron.categories.getAllCategories(
                    page,
                    limit,
                    search
                )
                    console.log("PROVIDER SEARCH:", {
        page,
        limit,
        search
    })
                if (result.success) {
                    setCategories(result.data)
                    setTotal(result.total)
                    setTotalPages(result.totalPages)
                } else {
                    setError(result.message || "فشل جلب التصنيفات")
                    setCategories([])
                    setTotal(0)
                    setTotalPages(0)
                }

            } catch {
                setError("فشل جلب التصنيفات من قاعدة البيانات")
                setCategories([])
                setTotal(0)
                setTotalPages(0)
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
                total,
                totalPages,
                loading,
                error,
                fetchCategories
            }}
        >
            {children}
        </CategoriesContext.Provider>
    )
}