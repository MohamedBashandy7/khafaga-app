interface NoDataProps {
    icon: React.ReactNode
    message: string
}

export default function NoData({ icon, message }: NoDataProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-white/50">{icon}</div>
            <p className="text-lg text-white/70">{message}</p>
        </div>
    )
}
