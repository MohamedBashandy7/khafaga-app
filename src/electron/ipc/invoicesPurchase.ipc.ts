import { ipcHandle } from "../utils.js"
import * as invoicesPurchaseService from "../services/invoicesPurchase.service.js"

export function registerInvoicesPurchaseIPC() {
    ipcHandle(
        "invoicesPurchase:getAll",
        async (params: { page?: number; limit?: number }) => {
            return invoicesPurchaseService.getAllInvoicesPurchase(
                params?.page,
                params?.limit
            )
        }
    )

    ipcHandle("invoicesPurchase:get", async (id: string) => {
        return invoicesPurchaseService.getInvoicePurchase(id)
    })

    ipcHandle(
        "invoicesPurchase:create",
        async (
            invoiceNo: string,
            invoiceDate: string,
            items: {
                categoryCode: string
                quantity: number | null
                price: number
            }[]
        ) => {
            return invoicesPurchaseService.createInvoicePurchase(
                invoiceNo,
                invoiceDate,
                items
            )
        }
    )

    ipcHandle(
        "invoicesPurchase:update",
        async (
            id: string,
            invoiceNo: string,
            invoiceDate: string,
            items: {
                categoryCode: string
                quantity: number | null
                price: number
            }[]
        ) => {
            return invoicesPurchaseService.updateInvoicePurchase(
                id,
                invoiceNo,
                invoiceDate,
                items
            )
        }
    )

    ipcHandle("invoicesPurchase:delete", async (id: string) => {
        return invoicesPurchaseService.deleteInvoicePurchase(id)
    })
}
