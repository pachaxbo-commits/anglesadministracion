import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Warehouse, AlertTriangle, Package, Loader2, Minus, Plus, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table'
import { useProducts } from '@/hooks/useProducts'
import { formatCurrency, cn } from '@/lib/utils'

export default function Inventory() {
    const { products, loading, error, updateStock } = useProducts()

    const [editingStock, setEditingStock] = useState<string | null>(null)
    const [newStockValue, setNewStockValue] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    const lowStockProducts = products.filter(p => p.stock < 5)

    const startEditStock = (productId: string, currentStock: number) => {
        setEditingStock(productId)
        setNewStockValue(currentStock)
    }

    const cancelEditStock = () => {
        setEditingStock(null)
        setNewStockValue(0)
    }

    const saveStock = async () => {
        if (!editingStock) return
        if (newStockValue < 0) {
            alert('El stock no puede ser negativo')
            return
        }

        setSaving(true)
        const success = await updateStock(editingStock, newStockValue)
        setSaving(false)

        if (success) {
            setEditingStock(null)
        }
    }

    const adjustStock = (delta: number) => {
        const newValue = Math.max(0, newStockValue + delta)
        setNewStockValue(newValue)
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Control de Inventario</h1>
                <p className="mt-2 text-slate-500">Supervisa las existencias y ajusta el stock rápidamente.</p>
            </div>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 flex items-center shadow-sm">
                            <Loader2 className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Low Stock Banner */}
            {lowStockProducts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-sm">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-amber-100 mt-1 sm:mt-0">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-amber-900">
                                    ¡Atención! {lowStockProducts.length} productos con stock bajo
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {lowStockProducts.map(product => (
                                        <span
                                            key={product.id}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200 shadow-sm"
                                        >
                                            {product.nombre} <span className="text-amber-500">|</span> <span className="font-bold">{product.stock} un.</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Inventory table */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl overflow-hidden rounded-2xl">
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Warehouse className="h-5 w-5 text-primary-500" />
                        Stock Actual ({products.length})
                    </h2>
                </div>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-4" />
                            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Cargando inventario...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Warehouse className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No hay productos en el inventario</h3>
                            <p className="mt-2 text-slate-500 max-w-sm">
                                Ve a Productos y añade nuevo catálogo para comenzar a controlar el stock.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-semibold text-slate-600 py-4">Producto</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Precio Venta (Bs)</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Stock</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Estado</TableHead>
                                        <TableHead className="text-right font-semibold text-slate-600 py-4">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {products.map((product, index) => {
                                            const isLowStock = product.stock < 5
                                            const isEditing = editingStock === product.id

                                            return (
                                                <motion.tr
                                                    key={product.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                                                    className={cn(
                                                        "group border-b border-slate-50 hover:bg-slate-50/50 transition-colors",
                                                        isLowStock && !isEditing && 'bg-rose-50/30 hover:bg-rose-50/50'
                                                    )}
                                                >
                                                    <TableCell className="font-medium py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "flex h-10 w-10 items-center justify-center rounded-xl transition-all border",
                                                                isLowStock ? "bg-rose-100/50 border-rose-100" : "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100"
                                                            )}>
                                                                <Package className={cn("h-5 w-5", isLowStock ? "text-rose-600" : "text-blue-600")} />
                                                            </div>
                                                            <span className="text-slate-800 font-semibold">{product.nombre}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 font-medium">
                                                        {formatCurrency(product.precioVenta)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-1 bg-white border border-primary-200 rounded-lg p-1 w-max shadow-inner">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                                    onClick={() => adjustStock(-1)}
                                                                    disabled={newStockValue <= 0}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={newStockValue}
                                                                    onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                                                                    className="h-7 w-14 text-center border-0 bg-transparent focus-visible:ring-0 p-0 font-bold text-primary-700"
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 rounded-sm text-slate-500 hover:text-primary-600 hover:bg-primary-50 cursor-pointer"
                                                                    onClick={() => adjustStock(1)}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className={cn(
                                                                'inline-flex text-base font-bold px-3 py-1 rounded-lg border',
                                                                isLowStock ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-700 bg-slate-50 border-slate-200'
                                                            )}>
                                                                {product.stock}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isLowStock ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 animate-pulse-soft">
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                                Bajo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                                                OK
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {isEditing ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={cancelEditStock}
                                                                    disabled={saving}
                                                                    className="h-8 rounded-lg text-slate-500 cursor-pointer"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={saveStock}
                                                                    disabled={saving}
                                                                    className="h-8 rounded-lg bg-primary-500 hover:bg-primary-600 shadow-sm cursor-pointer"
                                                                >
                                                                    {saving ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Save className="mr-1.5 h-3.5 w-3.5" />
                                                                            Guardar
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => startEditStock(product.id, product.stock)}
                                                                className="rounded-lg border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-primary-700 hover:border-primary-200 cursor-pointer"
                                                            >
                                                                Ajustar
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            )
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
