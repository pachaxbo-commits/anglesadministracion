import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './components/ui/Toaster'
import PrivateRoute from './components/auth/PrivateRoute'
import AdminRedirect from './components/auth/AdminRedirect'

// Pages - Páginas de la aplicación
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import PasswordRecovery from './pages/PasswordRecovery'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Doctors from './pages/Doctors'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import DeletedSales from './pages/DeletedSales'
import Profits from './pages/Profits'

/**
 * App - Componente principal de la aplicación
 * 
 * Configura:
 * - `/` -> Landing Page pública sofisticada
 * - `/admin` -> Redirección inteligente al portal de administración
 * - `/login`, `/recuperar-password` -> Autenticación
 * - Rutas protegidas (Dashboard, Productos, Doctores, Inventario, Ventas, Ganancias)
 */
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* Rutas de la aplicación */}
                <Routes>
                    {/* Página de Inicio Pública */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Acceso al Panel de Administración */}
                    <Route path="/admin" element={<AdminRedirect />} />

                    {/* Rutas de autenticación */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/recuperar-password" element={<PasswordRecovery />} />

                    {/* Rutas protegidas del Panel Administrativo */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/productos" element={<Products />} />
                        <Route path="/doctores" element={<Doctors />} />
                        <Route path="/inventario" element={<Inventory />} />
                        <Route path="/ventas" element={<Sales />} />
                        <Route path="/ventas-eliminadas" element={<DeletedSales />} />
                        <Route path="/ganancias" element={<Profits />} />
                    </Route>

                    {/* Ruta por defecto - redirige a la Landing Page */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Sistema de notificaciones */}
                <Toaster />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
