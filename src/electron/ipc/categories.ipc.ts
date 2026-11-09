import { ipcHandle } from "../utils.js"
import * as categoriesService from "../services/categories.service.js"

export function registerCategoriesIPC() {
    ipcHandle(
        "categories:getAll",
        async (params: {
            page?: number
            limit?: number
            search?: string
        }) => {
            return categoriesService.getAllCategories(
                params?.page,
                params?.limit,
                params?.search
            )
        }
    )

    ipcHandle(
        "categories:searchStock",
        async (params: { search?: string }) => {
            return categoriesService.searchCategoriesStock(
                params?.search
            )
        }
    )

    ipcHandle(
        "categories:create",
        async (data: { code: string; name: string }) => {
            return categoriesService.createCategory(data.code, data.name)
        }
    )

    ipcHandle("categories:delete", async (code: string) => {
        return categoriesService.deleteCategory(code)
    })

    ipcHandle("categories:get", async (code: string) => {
        return categoriesService.getCategory(code)
    })

    ipcHandle(
        "categories:update",
        async (oldCode: string, newCode: string, name: string) => {
            return categoriesService.updateCategory(oldCode, newCode, name)
        }
    )
}