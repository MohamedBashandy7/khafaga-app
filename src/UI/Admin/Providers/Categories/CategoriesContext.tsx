import { createContext } from "react"

export interface Category {
    code: string
    name: string
}

export type CategoriesContextType = {
    categories: Category[]
    total: number
    totalPages: number
    loading: boolean
    error: string | null
    fetchCategories: (
        page?: number,
        limit?: number,
        search?: string
    ) => Promise<void>
}

export const CategoriesContext = createContext<CategoriesContextType>({
    categories: [],
    total: 0,
    totalPages: 0,
    loading: true,
    error: null,
    fetchCategories: async () => {}
})