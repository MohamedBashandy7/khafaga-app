import { useContext } from "react"
import {
    SuppliersContext,
    type SuppliersContextType
} from "../Providers/Suppliers/SuppliersContext"

export function useSuppliers(): SuppliersContextType {
    return useContext(SuppliersContext)
}
