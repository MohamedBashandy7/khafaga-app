type Stats = {
    cpuUsage: number
    RAMUsage: number
    storageData: {
        total: number
        free: number
        used: number
        freePercent: number
        usedPercent: number
    }
}

type StaticData = {
    totalStorage: number
    totalRAM: number
    totalCPU: number
    CPUModel: string
}

type ThemeSettings = {
    type: "image" | "gradient"
    value: string
}

type LoginCredentials = {
    email: string
    password: string
}

type SetupAdminCredentials = {
    name: string
    email: string
    password: string
}

type SetupAdminResult =
    | { success: true }
    | { success: false; message: string }

type CurrentAuthUser = {
    name: string
    role: string
}

type FieldError = {
    type: string
    value: string
    msg: string
    path: string
    location: string
}

type LoginResult =
    | { success: true; user: { name: string; role: string } }
    | { success: false; message: string; fieldErrors?: FieldError[] }

type Category = {
    code: string
    name: string
}

type CategoriesResponse = {
    success: boolean
    data: Category[]
    message?: string
}

type CreateCategoryResponse = {
    success: boolean
    data?: Category
    message?: string
    errors?: FieldError[]
}

type DeleteCategoryResponse = {
    success: boolean
    message?: string
    data?: string
}

type GetCategoryResponse = {
    success: boolean
    data?: Category
    message?: string
    errors?: FieldError[]
}

type UpdateCategoryResponse = {
    success: boolean
    data?: Category
    message?: string
    errors?: FieldError[]
}

type Product = {
    _id: string
    name: string
    barcode?: string
    category_id: {
        _id: string
        name: string
    }
    wholesale_wholesale_price: number
    wholesale_price: number
    selling_price: number
    status: "1" | "0"
    created_at: string
    updated_at: string
}

type ProductsResponse = {
    success: boolean
    data: Product[]
    message?: string
}

type CreateProductResponse = {
    success: boolean
    data?: Product
    message?: string
    errors?: FieldError[]
}

type DeleteProductResponse = {
    success: boolean
    message?: string
    data?: string
}

type UpdateProductResponse = {
    success: boolean
    data?: Product
    message?: string
    errors?: FieldError[]
}

type GetProductResponse = {
    success: boolean
    data?: Product
    message?: string
    errors?: FieldError[]
}

type Expense = {
    _id: string
    name: string
    amount: number
    created_at: string
    updated_at: string
}

type ExpensesResponse = {
    success: boolean
    data: Expense[]
    message?: string
}

type CreateExpenseResponse = {
    success: boolean
    data?: Expense
    message?: string
    errors?: FieldError[]
}

type DeleteExpenseResponse = {
    success: boolean
    message?: string
    data?: string
}

type UpdateExpenseResponse = {
    success: boolean
    data?: Expense
    message?: string
    errors?: FieldError[]
}

type GetExpenseResponse = {
    success: boolean
    data?: Expense
    message?: string
    errors?: FieldError[]
}

type Employee = {
    _id: string
    name: string
    salary: number
    shiftStart: string
    shiftEnd: string
    created_at: string
    updated_at: string
}

type EmployeesResponse = {
    success: boolean
    data: Employee[]
    message?: string
}

type CreateEmployeeResponse = {
    success: boolean
    data?: Employee
    message?: string
    errors?: FieldError[]
}

type DeleteEmployeeResponse = {
    success: boolean
    message?: string
    data?: string
}

type UpdateEmployeeResponse = {
    success: boolean
    data?: Employee
    message?: string
    errors?: FieldError[]
}

type GetEmployeeResponse = {
    success: boolean
    data?: Employee
    message?: string
    errors?: FieldError[]
}

type ActiveAttendanceItem = {
    employee: {
        _id: string
        name: string
        salary: number
        shiftStart: string
        shiftEnd: string
    }
    attendance: {
        _id: string
        checkIn: string | null
        checkOut: string | null
        date: string
    } | null
}

type ActiveAttendanceResponse = {
    success: boolean
    data: ActiveAttendanceItem[]
    message?: string
}

type MarkAttendanceResponse = {
    success: boolean
    data?: AttendanceRecord
    message?: string
    errors?: FieldError[]
}

type MonthlyReportItem = {
    date: string
    employee: {
        _id: string
        name: string
        salary: number
    }
    shiftStart: string
    shiftEnd: string
    checkIn: string
    checkOut: string
    delayMinutes: number
    earlyMinutes: number
    workedMinutes: number
    deduction: number
}

