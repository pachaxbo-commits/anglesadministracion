import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * AdminRedirect - Canaliza la ruta `/admin`
 * Si el usuario ya está autenticado lo envía al dashboard.
 * Si no lo está, lo envía al formulario de login.
 */
export default function AdminRedirect() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBFDFB] flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#4A7C59]" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[#52695C]">
                    Accediendo al Portal Administrativo...
                </p>
            </div>
        )
    }

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    return <Navigate to="/login" replace />
}
