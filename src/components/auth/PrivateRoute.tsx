import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'

/**
 * PrivateRoute - Protege rutas que requieren autenticación
 * 
 * Si el usuario no está logueado, redirige al login.
 * Si está logueado, muestra el contenido dentro del DashboardLayout.
 */
export default function PrivateRoute() {
    const { user, loading } = useAuth()

    // Mientras carga, mostrar spinner centrado
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Cargando...</p>
                </div>
            </div>
        )
    }

    // Si no hay usuario, redirigir al login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Usuario autenticado, mostrar el layout con el contenido
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    )
}
