
/// <reference path="../types/types.d.ts" />

const electron = require("electron")

electron.contextBridge.exposeInMainWorld("electron", {
    auth: {
        isSetupRequired: () => ipcInvoke("auth:isSetupRequired"),
        setupSuperAdmin: (data: SetupAdminCredentials) =>
            ipcInvoke("auth:setupSuperAdmin", data),
        getToken: () => ipcInvoke("getToken"),
        getCurrentUser: () => ipcInvoke("auth:getCurrentUser"),
        login: (credentials: LoginCredentials) => ipcInvoke("login", credentials),
        logout: () => ipcInvoke("logout")
    },

    theme: {
        get: () => ipcInvoke("theme:get"),
        set: (theme: ThemeSettings) => ipcInvoke("theme:set", theme)
    },

    categories: {
       getAllCategories: (
            page?: number,
            limit?: number,
            search?: string
        ) => ipcInvoke("categories:getAll", { page : page, limit : limit, search : search }),
        searchCategoriesStock: (search?: string) =>
            ipcInvoke("categories:searchStock", { search : search }),
        createCategory: (code: string, name: string) =>
            ipcInvoke("categories:create", { code, name }),
        deleteCategory: (code: string) =>
            ipcInvoke("categories:delete", code),
        updateCategory: (oldCode: string, newCode: string, name: string) =>
            ipcInvoke("categories:update", oldCode, newCode, name),
        getCategory: (code: string) =>
            ipcInvoke("categories:get", code)
    },

    products: {
        getAllProducts: (page?: number, limit?: number) =>
            ipcInvoke("products:getAll", { page, limit }),
        createProduct: (
            name: string,
            categoryId: string,
            wholesaleWholesalePrice: number,
            wholesalePrice: number,
            sellingPrice: number
        ) =>
            ipcInvoke(
                "products:create",
                name,
                categoryId,
                wholesaleWholesalePrice,
                wholesalePrice,
                sellingPrice
            ),
        deleteProduct: (id: string) =>
            ipcInvoke("products:delete", id),
        updateProduct: (
            id: string,
            name: string,
            categoryId: string,
            wholesaleWholesalePrice: number,
            wholesalePrice: number,
            sellingPrice: number
        ) =>
            ipcInvoke(
                "products:update",
                id,
                name,
                categoryId,
                wholesaleWholesalePrice,
                wholesalePrice,
                sellingPrice
            ),
        getProduct: (id: string) =>
            ipcInvoke("products:get", id)
    },

    expenses: {
        getAllExpenses: (page?: number, limit?: number) =>
            ipcInvoke("expenses:getAll", { page, limit }),
        createExpense: (name: string, amount: number) =>
            ipcInvoke("expenses:create", name, amount),
        deleteExpense: (expenseId: string) =>
            ipcInvoke("expenses:delete", expenseId),
        updateExpense: (expenseId: string, name: string, amount: number) =>
            ipcInvoke("expenses:update", expenseId, name, amount),
        getExpense: (expenseId: string) =>
            ipcInvoke("expenses:get", expenseId)
    },

    employees: {
        getAllEmployees: (page?: number, limit?: number) =>
            ipcInvoke("employees:getAll", { page, limit }),
        createEmployee: (
            name: string,
            salary: number,
            shiftStart: string,
            shiftEnd: string
        ) =>
            ipcInvoke("employees:create", name, salary, shiftStart, shiftEnd),
        deleteEmployee: (employeeId: string) =>
            ipcInvoke("employees:delete", employeeId),
        updateEmployee: (
            employeeId: string,
            name: string,
            salary: number,
            shiftStart: string,
            shiftEnd: string
        ) =>
            ipcInvoke(
                "employees:update",
                employeeId,
                name,
                salary,
                shiftStart,
                shiftEnd
            ),
        getEmployee: (employeeId: string) =>
            ipcInvoke("employees:get", employeeId)
    },

    attendance: {
        getActive: (date: string) =>
            ipcInvoke("attendance:getActive", date),
        getReport: (month: number, year: number) =>
            ipcInvoke("attendance:getReport", month, year),
        mark: (
            employeeId: string,
            date: string,
            action: "in" | "out",
            time: string
        ) =>
            ipcInvoke("attendance:mark", employeeId, date, action, time)
    },

    suppliers: {
        getAllSuppliers: (page?: number, limit?: number) =>
            ipcInvoke("suppliers:getAll", { page, limit }),
        createSupplier: (
            name: string,
            phone: string,
            governorate: string,
            address: string
        ) =>
            ipcInvoke("suppliers:create", name, phone, governorate, address),
        deleteSupplier: (id: string) =>
            ipcInvoke("suppliers:delete", id),
        updateSupplier: (
            id: string,
            name: string,
            phone: string,
            governorate: string,
            address: string
        ) =>
            ipcInvoke(
                "suppliers:update",
                id,
                name,
                phone,
                governorate,
                address
            ),
        getSupplier: (id: string) =>
            ipcInvoke("suppliers:get", id)
    },

    governorates: {
        getAll: () =>
            ipcInvoke("governorates:getAll")
    },

    invoicesPurchase: {
        getAll: (
            page?: number,
            limit?: number,
            invoiceNo?: string,
            invoiceDate?: string
        ) =>
            ipcInvoke("invoicesPurchase:getAll", 
               { page : page,
                limit : limit,
                invoiceNo : invoiceNo,
                invoiceDate : invoiceDate}
            ),
        get: (id: string) =>
            ipcInvoke("invoicesPurchase:get", id),
        create: (
            invoiceNo: string,
            invoiceDate: string,
            items: InvoicePurchaseSubmitItem[]
        ) =>
            ipcInvoke(
                "invoicesPurchase:create",
                invoiceNo,
                invoiceDate,
                items
            ),
        update: (
            id: string,
            invoiceNo: string,
            invoiceDate: string,
            items: InvoicePurchaseSubmitItem[]
        ) =>
            ipcInvoke(
                "invoicesPurchase:update",
                id,
                invoiceNo,
                invoiceDate,
                items
            ),
            deduct: (
                invoiceId: string,
                categoryCode: string,
                amount: number
            ) =>
                ipcInvoke(
                    "invoicesPurchase:deduct",
                    invoiceId,
                    categoryCode,
                    amount
                ),

            closeCategory: (
                invoiceId: string,
                categoryCode: string
            ) =>
                ipcInvoke(
                    "invoicesPurchase:closeCategory",
                    invoiceId,
                    categoryCode
            ),
        delete: (id: string) =>
            ipcInvoke("invoicesPurchase:delete", id)
    }
} satisfies Window["electron"])

function ipcInvoke<Key extends keyof EventPayloadMapping>(
    channel: Key,
    ...args: any[]
): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(channel, ...args)
}
