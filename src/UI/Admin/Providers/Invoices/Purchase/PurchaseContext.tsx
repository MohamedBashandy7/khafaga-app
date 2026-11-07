import { createContext } from "react"

export type InvoicesPurchaseContextType = {
    invoices: InvoicePurchase[]
    loading: boolean
    error: string | null
    fetchInvoices: (page?: number, limit?: number) => Promise<void>
}

export const InvoicesPurchaseContext = createContext<InvoicesPurchaseContextType>({
    invoices: [],
    loading: true,
    error: null,
    fetchInvoices: async () => {}
})
