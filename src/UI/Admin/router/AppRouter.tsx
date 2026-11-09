
import { Routes, Route } from "react-router-dom"
import Login from "../pages/auth/login"
import Setup from "../pages/auth/setup"
import Dashboard from "../pages/dashboard/main"
import NotFound from "../pages/not_found/not_found"
import ProtectedRoute from "./ProtectedRoute"
import MainLayout from "../layouts/main.layout"
// Categories
import { GetAllCategories } from "../pages/categories/getAllCategories"
import { AddNewCategory } from "../pages/categories/addNewCategory"
import { EditCategory } from "../pages/categories/EditCategory"
import { SearchCategoriesStock } from "../pages/categories/SearchCategoriesStock"

import { GetAllProducts } from "../pages/products/getAllProducts"
import { AddNewProduct } from "../pages/products/addNewProduct"
import { EditProduct } from "../pages/products/EditProduct"

import { GetAllExpenses } from "../pages/expenses/getAllExpenses"
import { AddNewExpense } from "../pages/expenses/addNewExpense"
import { EditExpense } from "../pages/expenses/EditExpense"
import { GetAllEmployees } from "../pages/employees/getAllEmployees"
import { AddNewEmployee } from "../pages/employees/addNewEmployees"
import { EditEmployee } from "../pages/employees/editEmployees"
import { DailyAttendance } from "../pages/attendance/DailyAttendance"
import { AttendanceReport } from "../pages/attendance/AttendanceReport"
import { GetAllSuppliers } from "../pages/suppliers/GetAllSuppliers"
import { AddSupplier } from "../pages/suppliers/AddSupplier"
import { EditSupplier } from "../pages/suppliers/EditSupplier"
// Invoices Purchase
import { GetAllInvoicesPurchase } from "../pages/Invoices/Purchase/GetAllInvoicesPurchase"
import { AddInvoicePurchase } from "../pages/Invoices/Purchase/AddInvoicePurchase"
import { EditInvoicePurchase } from "../pages/Invoices/Purchase/EditInvoicePurchase"

export default function AppRouter() {
    return (
        <Routes>
            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/setup"
                element={<Setup />}
            />

            <Route element={<MainLayout />}>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/categories"
                    element={
                        <ProtectedRoute>
                            <GetAllCategories />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/categories/add"
                    element={
                        <ProtectedRoute>
                            <AddNewCategory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/categories/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditCategory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/categories/stock"
                    element={
                        <ProtectedRoute>
                            <SearchCategoriesStock />
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <GetAllProducts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products/add"
                    element={
                        <ProtectedRoute>
                            <AddNewProduct />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditProduct />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/expenses"
                    element={
                        <ProtectedRoute>
                            <GetAllExpenses />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/expenses/add"
                    element={
                        <ProtectedRoute>
                            <AddNewExpense />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/expenses/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditExpense />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees"
                    element={
                        <ProtectedRoute>
                            <GetAllEmployees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees/add"
                    element={
                        <ProtectedRoute>
                            <AddNewEmployee />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditEmployee />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute>
                            <DailyAttendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance/report"
                    element={
                        <ProtectedRoute>
                            <AttendanceReport />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/suppliers"
                    element={
                        <ProtectedRoute>
                            <GetAllSuppliers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/suppliers/add"
                    element={
                        <ProtectedRoute>
                            <AddSupplier />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/suppliers/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditSupplier />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/invoices/purchase"
                    element={
                        <ProtectedRoute>
                            <GetAllInvoicesPurchase />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/invoices/purchase/add"
                    element={
                        <ProtectedRoute>
                            <AddInvoicePurchase />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/invoices/purchase/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditInvoicePurchase />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<NotFound />}
                />
            </Route>
        </Routes>
    )
}
