import { HashRouter } from "react-router-dom"

import Loader from "./Admin/shared/loading"
import AppRouter from "./Admin/router/AppRouter"
import AuthGate from "./Admin/router/AuthGate"
// Providers
import { LoadingProvider } from "./Admin/Providers/Loading/LoadingProvider"
import AuthProvider from "./Admin/Providers/Auth/AuthProvider"
import CategoriesProvider from "./Admin/Providers/Categories/CategoriesProvider"
import ProductsProvider from "./Admin/Providers/Products/ProductsProvider"
import ExpensesProvider from "./Admin/Providers/Expenses/ExpensesProvider"
import EmployeesProvider from "./Admin/Providers/Employees/EmployeesProvider"
import DailyAttendanceProvider from "./Admin/Providers/Attendance/DailyAttendanceProvider"
import AttendanceReportProvider from "./Admin/Providers/Attendance/AttendanceReportProvider"
import SuppliersProvider from "./Admin/Providers/Suppliers/SuppliersProvider"
import InvoicesPurchaseProvider from "./Admin/Providers/Invoices/Purchase/PurchaseProvider"

export default function App() {
    return (
        <LoadingProvider>
            <HashRouter>
                <AuthProvider>
                    <CategoriesProvider>
                        <ProductsProvider>
                            <ExpensesProvider>
                                <EmployeesProvider>
                                    <DailyAttendanceProvider>
                                        <AttendanceReportProvider>
                                            <InvoicesPurchaseProvider>
                                                <SuppliersProvider>
                                                    <Loader />
                                                    <AuthGate>
                                                        <AppRouter />
                                                    </AuthGate>
                                                </SuppliersProvider>
                                            </InvoicesPurchaseProvider>
                                        </AttendanceReportProvider>
                                    </DailyAttendanceProvider>
                                </EmployeesProvider>
                            </ExpensesProvider>
                        </ProductsProvider>
                    </CategoriesProvider>
                </AuthProvider>
            </HashRouter>
        </LoadingProvider>
    )
}
