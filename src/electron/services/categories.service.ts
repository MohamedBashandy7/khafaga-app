
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
    limit = 10
): Promise<CategoriesResponse> {
    try {
        const database = ensureCategoriesTable()
        const safePage = Math.max(1, Math.floor(Number(page) || 1))
        const safeLimit = Math.max(1, Math.floor(Number(limit) || 10))
        const offset = (safePage - 1) * safeLimit

        const categories = database
            .prepare(`
                SELECT code, name
                FROM categories
                ORDER BY code ASC
                LIMIT ? OFFSET ?
            `)
            .all(safeLimit, offset) as CategoryData[]

        return {
            success: true,
            data: categories
        }
    } catch (error) {
        return {
            success: false,
            data: [],
            message: error instanceof Error ? error.message : "فشل جلب التصنيفات"
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
