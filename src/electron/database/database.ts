import { app } from "electron"
import { DatabaseSync } from "node:sqlite"
import {
    existsSync,
    mkdirSync,
    readFileSync
} from "node:fs"
import { isAbsolute, join } from "node:path"

let database: DatabaseSync | null = null

function getDatabaseDirectory(): string {
    if (!app.isPackaged) {
        return app.getPath("userData")
    }

    const locationFile = join(
        app.getPath("appData"),
        "Fresh Invoices",
        "database-location.txt"
    )

    if (!existsSync(locationFile)) {
        throw new Error(
            "Database location configuration was not found. Please reinstall the application."
        )
    }

    const selectedDirectory = readFileSync(
        locationFile,
        "utf-8"
    ).trim()

    if (!selectedDirectory || !isAbsolute(selectedDirectory)) {
        throw new Error("The selected database directory is invalid.")
    }

    mkdirSync(selectedDirectory, { recursive: true })

    return selectedDirectory
}

export function initializeDatabase(): DatabaseSync {
    if (database) return database

    const databasePath = join(
        getDatabaseDirectory(),
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