
import {
    createHash,
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual
} from "node:crypto"
import { promisify } from "node:util"
import { getDatabase } from "../database/database.js"
import * as tokenStore from "../security/tokenStore.js"

const scrypt = promisify(scryptCallback)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

type AdminRecord = {
    id: string
    name: string
    email: string
    password_hash: string
    password_salt: string
    role: string
}

type SessionRecord = {
    id: string
    name: string
    email: string
    role: string
    expires_at: number
}

function initializeAuthTables() {
    const db = getDatabase()

    db.exec(`
        CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Admin',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS auth_sessions (
            id TEXT PRIMARY KEY,
            admin_id TEXT NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash
        ON auth_sessions(token_hash);

        CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at
        ON auth_sessions(expires_at);
    `)

    db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(Date.now())
}

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
}

async function hashPassword(password: string, salt: string): Promise<string> {
    const derivedKey = await scrypt(password, salt, 64) as Buffer
    return derivedKey.toString("hex")
}

async function verifyPassword(
    password: string,
    salt: string,
    storedHash: string
): Promise<boolean> {
    const candidateHash = await hashPassword(password, salt)
    const candidate = Buffer.from(candidateHash, "hex")
    const stored = Buffer.from(storedHash, "hex")

    if (candidate.length !== stored.length) return false

    return timingSafeEqual(candidate, stored)
}

export function isSetupRequired(): boolean {
    initializeAuthTables()

    const result = getDatabase()
        .prepare("SELECT COUNT(*) AS count FROM admins")
        .get() as { count: number }

    return result.count === 0
}

export async function setupSuperAdmin(
    name: string,
    email: string,
    password: string
): Promise<{ success: true } | { success: false; message: string }> {
    initializeAuthTables()

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName || !normalizedEmail || !password) {
        return { success: false, message: "جميع الحقول مطلوبة" }
    }

    if (password.length < 8) {
        return { success: false, message: "كلمة المرور يجب ألا تقل عن 8 أحرف" }
    }

    const db = getDatabase()
    const salt = randomBytes(32).toString("hex")
    const passwordHash = await hashPassword(password, salt)
    const id = randomBytes(16).toString("hex")
    const now = new Date().toISOString()

    try {
        db.exec("BEGIN IMMEDIATE")

        const existing = db.prepare(
            "SELECT COUNT(*) AS count FROM admins"
        ).get() as { count: number }

        if (existing.count > 0) {
            db.exec("ROLLBACK")
            return { success: false, message: "تم إنشاء حساب المدير الرئيسي بالفعل" }
        }

        db.prepare(`
            INSERT INTO admins (
                id, name, email, password_hash, password_salt,
                role, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            normalizedName,
            normalizedEmail,
            passwordHash,
            salt,
            "Super Admin",
            now,
            now
        )

        db.exec("COMMIT")

        return { success: true }
    } catch (error) {
        try {
            db.exec("ROLLBACK")
        } catch {}

        if (error instanceof Error && error.message.includes("UNIQUE")) {
            return { success: false, message: "البريد الإلكتروني مستخدم بالفعل" }
        }

        throw error
    }
}

export async function login(
    email: string,
    password: string
): Promise<LoginResult> {
    initializeAuthTables()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
        return { success: false, message: "من فضلك أدخل البريد الإلكتروني وكلمة المرور" }
    }

    const admin = getDatabase().prepare(`
        SELECT id, name, email, password_hash, password_salt, role
        FROM admins
        WHERE email = ?
    `).get(normalizedEmail) as AdminRecord | undefined

    if (!admin) {
        return { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    const validPassword = await verifyPassword(
        password,
        admin.password_salt,
        admin.password_hash
    )

    if (!validPassword) {
        return { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }
    }

    const token = randomBytes(32).toString("hex")
    const tokenHash = hashToken(token)
    const expiresAt = Date.now() + SESSION_DURATION
    const sessionId = randomBytes(16).toString("hex")

    getDatabase().prepare(`
        INSERT INTO auth_sessions (
            id, admin_id, token_hash, expires_at, created_at
        )
        VALUES (?, ?, ?, ?, ?)
    `).run(
        sessionId,
        admin.id,
        tokenHash,
        expiresAt,
        new Date().toISOString()
    )

    try {
        await tokenStore.saveToken(token)
    } catch {
        getDatabase().prepare(
            "DELETE FROM auth_sessions WHERE id = ?"
        ).run(sessionId)

        return { success: false, message: "تعذر حفظ جلسة تسجيل الدخول على هذا الجهاز" }
    }

    return {
        success: true,
        user: {
            name: admin.name,
            role: admin.role
        }
    }
}

export async function getSession(): Promise<{
    token: string
    user: { name: string; role: string }
} | null> {
    initializeAuthTables()

    const token = await tokenStore.getToken()

    if (!token) return null

    const session = getDatabase().prepare(`
        SELECT
            admins.id,
            admins.name,
            admins.email,
            admins.role,
            auth_sessions.expires_at
        FROM auth_sessions
        INNER JOIN admins ON admins.id = auth_sessions.admin_id
        WHERE auth_sessions.token_hash = ?
    `).get(hashToken(token)) as SessionRecord | undefined

    if (!session || session.expires_at <= Date.now()) {
        getDatabase().prepare(
            "DELETE FROM auth_sessions WHERE token_hash = ?"
        ).run(hashToken(token))

        await tokenStore.removeToken()
        return null
    }

    return {
        token,
        user: {
            name: session.name,
            role: session.role
        }
    }
}

export async function getToken(): Promise<string | null> {
    const session = await getSession()
    return session?.token ?? null
}

export async function getCurrentUser(): Promise<{
    name: string
    role: string
} | null> {
    const session = await getSession()
    return session?.user ?? null
}

export async function logout(): Promise<void> {
    initializeAuthTables()

    const token = await tokenStore.getToken()

    if (token) {
        getDatabase().prepare(
            "DELETE FROM auth_sessions WHERE token_hash = ?"
        ).run(hashToken(token))
    }

    await tokenStore.removeToken()
}
