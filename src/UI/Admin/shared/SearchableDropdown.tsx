import { useState, useRef, useEffect } from "react"

interface SearchableDropdownProps {
    options: { _id: string; name: string }[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    disabled?: boolean
}

export function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder = "اختر...",
    error,
    disabled
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt._id === value)
    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSearch("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div
            ref={containerRef}
            className="relative">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.35);
                }
            `}</style>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full rounded-xl bg-gray-800 px-4 py-3 text-right text-white outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-green-500/50 transition-all duration-200 flex items-center justify-between ${error ? "ring-2 ring-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                <span className={selectedOption ? "text-white" : "text-white/50"}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-xl bg-gray-800 border border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث..."
                            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ?
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt._id}
                                    onClick={() => {
                                        onChange(opt._id)
                                        setIsOpen(false)
                                        setSearch("")
                                    }}
                                    className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/10 ${opt._id === value ? "bg-white/15 text-white" : "text-white/80"}`}>
                                    {opt.name}
                                </li>
                            ))
                        :   <li className="px-4 py-3 text-sm text-white/50 text-center">
                                لا توجد نتائج
                            </li>
                        }
                    </ul>
                </div>
            )}
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        </div>
    )
}
