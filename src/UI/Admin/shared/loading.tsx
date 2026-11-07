import { useLoading } from "../Hooks/useLoading"

type LoaderProps = {
    force?: boolean
    contained?: boolean
}

export default function Loader({ force = false, contained = false }: LoaderProps) {
    const { loading } = useLoading()
    if (!loading && !force) return null
    return (
        <div
            className={`${contained ? "absolute" : "fixed"} inset-0 z-[9999] flex items-center justify-center`}>
            <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
                <p className="text-xl font-semibold tracking-wide text-white">... جاري التحميل</p>
            </div>
        </div>
    )
}
