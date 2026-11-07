import { ipcHandle } from "../utils.js"
import * as categoriesService from "../services/categories.service.js"

export function registerCategoriesIPC() {
    ipcHandle("categories:getAll", async (params: { page?: number; limit?: number }) => {
        return categoriesService.getAllCategories(params?.page, params?.limit)
    })
    ipcHandle("categories:create", async (name: string) => {
        return categoriesService.createCategory(name)
    })
    ipcHandle("categories:delete", async (id: string) => {
        return categoriesService.deleteCategory(id)
    })
    ipcHandle("categories:get", async (id: string) => {
        return categoriesService.getCategory(id)
    })
    ipcHandle("categories:update", async (id: string, name: string) => {
        return categoriesService.updateCategory(id, name)
    })
}
