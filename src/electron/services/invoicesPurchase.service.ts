
import { getDatabase } from "../database/database.js"

type InvoicePurchaseLine = {
    categoryCode: string
    quantity: number
    price: number
}

type InvoicePurchaseData = {
    id: string
    invoiceNo: string
    invoiceDate: string
    items: {
        categoryCode: string
        categoryName: string
        quantity: number
        price: number
        total: number
    }[]
    total: number
}

function ensureInvoicesPurchaseTables() {
    const db = getDatabase()

    db.exec(`
        CREATE TABLE IF NOT EXISTS purchase_invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_no TEXT NOT NULL UNIQUE,
            invoice_date TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS purchase_invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            category_code TEXT NOT NULL,
            quantity REAL NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
            FOREIGN KEY (category_code) REFERENCES categories(code)
        );
    `)
}

function validateInvoice(
    invoiceNo: string,
    invoiceDate: string,
    items: InvoicePurchaseLine[]
): string | null {
    if (!invoiceNo?.trim()) {
        return "رقم الفاتورة مطلوب"
    }

    if (!invoiceDate?.trim()) {
        return "تاريخ الفاتورة مطلوب"
    }

    if (!Array.isArray(items) || items.length === 0) {
        return "يجب إضافة تصنيف واحد على الأقل"
    }

    for (const item of items) {
        if (!item.categoryCode?.trim()) {
            return "يجب اختيار تصنيف لكل سطر"
        }

        if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
            return "الكمية يجب أن تكون أكبر من صفر"
        }

        if (!Number.isFinite(item.price) || item.price < 0) {
            return "السعر غير صحيح"
        }
    }

    return null
}

function getInvoiceData(id: number): InvoicePurchaseData | null {
    const db = getDatabase()

    const invoice = db.prepare(`
        SELECT id, invoice_no, invoice_date
        FROM purchase_invoices
        WHERE id = ?
    `).get(id) as {
        id: number
        invoice_no: string
        invoice_date: string
    } | undefined

    if (!invoice) return null

    const items = db.prepare(`
        SELECT
            items.category_code,
            categories.name AS category_name,
            items.quantity,
            items.price,
            items.total
        FROM purchase_invoice_items AS items
        JOIN categories ON categories.code = items.category_code
        WHERE items.invoice_id = ?
        ORDER BY items.id
    `).all(id) as {
        category_code: string
        category_name: string
        quantity: number
        price: number
        total: number
    }[]

    return {
        id: String(invoice.id),
        invoiceNo: invoice.invoice_no,
        invoiceDate: invoice.invoice_date,
        items: items.map(item => ({
            categoryCode: item.category_code,
            categoryName: item.category_name,
            quantity: item.quantity,
            price: item.price,
            total: item.total
        })),
        total: items.reduce((sum, item) => sum + item.total, 0)
    }
}

function insertInvoiceItems(
    invoiceId: number,
    items: InvoicePurchaseLine[]
) {
    const db = getDatabase()

    const statement = db.prepare(`
        INSERT INTO purchase_invoice_items (
            invoice_id,
            category_code,
            quantity,
            price,
            total
        )
        VALUES (?, ?, ?, ?, ?)
    `)

    for (const item of items) {
        statement.run(
            invoiceId,
            item.categoryCode.trim(),
            item.quantity,
            item.price,
            item.quantity * item.price
        )
    }
}

export async function getAllInvoicesPurchase(
    page = 1,
    limit = 10
): Promise<InvoicesPurchaseResponse> {
    try {
        ensureInvoicesPurchaseTables()

        const db = getDatabase()
        const safePage = Math.max(1, Math.floor(page))
        const safeLimit = Math.max(1, Math.floor(limit))
        const offset = (safePage - 1) * safeLimit

        const invoices = db.prepare(`
            SELECT id
            FROM purchase_invoices
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `).all(safeLimit, offset) as { id: number }[]

        const data = invoices
            .map(invoice => getInvoiceData(invoice.id))
            .filter((invoice): invoice is InvoicePurchaseData => invoice !== null)

        return {
            success: true,
            data: data as unknown as InvoicePurchase[]
        }
    } catch {
        return {
            success: false,
            data: [],
            message: "فشل جلب الفواتير من قاعدة البيانات"
        }
    }
}

