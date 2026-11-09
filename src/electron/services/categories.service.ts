
import { getDatabase } from "../database/database.js"

type CategoryData = {
    code: string
    name: string
}

type ValidationResult =
    | {
          valid: true
          code: string
          name: string
      }
    | {
          valid: false
          message: string
      }

type StockInvoice = {
    invoiceId: number
    invoiceNo: string
    invoiceDate: string
    quantity: number | null
    remainingQuantity: number | null
    isClosed: number
    hasUnknownQuantity: number
}

type StockCategory = {
    code: string
    name: string
    invoiceCount: number
    availableQuantity: number
    unknownQuantityInvoices: number
    invoices: StockInvoice[]
}

function ensureCategoriesTable() {
    const database = getDatabase()

    database.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    `)

    return database
}

function validateCategory(code: string, name: string): ValidationResult {
    const normalizedCode = String(code ?? "").trim()
    const normalizedName = String(name ?? "").trim()

    if (!/^[0-9]{8,12}$/.test(normalizedCode)) {
        return {
            valid: false,
            message: "كود التصنيف يجب أن يكون من 8 إلى 12 رقمًا"
        }
    }

    if (!normalizedName) {
        return {
            valid: false,
            message: "اسم التصنيف مطلوب"
        }
    }

    return {
        valid: true,
        code: normalizedCode,
        name: normalizedName
    }
}

export async function getAllCategories(
    page = 1,
    limit = 10,
    searchTerm = ""
): Promise<CategoriesResponse> {
    try {
        const database = ensureCategoriesTable()
        const safePage = Math.max(1, Math.floor(Number(page) || 1))
        const safeLimit = Math.max(1, Math.floor(Number(limit) || 10))
        const search = String(searchTerm ?? "").trim()
        const searchPattern = `%${search}%`

        const whereClause = search
            ? "WHERE code LIKE ? OR name LIKE ?"
            : ""

        const searchParams = search
            ? [searchPattern, searchPattern]
            : []

        const countSQL = `
            SELECT COUNT(*) as total
            FROM categories
            ${whereClause}
        `

        const countStatement = database.prepare(countSQL)
        const totalResult = countStatement.get(...searchParams) as {
            total: number
        }

        const total = totalResult.total
        const totalPages = Math.ceil(total / safeLimit)
        const currentPage = Math.min(safePage, Math.max(totalPages, 1))
        const offset = (currentPage - 1) * safeLimit

        const categoriesSQL = `
            SELECT code, name
            FROM categories
            ${whereClause}
            ORDER BY code ASC
            LIMIT ? OFFSET ?
        `

        const queryParams = [...searchParams, safeLimit, offset]
        const categoriesStatement = database.prepare(categoriesSQL)
        const categories = categoriesStatement.all(...queryParams) as CategoryData[]

        return {
            success: true,
            data: categories,
            total,
            currentPage,
            totalPages
        }
    } catch (error) {
        return {
            success: false,
            data: [],
            total: 0,
            currentPage: 1,
            totalPages: 0,
            message: error instanceof Error
                ? error.message
                : "فشل جلب التصنيفات"
        }
    }
}

export async function searchCategoriesStock(
    searchTerm = ""
): Promise<{
    success: boolean
    data: StockCategory[]
    message?: string
}> {
    try {
        const database = ensureCategoriesTable()
        const search = String(searchTerm ?? "").trim()

        if (!search) {
            return {
                success: true,
                data: []
            }
        }

const categories = database.prepare(`
    SELECT
        c.code,
        c.name,
        COUNT(s.invoice_id) AS invoiceCount,
        COALESCE(SUM(s.availableQuantity), 0) AS availableQuantity,
        COALESCE(SUM(s.hasUnknownQuantity), 0) AS unknownQuantityInvoices
    FROM categories c
    INNER JOIN (
        SELECT
            invoice_id,
            category_code,
            SUM(
                CASE
                    WHEN is_closed = 0
                    THEN COALESCE(remaining_quantity, 0)
                    ELSE 0
                END
            ) AS availableQuantity,
            MAX(
                CASE
                    WHEN is_closed = 0 AND remaining_quantity IS NULL
                    THEN 1
                    ELSE 0
                END
            ) AS hasUnknownQuantity
        FROM purchase_invoice_items
        GROUP BY invoice_id, category_code
        HAVING MIN(is_closed) = 0
    ) s ON s.category_code = c.code
    WHERE c.code LIKE ? OR c.name LIKE ?
    GROUP BY c.code, c.name
    ORDER BY c.name ASC
`).all(`%${search}%`, `%${search}%`) as {
    code: string
    name: string
    invoiceCount: number
    availableQuantity: number
    unknownQuantityInvoices: number
}[]

const invoicesStatement = database.prepare(`
    SELECT
        pi.id AS invoiceId,
        pi.invoice_no AS invoiceNo,
        pi.invoice_date AS invoiceDate,
        SUM(pii.quantity) AS quantity,
        CASE
            WHEN MAX(
                CASE
                    WHEN pii.is_closed = 0
                        AND pii.remaining_quantity IS NULL
                    THEN 1
                    ELSE 0
                END
            ) = 1
            THEN NULL
            ELSE COALESCE(
                SUM(
                    CASE
                        WHEN pii.is_closed = 0
                        THEN COALESCE(pii.remaining_quantity, 0)
                        ELSE 0
                    END
                ),
                0
            )
        END AS remainingQuantity,
        MIN(pii.is_closed) AS isClosed,
        MAX(
            CASE
                WHEN pii.is_closed = 0
                    AND pii.remaining_quantity IS NULL
                THEN 1
                ELSE 0
            END
        ) AS hasUnknownQuantity
    FROM purchase_invoice_items pii
    INNER JOIN purchase_invoices pi
        ON pi.id = pii.invoice_id
    WHERE pii.category_code = ?
    GROUP BY pi.id, pi.invoice_no, pi.invoice_date
    HAVING MIN(pii.is_closed) = 0
    ORDER BY pi.invoice_date ASC, pi.invoice_no ASC, pi.id ASC
`)
        const data: StockCategory[] = categories.map(category => ({
            ...category,
            invoices: invoicesStatement.all(category.code) as unknown as StockInvoice[]
        }))

        return {
            success: true,
            data
        }
    } catch (error) {
        return {
            success: false,
            data: [],
            message: error instanceof Error
                ? error.message
                : "فشل البحث عن الصنف"
        }
    }
}

export async function createCategory(
    code: string,
    name: string
): Promise<CreateCategoryResponse> {
    try {
        const validation = validateCategory(code, name)

        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            }
        }

        const database = ensureCategoriesTable()

        database.prepare(`
            INSERT INTO categories (code, name)
            VALUES (?, ?)
        `).run(validation.code, validation.name)

        return {
            success: true,
            data: {
                code: validation.code,
                name: validation.name
            },
            message: "تم إنشاء التصنيف بنجاح"
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : ""

        return {
            success: false,
            message: message.includes("UNIQUE constraint failed")
                ? "كود التصنيف مستخدم بالفعل"
                : "فشل إنشاء التصنيف"
        }
    }
}

export async function deleteCategory(
    code: string
): Promise<DeleteCategoryResponse> {
    try {
        const database = ensureCategoriesTable()

        const result = database.prepare(`
            DELETE FROM categories
            WHERE code = ?
        `).run(String(code).trim())

        if (!result.changes) {
            return {
                success: false,
                message: "التصنيف غير موجود"
            }
        }

        return {
            success: true,
            message: "تم حذف التصنيف بنجاح",
            data: code
        }
    } catch {
        return {
            success: false,
            message: "فشل حذف التصنيف"
        }
    }
}

export async function updateCategory(
    oldCode: string,
    newCode: string,
    name: string
): Promise<UpdateCategoryResponse> {
    try {
        const validation = validateCategory(newCode, name)

        if (!validation.valid) {
            return {
                success: false,
                message: validation.message
            }
        }

        const database = ensureCategoriesTable()

        const result = database.prepare(`
            UPDATE categories
            SET code = ?, name = ?
            WHERE code = ?
        `).run(validation.code, validation.name, String(oldCode).trim())

        if (!result.changes) {
            return {
                success: false,
                message: "التصنيف غير موجود"
            }
        }

        return {
            success: true,
            data: {
                code: validation.code,
                name: validation.name
            },
            message: "تم تحديث التصنيف بنجاح"
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : ""

        return {
            success: false,
            message: message.includes("UNIQUE constraint failed")
                ? "كود التصنيف مستخدم بالفعل"
                : "فشل تحديث التصنيف"
        }
    }
}

export async function getCategory(
    code: string
): Promise<GetCategoryResponse> {
    try {
        const database = ensureCategoriesTable()

        const category = database.prepare(`
            SELECT code, name
            FROM categories
            WHERE code = ?
        `).get(String(code).trim()) as CategoryData | undefined

        if (!category) {
            return {
                success: false,
                message: "التصنيف غير موجود"
            }
        }

        return {
            success: true,
            data: category
        }
    } catch {
        return {
            success: false,
            message: "فشل الحصول على التصنيف"
        }
    }
}
