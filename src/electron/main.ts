import {
    app,
    BrowserWindow,
    dialog,
    Menu
} from "electron"
import { ipcHandle, isDev } from "./utils.js"
import { getStaticData, pollResources } from "./resourceManager.js"
import { getPreloadPath, getUIPath } from "./pathResolver.js"
import { registerAuthIPC } from "./ipc/auth.ipc.js"
import { registerStatsIPC } from "./ipc/stats.ipc.js"
import { registerStoreIPC } from "./ipc/store.ipc.js"
import { registerCategoriesIPC } from "./ipc/categories.ipc.js"
import { registerProductsIPC } from "./ipc/products.ipc.js"
import { registerExpensesIPC } from "./ipc/expenses.ipc.js"
import { registerEmployeesIPC } from "./ipc/employees.ipc.js"
import { registerAttendanceIPC } from "./ipc/attendance.ipc.js"
import { registerSuppliersIPC } from "./ipc/suppliers.ipc.js"
import { registerGovernoratesIPC } from "./ipc/governorates.ipc.js"
import { registerInvoicesPurchaseIPC } from "./ipc/invoicesPurchase.ipc.js"
import {
    initializeDatabase,
    closeDatabase
} from "./database/database.js"

app.setName("Fresh Invoices")

app.on("before-quit", closeDatabase)

app.whenReady().then(() => {
    try {
        initializeDatabase()
    } catch (error) {
        dialog.showErrorBox(
            "Database Initialization Error",
            error instanceof Error ? error.message : String(error)
        )
        app.quit()
        return
    }

    registerAuthIPC()
    registerStoreIPC()
    registerCategoriesIPC()
    registerProductsIPC()
    registerExpensesIPC()
    registerEmployeesIPC()
    registerAttendanceIPC()
    registerSuppliersIPC()
    registerGovernoratesIPC()
    registerInvoicesPurchaseIPC()
    registerStatsIPC()

    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"

    if (!isDev()) {
        Menu.setApplicationMenu(null)
    }

    const win = new BrowserWindow({
        title: "Fresh Invoices",
        autoHideMenuBar: !isDev(),
        webPreferences: {
            sandbox: true,
            preload: getPreloadPath()
        }
    })

    if (!isDev()) {
        win.removeMenu()
    }

    win.maximize()

    if (isDev()) {
        win.loadURL("http://localhost:5123")
    } else {
        win.loadFile(getUIPath())
    }

    pollResources(win)

    ipcHandle("getStatisticsData", async () => {
        return await getStaticData()
    })
})