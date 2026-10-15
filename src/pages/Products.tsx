import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Pencil, Trash2, Loader2, Search, ArrowUpDown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/Dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table'
import { useProducts } from '@/hooks/useProducts'
import { ProductInput } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export default function Products() {
    const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts()

    // Estado del modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<string | null>(null)
    const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Estado del formulario
    const [formData, setFormData] = useState<ProductInput>({
        nombre: '',
        costoProduccion: 0,
        precioVenta: 0,
        stock: 0,
    })

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Abrir modal para crear
    const openCreateModal = () => {
        setFormData({ nombre: '', costoProduccion: 0, precioVenta: 0, stock: 0 })
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    // Abrir modal para editar
    const openEditModal = (productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            setFormData({
                nombre: product.nombre,
                costoProduccion: product.costoProduccion,
                precioVenta: product.precioVenta,
                stock: product.stock,
            })
            setEditingProduct(productId)
            setIsModalOpen(true)
        }
    }

    // Guardar producto
    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            // Use simpler validation or native reports if requested, but logic is kept exactly as is
            alert('El nombre del producto es requerido')
            return
        }
        if (formData.precioVenta <= 0) {
            alert('El precio de venta debe ser mayor a 0')
            return
        }
        if (formData.stock < 0) {
            alert('El stock no puede ser negativo')
            return
        }

        setSaving(true)

        let success: boolean
        if (editingProduct) {
            success = await updateProduct(editingProduct, formData)
        } else {
            success = await addProduct(formData)
        }

        setSaving(false)

        if (success) {
            setIsModalOpen(false)
        }
    }

    // Confirmar eliminación
    const handleDelete = async () => {
        if (!deletingProduct) return

        setSaving(true)
        const success = await deleteProduct(deletingProduct)
        setSaving(false)

        if (success) {
            setIsDeleteModalOpen(false)
            setDeletingProduct(null)
        }
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Catálogo de Productos</h1>
                    <p className="mt-2 text-slate-500">Administra el directorio de productos, precios y detalles base.</p>
                </div>
                <Button onClick={openCreateModal} className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20 text-white rounded-full px-6 transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
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

            {/* Main Content Area */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl overflow-hidden rounded-2xl">
                {/* Toolbar */}
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar en el catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-transparent focus:bg-white transition-colors rounded-xl"
                        />
                    </div>
                    <div className="w-full sm:w-auto text-sm text-slate-500 font-medium px-4 py-2 bg-slate-50 rounded-xl inline-flex items-center justify-center">
                        <Package className="w-4 h-4 mr-2 text-slate-400" />
                        {filteredProducts.length} productos listados
                    </div>
                </div>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-4" />
                            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Cargando catálogo...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Package className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No hay productos encontrados</h3>
                            <p className="mt-2 text-slate-500 max-w-sm">
                                {searchTerm ? 'Intenta usar otros términos de búsqueda.' : 'Aún no hay productos registrados en el catálogo.'}
                            </p>
                            {!searchTerm && (
                                <Button onClick={openCreateModal} variant="outline" className="mt-6 rounded-full border-dashed border-2 px-6">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear primer producto
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-semibold text-slate-600 py-4 h-auto">
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors">
                                                Nombre de Producto <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 h-auto">Costo (Bs)</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 h-auto">Precio Venta (Bs)</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 h-auto">Stock</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 h-auto">Registrado por</TableHead>
                                        <TableHead className="text-right font-semibold text-slate-600 py-4 h-auto">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {filteredProducts.map((product, index) => (
                                            <motion.tr
                                                key={product.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                                                className="table-row-hover group border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                            >
                                                <TableCell className="font-medium py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 group-hover:shadow-sm transition-all border border-blue-100">
                                                            <Package className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <span className="text-slate-800 font-semibold">{product.nombre}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{formatCurrency(product.costoProduccion)}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-primary-50 text-primary-700">
                                                        {formatCurrency(product.precioVenta)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {product.stock < 5 ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 animate-pulse-soft border border-rose-100">
                                                            {product.stock} un.
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            {product.stock} un.
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-400 font-medium">
                                                    {product.createdByEmail?.split('@')[0] || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(product.id)}
                                                            className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 h-8 w-8 rounded-full"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeletingProduct(product.id)
                                                                setIsDeleteModalOpen(true)
                                                            }}
                                                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-full"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm mt-1">
                                {editingProduct
                                    ? 'Modifica los datos del producto en el catálogo'
                                    : 'Añade un nuevo producto para comenzar a vender'
                                }
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-6 py-6 space-y-5 bg-white">
                        <div className="space-y-2 relative">
                            <Label htmlFor="nombre" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre del producto *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Paracetamol 500mg"
                                className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="costo" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo (Bs)</Label>
                                <Input
                                    id="costo"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.costoProduccion || ''}
                                    onChange={(e) => setFormData({ ...formData, costoProduccion: parseFloat(e.target.value) || 0 })}
                                    className="h-11 rounded-xl bg-slate-50/50 border-slate-200 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="precio" className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Precio Venta (Bs) *</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.precioVenta || ''}
                                    onChange={(e) => setFormData({ ...formData, precioVenta: parseFloat(e.target.value) || 0 })}
                                    className="h-11 rounded-xl border-primary-200 focus-visible:ring-primary-500 bg-primary-50/30 text-primary-700 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock inicial</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={formData.stock || ''}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                className="h-11 rounded-xl bg-slate-50/50 border-slate-200"
                            />
                            {formData.stock < 5 && formData.stock !== 0 && (
                                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Este stock generará una alerta.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="rounded-xl border-slate-200 hover:bg-slate-100 hover:text-slate-700">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary-500 hover:bg-primary-600 shadow-sm transition-all px-6">
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                editingProduct ? 'Guardar Cambios' : 'Añadir Producto'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="p-6 text-center pt-8 bg-white">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-slate-900 mb-2">¿Eliminar producto?</DialogTitle>
                        <DialogDescription className="text-slate-500 text-base">
                            Esta acción no se puede deshacer. El producto será eliminado permanentemente del catálogo.
                        </DialogDescription>
                    </div>
                    <div className="bg-slate-50 p-6 flex justify-stretch gap-3 border-t border-slate-100">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={saving}
                            className="flex-1 rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={saving}
                            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
