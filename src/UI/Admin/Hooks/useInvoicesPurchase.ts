import { useContext } from "react"
import {
    InvoicesPurchaseContext,
    type InvoicesPurchaseContextType
} from "../Providers/Invoices/Purchase/PurchaseContext"

export function useInvoicesPurchase(): InvoicesPurchaseContextType {
    return useContext(InvoicesPurchaseContext)
}