type MonthlyReportResponse = {
    success: boolean
    data: MonthlyReportItem[]
    message?: string
}

type Governorate = {
    _id: string
    name: string
}

type GovernoratesResponse = {
    success: boolean
    data: Governorate[]
    message?: string
}

type Supplier = {
    _id: string
    name: string
    phone: string
    address: string
    governorate: Governorate
    created_at: string
    updated_at: string
}

type SuppliersResponse = {
    success: boolean
    data: Supplier[]
    message?: string
}

type CreateSupplierResponse = {
    success: boolean
    data?: Supplier
    message?: string
    errors?: FieldError[]
}

type DeleteSupplierResponse = {
    success: boolean
    message?: string
    data?: string
}

type UpdateSupplierResponse = {
    success: boolean
    data?: Supplier
    message?: string
    errors?: FieldError[]
}

type GetSupplierResponse = {
    success: boolean
    data?: Supplier
    message?: string
    errors?: FieldError[]
}

type InvoicePurchaseItem = {
    categoryCode: string
    categoryName: string
    quantity: number | null
    price: number
    total: number | null
}

type InvoicePurchaseSubmitItem = {
    categoryCode: string
    quantity: number | null
    price: number
}

type InvoicePurchase = {
    id: string
    invoiceNo: string
    invoiceDate: string
    items: InvoicePurchaseItem[]
    total: number | null
}

type InvoicesPurchaseResponse = {
    success: boolean
    data: InvoicePurchase[]
    message?: string
}

type GetInvoicePurchaseResponse = {
    success: boolean
    data?: InvoicePurchase
    message?: string
    errors?: FieldError[]
}

type CreateInvoicePurchaseResponse = {
    success: boolean
    data?: InvoicePurchase
    message?: string
    errors?: FieldError[]
}

type UpdateInvoicePurchaseResponse = {
    success: boolean
    data?: InvoicePurchase
    message?: string
    errors?: FieldError[]
}

type DeleteInvoicePurchaseResponse = {
    success: boolean
    message?: string
}

type EventPayloadMapping = {
    statistics: Stats
    getStatisticsData: StaticData
    getToken: string | null
    login: LoginResult
    logout: void

    "auth:isSetupRequired": boolean
    "auth:setupSuperAdmin": SetupAdminResult
    "auth:getCurrentUser": CurrentAuthUser | null

    "theme:get": ThemeSettings
    "theme:set": void

    "categories:getAll": CategoriesResponse
    "categories:create": CreateCategoryResponse
    "categories:delete": DeleteCategoryResponse
    "categories:update": UpdateCategoryResponse
    "categories:get": GetCategoryResponse

    "products:getAll": ProductsResponse
    "products:create": CreateProductResponse
    "products:delete": DeleteProductResponse
    "products:update": UpdateProductResponse
    "products:get": GetProductResponse

    "expenses:getAll": ExpensesResponse
    "expenses:create": CreateExpenseResponse
    "expenses:delete": DeleteExpenseResponse
    "expenses:update": UpdateExpenseResponse
    "expenses:get": GetExpenseResponse

    "employees:getAll": EmployeesResponse
    "employees:create": CreateEmployeeResponse
    "employees:delete": DeleteEmployeeResponse
    "employees:update": UpdateEmployeeResponse
    "employees:get": GetEmployeeResponse

    "attendance:getActive": ActiveAttendanceResponse
    "attendance:getReport": MonthlyReportResponse
    "attendance:mark": MarkAttendanceResponse

    "suppliers:getAll": SuppliersResponse
    "suppliers:create": CreateSupplierResponse
    "suppliers:delete": DeleteSupplierResponse
    "suppliers:update": UpdateSupplierResponse
    "suppliers:get": GetSupplierResponse

    "governorates:getAll": GovernoratesResponse

    "invoicesPurchase:getAll": InvoicesPurchaseResponse
    "invoicesPurchase:get": GetInvoicePurchaseResponse
    "invoicesPurchase:create": CreateInvoicePurchaseResponse
    "invoicesPurchase:update": UpdateInvoicePurchaseResponse
    "invoicesPurchase:delete": DeleteInvoicePurchaseResponse
}

type UnsupscribeFunc = () => void

declare module "*.png" {
    const value: string
    export default value
}

declare module "*.jpg" {
    const value: string
    export default value
}

