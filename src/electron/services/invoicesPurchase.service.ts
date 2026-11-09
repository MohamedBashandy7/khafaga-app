import { getDatabase } from "../database/database.js"

type InvoicePurchaseLine = {
    categoryCode: string
    quantity: number | null
    price: number
}

type InvoicePurchaseStatus = "" | "depleted" | "remaining"
type InvoicePurchaseSortOrder = "newest" | "oldest"

type InvoicePurchaseData = {
    id: string
    invoiceNo: string
    invoiceDate: string
    items: {
        categoryCode: string
        categoryName: string
        quantity: number | null
        price: number
        total: number | null
    }[]
    total: number | null
    isDepleted: boolean
}

type PurchaseItemStock = {
    id: number
    remaining_quantity: number | null
    is_closed: number
}

function migratePurchaseInvoiceItems() {
    const db = getDatabase()

    const columns = db.prepare(`
        PRAGMA table_info(purchase_invoice_items)
    `).all() as {
        name: string
        notnull: number
    }[]

    if (!columns.length) return

    const hasColumn = (name: string) =>
        columns.some(column => column.name === name)

    const quantityColumn = columns.find(column => column.name === "quantity")
    const totalColumn = columns.find(column => column.name === "total")

    if (
        quantityColumn &&
        totalColumn &&
        (quantityColumn.notnull !== 0 || totalColumn.notnull !== 0)
    ) {
        const indexes = db.prepare(`
            SELECT sql
            FROM sqlite_master
            WHERE type = 'index'
            AND tbl_name = 'purchase_invoice_items'
            AND sql IS NOT NULL
        `).all() as { sql: string }[]

        const remainingExpression = hasColumn("remaining_quantity")
            ? "remaining_quantity"
            : "quantity"

        const closedExpression = hasColumn("is_closed")
            ? "is_closed"
            : "0"

        db.exec("PRAGMA foreign_keys = OFF")

        try {
            db.exec("BEGIN")

            db.exec(`
                CREATE TABLE purchase_invoice_items_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    invoice_id INTEGER NOT NULL,
                    category_code TEXT NOT NULL,
                    quantity REAL,
                    price REAL NOT NULL,
                    total REAL,
                    remaining_quantity REAL,
                    is_closed INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY (invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_code) REFERENCES categories(code)
                );

                INSERT INTO purchase_invoice_items_new (
                    id,
                    invoice_id,
                    category_code,
                    quantity,
                    price,
                    total,
                    remaining_quantity,
                    is_closed
                )
                SELECT
                    id,
                    invoice_id,
                    category_code,
                    quantity,
                    price,
                    total,
                    ${remainingExpression},
                    ${closedExpression}
                FROM purchase_invoice_items;

                DROP TABLE purchase_invoice_items;

                ALTER TABLE purchase_invoice_items_new
                RENAME TO purchase_invoice_items;
            `)

            for (const index of indexes) {
                db.exec(index.sql)
            }

            db.exec("COMMIT")
        } catch (error) {
            db.exec("ROLLBACK")
            throw error
        } finally {
            db.exec("PRAGMA foreign_keys = ON")
        }
    }

    const updatedColumns = db.prepare(`
        PRAGMA table_info(purchase_invoice_items)
    `).all() as { name: string }[]

    const updatedHasColumn = (name: string) =>
        updatedColumns.some(column => column.name === name)

    if (!updatedHasColumn("remaining_quantity")) {
        db.exec(`
            ALTER TABLE purchase_invoice_items
            ADD COLUMN remaining_quantity REAL
        `)
    }

    if (!updatedHasColumn("is_closed")) {
        db.exec(`
            ALTER TABLE purchase_invoice_items
            ADD COLUMN is_closed INTEGER NOT NULL DEFAULT 0
        `)
    }

    db.exec(`
        UPDATE purchase_invoice_items
        SET remaining_quantity = quantity
        WHERE remaining_quantity IS NULL
        AND quantity IS NOT NULL
    `)
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
            quantity REAL,
            price REAL NOT NULL,
            total REAL,
            remaining_quantity REAL,
            is_closed INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (invoice_id) REFERENCES purchase_invoices(id) ON DELETE CASCADE,
            FOREIGN KEY (category_code) REFERENCES categories(code)
        );
    `)

    migratePurchaseInvoiceItems()
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

        if (
            item.quantity !== null &&
            (!Number.isFinite(item.quantity) || item.quantity <= 0)
        ) {
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
            items.total,
            items.remaining_quantity,
            items.is_closed
        FROM purchase_invoice_items AS items
        JOIN categories ON categories.code = items.category_code
        WHERE items.invoice_id = ?
        ORDER BY items.id
    `).all(id) as {
        category_code: string
        category_name: string
        quantity: number | null
        price: number
        total: number | null
        remaining_quantity: number | null
        is_closed: number
    }[]

    const hasUnknownQuantity = items.some(item => item.quantity === null)

