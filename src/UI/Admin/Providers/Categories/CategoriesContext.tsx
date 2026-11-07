import { createContext } from "react"

export interface Category {
    _id: string
    name: string
    status: "1" | "0"
    created_at: string
    updated_at: string
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
