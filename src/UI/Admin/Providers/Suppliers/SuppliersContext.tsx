import { createContext } from "react"

export type Supplier = {
    _id: string
    name: string
    phone: string
    address: string
    governorate: {
        _id: string
        name: string
    }
    created_at: string
    updated_at: string
}

export type SuppliersContextType = {
    suppliers: Supplier[]
    loading: boolean
    error: string | null
    fetchSuppliers: (page?: number, limit?: number) => Promise<void>
}

export const SuppliersContext = createContext<SuppliersContextType>({
    suppliers: [],
    loading: true,
    error: null,
    fetchSuppliers: async () => {}
})
