import { useContext } from "react"
import {
    CategoriesContext,
    type CategoriesContextType
} from "../Providers/Categories/CategoriesContext"

export function useCategories(): CategoriesContextType {
    return useContext(CategoriesContext)
}
