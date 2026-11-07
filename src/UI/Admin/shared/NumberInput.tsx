import React from "react"

interface NumberInputProps {
    value: number
    onChange: (value: number) => void
    placeholder?: string
    min?: number
    step?: string
    error?: string
    disabled?: boolean
    className?: string
}

export function NumberInput({
    value,
    onChange,
    placeholder,
    min,
    step = "0.01",
    error,
    disabled,
    className = ""
}: NumberInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const parsed = parseFloat(raw)
        if (!isNaN(parsed)) {
            onChange(parsed)
        } else if (raw === "") {
            onChange(0)
        }
    }

    return (
        <div>
            <style>{`
                .no-spinner::-webkit-outer-spin-button,
                .no-spinner::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .no-spinner[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder={placeholder}
                min={min}
                step={step}
                disabled={disabled}
                className={`no-spinner w-full rounded-xl bg-gray-800 px-3 py-3 text-white text-center outline-none ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${error ? "ring-2 ring-red-500" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    )
}
