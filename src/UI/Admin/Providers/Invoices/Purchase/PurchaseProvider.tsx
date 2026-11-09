
import { useCallback, useState } from "react"
import { InvoicesPurchaseContext } from "./PurchaseContext"

export default function InvoicesPurchaseProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [invoices, setInvoices] = useState<InvoicePurchase[]>([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchInvoices = useCallback(
        async (
            page = 1,
            limit = 10,
            invoiceNo = "",
            invoiceDate = "",
            status: InvoicePurchaseStatus = "",
            sortOrder: InvoicePurchaseSortOrder = "newest"
        ) => {
            setLoading(true)
            setError(null)

            try {
                const result = await window.electron.invoicesPurchase.getAll(
                    page,
                    limit,
                    invoiceNo,
                    invoiceDate,
                    status,
                    sortOrder
                )

                if (result.success) {
                    setInvoices(result.data)
                    setTotal(result.total)
                    setCurrentPage(result.currentPage)
                    setTotalPages(result.totalPages)
                } else {
                    setError(result.message || "فشل جلب الفواتير")
                    setInvoices([])
                    setTotal(0)
                    setTotalPages(0)
                }
            } catch {
                setError("تعذر الاتصال بالسيرفر")
                setInvoices([])
                setTotal(0)
                setTotalPages(0)
            } finally {
                setLoading(false)
            }
        },
        []
    )

    return (
        <InvoicesPurchaseContext.Provider
            value={{
                invoices,
                total,
                currentPage,
                totalPages,
                loading,
                error,
                fetchInvoices
            }}
        >
            {children}
        </InvoicesPurchaseContext.Provider>
    )
}
