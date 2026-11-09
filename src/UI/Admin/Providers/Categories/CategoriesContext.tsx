
import { createContext } from "react"

export interface Category {
    code: string
    name: string
}

export type CategoriesContextType = {
    categories: Category[]
    loading: boolean
    error: string | null
    fetchCategories: (page?: number, limit?: number) => Promise<void>
}

export const CategoriesContext = createContext<CategoriesContextType>({
    categories: [],
    loading: true,
    error: null,
    fetchCategories: async () => {}
})
