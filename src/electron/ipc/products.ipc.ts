import { ipcHandle } from "../utils.js"
import * as productsService from "../services/products.service.js"

export function registerProductsIPC() {
    ipcHandle("products:getAll", async (params: { page?: number; limit?: number }) => {
        return productsService.getAllProducts(params?.page, params?.limit)
    })
    ipcHandle(
        "products:create",
        async (
            name: string,
            categoryId: string,
            wholesaleWholesalePrice: number,
            wholesalePrice: number,
            sellingPrice: number
        ) => {
            return productsService.createProduct(
                name,
                categoryId,
                wholesaleWholesalePrice,
                wholesalePrice,
                sellingPrice
            )
        }
    )
    ipcHandle("products:delete", async (id: string) => {
        return productsService.deleteProduct(id)
    })
    ipcHandle("products:get", async (id: string) => {
        return productsService.getProduct(id)
    })
    ipcHandle(
        "products:update",
        async (
            id: string,
            name: string,
            categoryId: string,
            wholesaleWholesalePrice: number,
            wholesalePrice: number,
            sellingPrice: number
        ) => {
            return productsService.updateProduct(
                id,
                name,
                categoryId,
                wholesaleWholesalePrice,
                wholesalePrice,
                sellingPrice
            )
        }
    )
}
