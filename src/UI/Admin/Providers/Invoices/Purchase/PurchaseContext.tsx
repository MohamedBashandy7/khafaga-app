
import { createContext } from "react"

export type InvoicesPurchaseContextType = {
    invoices: InvoicePurchase[]
    total: number
    currentPage: number
    totalPages: number
    loading: boolean
    error: string | null
    fetchInvoices: (
        page?: number,
        limit?: number,
        invoiceNo?: string,
        invoiceDate?: string,
        status?: InvoicePurchaseStatus,
        sortOrder?: InvoicePurchaseSortOrder
    ) => Promise<void>
}

export const InvoicesPurchaseContext = createContext<InvoicesPurchaseContextType>({
    invoices: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    loading: true,
    error: null,
    fetchInvoices: async () => {}
})
