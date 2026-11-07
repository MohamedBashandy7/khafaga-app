import { createContext } from "react"

export type LoadingContextType = {
    loading: boolean
    showLoading: () => void
    hideLoading: () => void
}

export const LoadingContext = createContext<LoadingContextType>({
    loading: false,
    showLoading: () => {},
    hideLoading: () => {}
})
