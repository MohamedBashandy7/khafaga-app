import { useCallback, useState } from "react"
import { SuppliersContext, type Supplier } from "./SuppliersContext"

export default function SuppliersProvider({ children }: { children: React.ReactNode }) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSuppliers = useCallback(async (page = 1, limit = 10) => {
        setLoading(true)
        setError(null)
        try {
            const result = await window.electron.suppliers.getAllSuppliers(page, limit)
            if (result.success) {
                setSuppliers(result.data)
            } else {
                setError(result.message || "فشل جلب الموردين")
                setSuppliers([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setSuppliers([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <SuppliersContext.Provider value={{ suppliers, loading, error, fetchSuppliers }}>
            {children}
        </SuppliersContext.Provider>
    )
}
