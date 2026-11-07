import { ipcHandle } from "../utils.js"
import * as suppliersService from "../services/suppliers.service.js"

export function registerSuppliersIPC() {
    ipcHandle("suppliers:getAll", async (params: { page?: number; limit?: number }) => {
        return suppliersService.getAllSuppliers(params?.page, params?.limit)
    })
    ipcHandle(
        "suppliers:create",
        async (name: string, phone: string, governorate: string, address: string) => {
            return suppliersService.createSupplier(name, phone, governorate, address)
        }
    )
    ipcHandle("suppliers:delete", async (id: string) => {
        return suppliersService.deleteSupplier(id)
    })
    ipcHandle("suppliers:get", async (id: string) => {
        return suppliersService.getSupplier(id)
    })
    ipcHandle(
        "suppliers:update",
        async (id: string, name: string, phone: string, governorate: string, address: string) => {
            return suppliersService.updateSupplier(id, name, phone, governorate, address)
        }
    )
}
