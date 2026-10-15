import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Stethoscope,
    Warehouse,
    ShoppingCart,
    TrendingUp,
    LogOut,
    Trash2,
    User
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const NAVIGATION = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Productos', href: '/productos', icon: Package },
    { name: 'Doctores', href: '/doctores', icon: Stethoscope },
    { name: 'Inventario', href: '/inventario', icon: Warehouse },
    { name: 'Ventas', href: '/ventas', icon: ShoppingCart },
    { name: 'Ganancias', href: '/ganancias', icon: TrendingUp },
    { name: 'Ventas Eliminadas', href: '/ventas-eliminadas', icon: Trash2 },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const location = useLocation()
    const { user, logout } = useAuth()

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar Clásico */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-[#2BB673] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">F</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">Farmacia</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {NAVIGATION.map((item) => {
                            const isActive = location.pathname.startsWith(item.href)
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            isActive 
                                                ? "bg-green-50 text-green-700" 
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-green-600" : "text-gray-400")} />
                                        {item.name}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gray-50">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                            <p className="text-xs text-gray-500">Propietaria</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header Superior (Opcional, según captura) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{user?.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </header>

                {/* Sub-Main / Screens */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
