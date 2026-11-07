import { createContext } from "react"

export interface Product {
    _id: string
    name: string
    barcode?: string
    category_id: {
        _id: string
        name: string
    }
    wholesale_wholesale_price: number
    wholesale_price: number
    selling_price: number
    status: "1" | "0"
    created_at: string
    updated_at: string
}

export type ProductsContextType = {
    products: Product[]
    loading: boolean
    error: string | null
    fetchProducts: (page?: number, limit?: number) => Promise<void>
}

export const ProductsContext = createContext<ProductsContextType>({
    products: [],
    loading: true,
    error: null,
    fetchProducts: async () => {}
})
