import { useCallback, useState } from "react"
import { ProductsContext, type Product } from "./ProductsContext"

export default function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchProducts = useCallback(async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        setError(null)

        try {
            const result = await window.electron.products.getAllProducts(page, limit)

            if (result.success) {
                setProducts(result.data)
            } else {
                setError(result.message || "فشل جلب المنتجات")
                setProducts([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <ProductsContext.Provider
            value={{
                products,
                loading,
                error,
                fetchProducts
            }}>
            {children}
        </ProductsContext.Provider>
    )
}
