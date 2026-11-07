import { ipcHandle } from "../utils.js"
import * as invoicesPurchaseService from "../services/invoicesPurchase.service.js"

export function registerInvoicesPurchaseIPC() {
    ipcHandle("invoicesPurchase:getAll", async (params: { page?: number; limit?: number }) => {
        return invoicesPurchaseService.getAllInvoicesPurchase(params?.page, params?.limit)
    })
    ipcHandle("invoicesPurchase:get", async (id: string) => {
        return invoicesPurchaseService.getInvoicePurchase(id)
    })
    ipcHandle(
        "invoicesPurchase:create",
        async (
            supplier: string,
            items: { product: string; quantity: number; purchasePrice: number }[],
            discount: number,
            tax: number,
            paid: number,
            notes: string
        ) => {
            return invoicesPurchaseService.createInvoicePurchase(
                supplier,
                items,
                discount,
                tax,
                paid,
                notes
            )
        }
    )
    ipcHandle(
        "invoicesPurchase:update",
        async (
            id: string,
            supplier: string,
            items: { product: string; quantity: number; purchasePrice: number }[],
            discount: number,
            tax: number,
            paid: number,
            notes: string
        ) => {
            return invoicesPurchaseService.updateInvoicePurchase(
                id,
                supplier,
                items,
                discount,
                tax,
                paid,
                notes
            )
        }
    )
    ipcHandle("invoicesPurchase:delete", async (id: string) => {
        return invoicesPurchaseService.deleteInvoicePurchase(id)
    })
}