export async function getInvoicePurchase(
    id: string
): Promise<GetInvoicePurchaseResponse> {
    try {
        ensureInvoicesPurchaseTables()

        const invoiceId = Number(id)

        if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
            return { success: false, message: "رقم الفاتورة غير صحيح" }
        }

        const invoice = getInvoiceData(invoiceId)

        if (!invoice) {
            return { success: false, message: "الفاتورة غير موجودة" }
        }

        return {
            success: true,
            data: invoice as unknown as InvoicePurchase
        }
    } catch {
        return {
            success: false,
            message: "فشل جلب الفاتورة من قاعدة البيانات"
        }
    }
}

export async function createInvoicePurchase(
    invoiceNo: string,
    invoiceDate: string,
    items: InvoicePurchaseLine[]
): Promise<CreateInvoicePurchaseResponse> {
    try {
        ensureInvoicesPurchaseTables()

        const validationError = validateInvoice(invoiceNo, invoiceDate, items)

        if (validationError) {
            return { success: false, message: validationError }
        }

        const db = getDatabase()

        db.exec("BEGIN")

        try {
            const result = db.prepare(`
                INSERT INTO purchase_invoices (invoice_no, invoice_date)
                VALUES (?, ?)
            `).run(invoiceNo.trim(), invoiceDate.trim())

            const invoiceId = Number(result.lastInsertRowid)

            insertInvoiceItems(invoiceId, items)

            db.exec("COMMIT")

            const invoice = getInvoiceData(invoiceId)

            return {
                success: true,
                data: invoice as unknown as InvoicePurchase
            }
        } catch (error) {
            db.exec("ROLLBACK")
            throw error
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : ""

        if (message.includes("UNIQUE constraint failed")) {
            return { success: false, message: "رقم الفاتورة مستخدم بالفعل" }
        }

        if (message.includes("FOREIGN KEY constraint failed")) {
            return { success: false, message: "التصنيف المحدد غير موجود" }
        }

        return {
            success: false,
            message: "فشل إنشاء الفاتورة"
        }
    }
}

export async function updateInvoicePurchase(
    id: string,
    invoiceNo: string,
    invoiceDate: string,
    items: InvoicePurchaseLine[]
): Promise<UpdateInvoicePurchaseResponse> {
    try {
        ensureInvoicesPurchaseTables()

        const validationError = validateInvoice(invoiceNo, invoiceDate, items)

        if (validationError) {
            return { success: false, message: validationError }
        }

        const invoiceId = Number(id)

        if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
            return { success: false, message: "رقم الفاتورة غير صحيح" }
        }

        const db = getDatabase()

        const existingInvoice = db.prepare(`
            SELECT id
            FROM purchase_invoices
            WHERE id = ?
        `).get(invoiceId)

        if (!existingInvoice) {
            return { success: false, message: "الفاتورة غير موجودة" }
        }

        db.exec("BEGIN")

        try {
            db.prepare(`
                UPDATE purchase_invoices
                SET invoice_no = ?, invoice_date = ?
                WHERE id = ?
            `).run(invoiceNo.trim(), invoiceDate.trim(), invoiceId)

            db.prepare(`
                DELETE FROM purchase_invoice_items
                WHERE invoice_id = ?
            `).run(invoiceId)

            insertInvoiceItems(invoiceId, items)

            db.exec("COMMIT")

            const invoice = getInvoiceData(invoiceId)

            return {
                success: true,
                data: invoice as unknown as InvoicePurchase
            }
        } catch (error) {
            db.exec("ROLLBACK")
            throw error
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : ""

        if (message.includes("UNIQUE constraint failed")) {
            return { success: false, message: "رقم الفاتورة مستخدم بالفعل" }
        }

        if (message.includes("FOREIGN KEY constraint failed")) {
            return { success: false, message: "التصنيف المحدد غير موجود" }
        }

        return {
            success: false,
            message: "فشل تحديث الفاتورة"
        }
    }
}

export async function deleteInvoicePurchase(
    id: string
): Promise<DeleteInvoicePurchaseResponse> {
    try {
        ensureInvoicesPurchaseTables()

        const invoiceId = Number(id)

        if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
            return { success: false, message: "رقم الفاتورة غير صحيح" }
        }

        const db = getDatabase()

        const result = db.prepare(`
            DELETE FROM purchase_invoices
            WHERE id = ?
        `).run(invoiceId)

        if (result.changes === 0) {
            return { success: false, message: "الفاتورة غير موجودة" }
        }

        return {
            success: true,
            message: "تم حذف الفاتورة بنجاح"
        }
    } catch {
        return {
            success: false,
            message: "فشل حذف الفاتورة"
        }
    }
}