const isDepleted =
    items.length > 0 &&
    items.every(item =>
        item.is_closed === 1 ||
        item.remaining_quantity === 0
    )

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
        total: hasUnknownQuantity
            ? null
            : items.reduce((sum, item) => sum + (item.total ?? 0), 0),
        isDepleted
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
            total,
            remaining_quantity,
            is_closed
        )
        VALUES (?, ?, ?, ?, ?, ?, 0)
    `)

    for (const item of items) {
        statement.run(
            invoiceId,
            item.categoryCode.trim(),
            item.quantity,
            item.price,
            item.quantity === null ? null : item.quantity * item.price,
            item.quantity
        )
    }
}

export async function deductPurchaseInvoiceCategory(
    invoiceId: string,
    categoryCode: string,
    amount: number
): Promise<{
    success: boolean
    message: string
    remainingQuantity?: number
}> {
    try {
        ensureInvoicesPurchaseTables()

        const parsedInvoiceId = Number(invoiceId)
        const safeCategoryCode = String(categoryCode ?? "").trim()

        if (!Number.isInteger(parsedInvoiceId) || parsedInvoiceId <= 0) {
            return { success: false, message: "رقم الفاتورة غير صحيح" }
        }

        if (!safeCategoryCode) {
            return { success: false, message: "كود الصنف غير صحيح" }
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return {
                success: false,
                message: "كمية الخصم يجب أن تكون أكبر من صفر"
            }
        }

        const db = getDatabase()

        db.exec("BEGIN IMMEDIATE")

        try {
            const items = db.prepare(`
                SELECT id, remaining_quantity, is_closed
                FROM purchase_invoice_items
                WHERE invoice_id = ?
                AND category_code = ?
                ORDER BY id ASC
            `).all(parsedInvoiceId, safeCategoryCode) as PurchaseItemStock[]

            if (!items.length) {
                db.exec("ROLLBACK")
                return {
                    success: false,
                    message: "الصنف غير موجود في هذه الفاتورة"
                }
            }

            const openItems = items.filter(item => item.is_closed === 0)

            if (!openItems.length) {
                db.exec("ROLLBACK")
                return {
                    success: false,
                    message: "هذا الصنف مغلق بالفعل"
                }
            }

            if (openItems.some(item => item.remaining_quantity === null)) {
                db.exec("ROLLBACK")
                return {
                    success: false,
                    message: "لا يمكن الخصم من صنف كميته غير معروفة"
                }
            }

            const totalRemaining = openItems.reduce(
                (sum, item) => sum + (item.remaining_quantity ?? 0),
                0
            )

            if (amount > totalRemaining) {
                db.exec("ROLLBACK")
                return {
                    success: false,
                    message: `الكمية المتبقية هي ${totalRemaining} فقط`
                }
            }

            let remainingToDeduct = amount

            const updateStatement = db.prepare(`
                UPDATE purchase_invoice_items
                SET remaining_quantity = ?, is_closed = ?
                WHERE id = ?
                AND is_closed = 0
            `)

            for (const item of openItems) {
                if (remainingToDeduct <= 0) break

                const currentQuantity = item.remaining_quantity ?? 0
                const deductedQuantity = Math.min(
                    currentQuantity,
                    remainingToDeduct
                )
                const newQuantity = currentQuantity - deductedQuantity

                updateStatement.run(
                    newQuantity,
                    newQuantity === 0 ? 1 : 0,
                    item.id
                )

                remainingToDeduct -= deductedQuantity
            }

            const updatedItems = db.prepare(`
                SELECT remaining_quantity, is_closed
                FROM purchase_invoice_items
                WHERE invoice_id = ?
                AND category_code = ?
            `).all(parsedInvoiceId, safeCategoryCode) as {
                remaining_quantity: number | null
                is_closed: number
            }[]

            const remainingQuantity = updatedItems.reduce(
                (sum, item) => sum + (item.remaining_quantity ?? 0),
                0
            )

            db.exec("COMMIT")

            return {
                success: true,
                message: remainingQuantity === 0
                    ? "تم الخصم وإغلاق الصنف"
                    : "تم خصم الكمية بنجاح",
                remainingQuantity
            }
        } catch (error) {
            db.exec("ROLLBACK")
            throw error
        }
    } catch {
        return {
            success: false,
            message: "فشل خصم الكمية"
        }
    }
}

export async function closePurchaseInvoiceCategory(
    invoiceId: string,
    categoryCode: string
): Promise<{
    success: boolean
    message: string
}> {
    try {
        ensureInvoicesPurchaseTables()

        const parsedInvoiceId = Number(invoiceId)
        const safeCategoryCode = String(categoryCode ?? "").trim()

        if (!Number.isInteger(parsedInvoiceId) || parsedInvoiceId <= 0) {
            return { success: false, message: "رقم الفاتورة غير صحيح" }
        }

        if (!safeCategoryCode) {
            return { success: false, message: "كود الصنف غير صحيح" }
        }

        const db = getDatabase()

        const result = db.prepare(`
            UPDATE purchase_invoice_items
            SET remaining_quantity = 0, is_closed = 1
            WHERE invoice_id = ?
            AND category_code = ?
            AND is_closed = 0
        `).run(parsedInvoiceId, safeCategoryCode)

        if (result.changes === 0) {
            return {
                success: false,
                message: "الصنف غير موجود أو مغلق بالفعل"
            }
        }

        return {
            success: true,
            message: "تم إنهاء الصنف وإغلاقه بنجاح"
        }
    } catch {
        return {
            success: false,
            message: "فشل إنهاء الصنف"
        }
    }
}

export async function getAllInvoicesPurchase(
    page = 1,
    limit = 10,
    invoiceNo = "",
    invoiceDate = "",
    status: InvoicePurchaseStatus = "",
    sortOrder: InvoicePurchaseSortOrder = "newest"
): Promise<InvoicesPurchaseResponse> {
    try {
        ensureInvoicesPurchaseTables()

        const db = getDatabase()
        const safePage = Math.max(1, Math.floor(Number(page) || 1))
        const safeLimit = Math.max(1, Math.floor(Number(limit) || 10))
        const safeInvoiceNo = String(invoiceNo ?? "").trim()
        const safeInvoiceDate = String(invoiceDate ?? "").trim()
        const safeStatus: InvoicePurchaseStatus =
            status === "depleted" || status === "remaining" ? status : ""
        const safeSortOrder =
            sortOrder === "oldest" ? "ASC" : "DESC"

        const conditions: string[] = []
        const params: (string | number)[] = []

        if (safeInvoiceNo) {
            conditions.push("invoice_no LIKE ?")
            params.push(`%${safeInvoiceNo}%`)
        }

        if (safeInvoiceDate) {
            conditions.push("invoice_date = ?")
            params.push(safeInvoiceDate)
        }

        if (safeStatus === "depleted") {
            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM purchase_invoice_items AS stock_items
                    WHERE stock_items.invoice_id = purchase_invoices.id
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM purchase_invoice_items AS stock_items
                    WHERE stock_items.invoice_id = purchase_invoices.id
                    AND stock_items.is_closed = 0
                    AND (
                        stock_items.remaining_quantity IS NULL
                        OR stock_items.remaining_quantity > 0
                    )
                )
            `)
        }

        if (safeStatus === "remaining") {
            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM purchase_invoice_items AS stock_items
                    WHERE stock_items.invoice_id = purchase_invoices.id
                    AND stock_items.is_closed = 0
                    AND (
                        stock_items.remaining_quantity IS NULL
                        OR stock_items.remaining_quantity > 0
                    )
                )
            `)
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : ""

        const countResult = db.prepare(`
            SELECT COUNT(*) AS total
            FROM purchase_invoices
            ${whereClause}
        `).get(...params) as { total: number }

        const total = countResult.total
        const totalPages = Math.ceil(total / safeLimit)
        const currentPage = Math.min(
            safePage,
            Math.max(totalPages, 1)
        )

        const offset = (currentPage - 1) * safeLimit

        const invoices = db.prepare(`
            SELECT id
            FROM purchase_invoices
            ${whereClause}
            ORDER BY invoice_date ${safeSortOrder}, id ${safeSortOrder}
            LIMIT ? OFFSET ?
        `).all(...params, safeLimit, offset) as { id: number }[]

        const data = invoices
            .map(invoice => getInvoiceData(invoice.id))
            .filter(
                (invoice): invoice is InvoicePurchaseData =>
                    invoice !== null
            )

        return {
            success: true,
            data: data as unknown as InvoicePurchase[],
            total,
            currentPage,
            totalPages
        }
    } catch (error) {
        console.error("GET ALL PURCHASE INVOICES ERROR:", error)

        return {
            success: false,
            data: [],
            total: 0,
            currentPage: 1,
            totalPages: 0,
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

        const hasStockActivity = db.prepare(`
            SELECT id
            FROM purchase_invoice_items
            WHERE invoice_id = ?
            AND (
                is_closed = 1
                OR (
                    quantity IS NOT NULL
                    AND remaining_quantity < quantity
                )
            )
            LIMIT 1
        `).get(invoiceId)

        if (hasStockActivity) {
            return {
                success: false,
                message: "لا يمكن تعديل الفاتورة بعد خصم كمية أو إنهاء أحد أصنافها"
            }
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