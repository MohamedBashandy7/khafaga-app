import { useCallback, useEffect, useState } from "react"

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        completedInvoices: 0,
        remainingInvoices: 0,
        totalCategories: 0
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await window.electron.stats.getDashboard()

            if (result.success) {
                setStats(result.data)
            } else {
                setError(result.message || "فشل جلب الإحصائيات")
            }
        } catch (error) {
            console.error("Dashboard Stats Error:", error)
            setError(
                error instanceof Error
                    ? error.message
                    : String(error)
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const cards = [
        {
            title: "الفواتير المنتهية",
            value: stats.completedInvoices,
            icon: "zmdi-check-circle",
            color: "text-green-400",
            background: "bg-green-500/10"
        },
        {
            title: "الفواتير غير المنتهية",
            value: stats.remainingInvoices,
            icon: "zmdi-shopping-cart",
            color: "text-orange-400",
            background: "bg-orange-500/10"
        },
        {
            title: "عدد الأصناف",
            value: stats.totalCategories,
            icon: "zmdi-widgets",
            color: "text-blue-400",
            background: "bg-blue-500/10"
        }
    ]

    return (
        <div dir="rtl" className="space-y-6 p-5 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        لوحة التحكم
                    </h1>
                    <p className="mt-1 text-sm text-white/50">
                        نظرة عامة على الفواتير والأصناف
                    </p>
                </div>

                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20 disabled:opacity-50"
                >
                    <i className="zmdi zmdi-refresh"></i>
                    تحديث
                </button>
            </div>

            {error && (
                <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                    <span>{error}</span>
                    <button onClick={fetchStats} className="underline">
                        إعادة المحاولة
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map(card => (
                    <div
                        key={card.title}
                        className="rounded-xl border border-white/10 bg-black/20 p-5 shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/60">
                                    {card.title}
                                </p>

                                <h2 className="mt-3 text-3xl font-bold">
                                    {loading ? (
                                        <span className="text-white/30">...</span>
                                    ) : (
                                        card.value.toLocaleString("en-US")
                                    )}
                                </h2>
                            </div>

                            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.background} ${card.color}`}>
                                <i className={`zmdi ${card.icon} text-3xl`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}