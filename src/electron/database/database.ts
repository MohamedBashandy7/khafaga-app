import { app } from "electron"
import { DatabaseSync } from "node:sqlite"
import { join } from "node:path"

let database: DatabaseSync | null = null

export function initializeDatabase(): DatabaseSync {
    if (database) return database

    const databasePath = join(
        app.getPath("userData"),
        "accounting.sqlite"
    )

    const connection = new DatabaseSync(databasePath)

    try {
        connection.exec("PRAGMA foreign_keys = ON")
        connection.exec("PRAGMA journal_mode = WAL")
        connection.exec("PRAGMA busy_timeout = 5000")

        const result = connection.prepare(
            "SELECT sqlite_version() AS version"
        ).get() as { version: string }

        database = connection

        console.log("SQLite connected successfully")
        console.log("SQLite version:", result.version)
        console.log("Database path:", databasePath)

        return connection
    } catch (error) {
        connection.close()
        throw error
    }
}

export function getDatabase(): DatabaseSync {
    if (!database) {
        throw new Error("Database has not been initialized")
    }

    return database
}

export function closeDatabase(): void {
    if (!database) return

    database.close()
    database = null
}