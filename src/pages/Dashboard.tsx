import { Link } from 'react-router-dom'
import {
    Package,
    Stethoscope,
    Warehouse,
    AlertTriangle,
    Loader2,
    ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useProducts } from '@/hooks/useProducts'
import { useDoctors } from '@/hooks/useDoctors'

export default function Dashboard() {
    const { products, loading: loadingProducts } = useProducts()
    const { doctors, loading: loadingDoctors } = useDoctors()

    const loading = loadingProducts || loadingDoctors

    const lowStockProducts = products.filter(p => p.stock < 5)
    
    // Calculate total inventory value
    const totalInventoryValue = products.reduce((acc, current) => {
        return acc + (current.precioVenta * current.stock)
    }, 0)

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Resumen general del sistema</p>
            </div>

            {/* Top 4 Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Productos</p>
                            <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                            <p className="text-xs text-gray-500">productos registrados</p>
                        </div>
                        <div className="h-10 w-10 rounded bg-blue-500 flex items-center justify-center text-white">
                            <Package className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Doctores</p>
                            <h3 className="text-2xl font-bold text-gray-900">{doctors.length}</h3>
                            <p className="text-xs text-gray-500">doctores registrados</p>
                        </div>
                        <div className="h-10 w-10 rounded bg-purple-500 flex items-center justify-center text-white">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Inventario</p>
                            <h3 className="text-2xl font-bold text-gray-900">Bs. {totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                            <p className="text-xs text-gray-500">valor total en stock</p>
                        </div>
                        <div className="h-10 w-10 rounded bg-green-500 flex items-center justify-center text-white">
                            <Warehouse className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                            <h3 className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</h3>
                            <p className="text-xs text-gray-500">requieren atención</p>
                        </div>
                        <div className="h-10 w-10 rounded bg-red-500 flex items-center justify-center text-white">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Banner */}
            {lowStockProducts.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-center gap-2 text-yellow-800 mb-3">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-semibold">Productos con Stock Bajo</h3>
                    </div>
                    <div className="space-y-2 mb-4">
                        {lowStockProducts.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex items-center justify-between bg-white px-4 py-2 rounded-md border border-yellow-100">
                                <span className="font-medium text-gray-700">{product.nombre}</span>
                                <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">{product.stock} unidades</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/inventario">
                        <Button variant="outline" className="w-full text-yellow-700 border-yellow-300 hover:bg-yellow-100 bg-white">
                            Ver Inventario Completo
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* Bottom Action Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link to="/productos">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Gestionar Productos</h3>
                                <p className="text-sm text-gray-500">Agregar o editar productos</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/doctores">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Gestionar Doctores</h3>
                                <p className="text-sm text-gray-500">Agregar o editar doctores</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/inventario">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                <Warehouse className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Ver Inventario</h3>
                                <p className="text-sm text-gray-500">Controlar stock</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
