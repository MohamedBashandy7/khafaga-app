import { safeStorage } from "electron"
import { store } from "../store.js"

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

type StoredAuth = {
    token: string
    expiresAt: number
}

export async function getToken(): Promise<string | null> {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const raw = store.get("auth")
    if (!raw) return null

    if (!safeStorage.isEncryptionAvailable()) {
        store.delete("auth")
        return null
    }

    try {
        const decrypted = safeStorage.decryptString(Buffer.from(raw, "base64"))
        const parsed: StoredAuth = JSON.parse(decrypted)

        if (Date.now() > parsed.expiresAt) {
            store.delete("auth")
            return null
        }

        return parsed.token
    } catch {
        store.delete("auth")
        return null
    }
}

export async function saveToken(token: string): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error("Encryption is not available on this device")
    }

    const payload: StoredAuth = {
        token,
        expiresAt: Date.now() + SEVEN_DAYS_MS
    }

    const encrypted = safeStorage.encryptString(JSON.stringify(payload))
    store.set("auth", encrypted.toString("base64"))
}

export async function removeToken(): Promise<void> {
    store.delete("auth")
}