declare module "*.jpeg" {
    const value: string
    export default value
}

declare module "*.svg" {
    const value: string
    export default value
}

interface Window {
    electron: {
        auth: {
            getToken: () => Promise<string | null>
            login: (credentials: LoginCredentials) => Promise<LoginResult>
            logout: () => Promise<void>
            isSetupRequired: () => Promise<boolean>
            setupSuperAdmin: (data: SetupAdminCredentials) => Promise<SetupAdminResult>
            getCurrentUser: () => Promise<CurrentAuthUser | null>
        }
        theme: {
            get(): Promise<ThemeSettings>
            set(theme: ThemeSettings): Promise<void>
        }
        categories: {
            getAllCategories(page?: number, limit?: number): Promise<CategoriesResponse>
            createCategory(code: string, name: string): Promise<CreateCategoryResponse>
            deleteCategory(code: string): Promise<DeleteCategoryResponse>
            updateCategory(
                oldCode: string,
                newCode: string,
                name: string
            ): Promise<UpdateCategoryResponse>
            getCategory(code: string): Promise<GetCategoryResponse>
        }
        products: {
            getAllProducts(page?: number, limit?: number): Promise<ProductsResponse>
            createProduct(
                name: string,
                categoryId: string,
                wholesaleWholesalePrice: number,
                wholesalePrice: number,
                sellingPrice: number
            ): Promise<CreateProductResponse>
            deleteProduct(productId: string): Promise<DeleteProductResponse>
            updateProduct(
                productId: string,
                name: string,
                categoryId: string,
                wholesaleWholesalePrice: number,
                wholesalePrice: number,
                sellingPrice: number
            ): Promise<UpdateProductResponse>
            getProduct(productId: string): Promise<GetProductResponse>
        }
        expenses: {
            getAllExpenses(page?: number, limit?: number): Promise<ExpensesResponse>
            createExpense(name: string, amount: number): Promise<CreateExpenseResponse>
            deleteExpense(expenseId: string): Promise<DeleteExpenseResponse>
            updateExpense(
                expenseId: string,
                name: string,
                amount: number
            ): Promise<UpdateExpenseResponse>
            getExpense(expenseId: string): Promise<GetExpenseResponse>
        }
        employees: {
            getAllEmployees(page?: number, limit?: number): Promise<EmployeesResponse>
            createEmployee(
                name: string,
                salary: number,
                shiftStart: string,
                shiftEnd: string
            ): Promise<CreateEmployeeResponse>
            deleteEmployee(employeeId: string): Promise<DeleteEmployeeResponse>
            updateEmployee(
                employeeId: string,
                name: string,
                salary: number,
                shiftStart: string,
                shiftEnd: string
            ): Promise<UpdateEmployeeResponse>
            getEmployee(employeeId: string): Promise<GetEmployeeResponse>
        }
        attendance: {
            getActive(date: string): Promise<ActiveAttendanceResponse>
            getReport(month: number, year: number): Promise<MonthlyReportResponse>
            mark(
                employeeId: string,
                date: string,
                action: "in" | "out",
                time: string
            ): Promise<MarkAttendanceResponse>
        }
        suppliers: {
            getAllSuppliers(page?: number, limit?: number): Promise<SuppliersResponse>
            createSupplier(
                name: string,
                phone: string,
                governorate: string,
                address: string
            ): Promise<CreateSupplierResponse>
            deleteSupplier(id: string): Promise<DeleteSupplierResponse>
            updateSupplier(
                id: string,
                name: string,
                phone: string,
                governorate: string,
                address: string
            ): Promise<UpdateSupplierResponse>
            getSupplier(id: string): Promise<GetSupplierResponse>
        }
        governorates: {
            getAll(): Promise<GovernoratesResponse>
        }
        invoicesPurchase: {
            getAll(page?: number, limit?: number): Promise<InvoicesPurchaseResponse>
            get(id: string): Promise<GetInvoicePurchaseResponse>
            create(
                invoiceNo: string,
                invoiceDate: string,
                items: InvoicePurchaseSubmitItem[]
            ): Promise<CreateInvoicePurchaseResponse>
            update(
                id: string,
                invoiceNo: string,
                invoiceDate: string,
                items: InvoicePurchaseSubmitItem[]
            ): Promise<UpdateInvoicePurchaseResponse>
            delete(id: string): Promise<DeleteInvoicePurchaseResponse>
        }
    }
}