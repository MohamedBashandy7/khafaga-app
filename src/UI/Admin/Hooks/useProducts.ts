import { useContext } from "react"
import { ProductsContext, type ProductsContextType } from "../Providers/Products/ProductsContext"

export function useProducts(): ProductsContextType {
    return useContext(ProductsContext)
}
