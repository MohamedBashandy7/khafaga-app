import { getDatabase } from "../database/database.js"

export type DashboardStats = {
    completedInvoices: number
    remainingInvoices: number
    totalCategories: number
}

export type DashboardStatsResponse = {
    success: boolean
    data: DashboardStats
    message?: string
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
        const database = getDatabase()

        database.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                code TEXT PRIMARY KEY,
                name TEXT NOT NULL
            )
        `)

        const tables = database.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            AND name IN (
                'purchase_invoices',
                'purchase_invoice_items'
            )
        `).all() as { name: string }[]

        const hasInvoiceTables =
            tables.some(table => table.name === "purchase_invoices") &&
            tables.some(table => table.name === "purchase_invoice_items")

        let completedInvoices = 0
        let remainingInvoices = 0

        if (hasInvoiceTables) {
            const completedResult = database.prepare(`
                SELECT COUNT(*) AS total
                FROM purchase_invoices
                WHERE EXISTS (
                    SELECT 1
                    FROM purchase_invoice_items
                    WHERE invoice_id = purchase_invoices.id
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM purchase_invoice_items
                    WHERE invoice_id = purchase_invoices.id
                    AND is_closed = 0
                    AND (
                        remaining_quantity IS NULL
                        OR remaining_quantity > 0
                    )
                )
            `).get() as { total: number }

            const remainingResult = database.prepare(`
                SELECT COUNT(*) AS total
                FROM purchase_invoices
                WHERE EXISTS (
                    SELECT 1
                    FROM purchase_invoice_items
                    WHERE invoice_id = purchase_invoices.id
                    AND is_closed = 0
                    AND (
                        remaining_quantity IS NULL
                        OR remaining_quantity > 0
                    )
                )
            `).get() as { total: number }

            completedInvoices = Number(completedResult.total)
            remainingInvoices = Number(remainingResult.total)
        }

        const categoriesResult = database.prepare(`
            SELECT COUNT(*) AS total
            FROM categories
        `).get() as { total: number }

        return {
            success: true,
            data: {
                completedInvoices,
                remainingInvoices,
                totalCategories: Number(categoriesResult.total)
            }
        }
    } catch (error) {
        return {
            success: false,
            data: {
                completedInvoices: 0,
                remainingInvoices: 0,
                totalCategories: 0
            },
            message: error instanceof Error
                ? error.message
                : "فشل جلب الإحصائيات"
        }
    }
}