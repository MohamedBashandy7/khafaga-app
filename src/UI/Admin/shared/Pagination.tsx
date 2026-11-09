
import { useEffect, useState } from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    total?: number
    onPageChange: (page: number) => void
    isRtl?: boolean
}

export default function Pagination({
    currentPage,
    totalPages,
    total = 0,
    onPageChange,
    isRtl = false
}: PaginationProps) {
    const groupSize = 5
    const safeTotalPages = Math.max(totalPages || 1, 1)
    const safePage = Math.min(Math.max(currentPage, 1), safeTotalPages)

    const [displayStart, setDisplayStart] = useState(1)

    useEffect(() => {
        const groupIndex = Math.floor((safePage - 1) / groupSize)
        setDisplayStart(groupIndex * groupSize + 1)
    }, [safePage])

    const startPage = Math.max(1, Math.min(displayStart, safeTotalPages))
    const endPage = Math.min(startPage + groupSize - 1, safeTotalPages)

    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
    )

    const hasPrevGroup = startPage > 1
    const hasNextGroup = endPage < safeTotalPages

    const handlePrevGroup = () => {
        if (hasPrevGroup) {
            setDisplayStart(Math.max(1, startPage - groupSize))
        }
    }

    const handleNextGroup = () => {
        if (hasNextGroup) {
            setDisplayStart(startPage + groupSize)
        }
    }

    const ChevronLeft = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    )

    const ChevronRight = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )

    const PrevIcon = isRtl ? ChevronRight : ChevronLeft
    const NextIcon = isRtl ? ChevronLeft : ChevronRight

    const totalPagesContent = (
        <div className="whitespace-nowrap text-sm text-white/70">
            إجمالي الصفحات:{" "}
            <span className="font-semibold text-white">
                {safeTotalPages}
            </span>
        </div>
    )

    const totalItemsContent = (
        <div className="whitespace-nowrap text-sm text-white/70">
            إجمالي العناصر:{" "}
            <span className="font-semibold text-white">
                {total}
            </span>
        </div>
    )

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-transparent px-4 py-3">
            {isRtl ? totalPagesContent : totalItemsContent}

            <div className="flex items-center justify-center gap-2">
                <button
                    type="button"
                    onClick={handlePrevGroup}
                    disabled={!hasPrevGroup}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-transparent text-white transition-colors ${
                        hasPrevGroup
                            ? "cursor-pointer hover:border-green-400 hover:text-green-300"
                            : "cursor-not-allowed opacity-30"
                    }`}
                >
                    <PrevIcon />
                </button>

                {pages.map(num => (
                    <button
                        type="button"
                        key={num}
                        onClick={() => onPageChange(num)}
                        className={`h-10 w-10 rounded-lg border text-sm font-semibold transition-colors ${
                            currentPage === num
                                ? "border-green-400 bg-green-500/40 text-green-200"
                                : "cursor-pointer border-white/20 bg-transparent text-white hover:border-green-400 hover:text-green-300"
                        }`}
                    >
                        {num}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleNextGroup}
                    disabled={!hasNextGroup}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-transparent text-white transition-colors ${
                        hasNextGroup
                            ? "cursor-pointer hover:border-green-400 hover:text-green-300"
                            : "cursor-not-allowed opacity-30"
                    }`}
                >
                    <NextIcon />
                </button>
            </div>

            {isRtl ? totalItemsContent : totalPagesContent}
        </div>
    )
}
