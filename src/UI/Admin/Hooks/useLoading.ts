import { useContext } from "react"
import { LoadingContext } from "../Providers/Loading/LoadingContext"

export function useLoading() {
    return useContext(LoadingContext)
}
