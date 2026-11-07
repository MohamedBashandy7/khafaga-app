import { useCallback, useState } from "react"
import { InvoicesPurchaseContext } from "./PurchaseContext"

export default function InvoicesPurchaseProvider({ children }: { children: React.ReactNode }) {
    const [invoices, setInvoices] = useState<InvoicePurchase[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchInvoices = useCallback(async (page = 1, limit = 10) => {
        setLoading(true)
        setError(null)
        try {
            const result = await window.electron.invoicesPurchase.getAll(page, limit)
            if (result.success) setInvoices(result.data)
            else {
                setError(result.message || "فشل جلب الفواتير")
                setInvoices([])
            }
        } catch {
            setError("تعذر الاتصال بالسيرفر")
            setInvoices([])
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <InvoicesPurchaseContext.Provider value={{ invoices, loading, error, fetchInvoices }}>
            {children}
        </InvoicesPurchaseContext.Provider>
    )
}
