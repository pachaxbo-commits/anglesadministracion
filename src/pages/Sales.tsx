import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart,
    Plus,
    Trash2,
    Loader2,
    Zap,
    Stethoscope,
    Truck,
    CreditCard,
    Banknote,
    Store,
    Package,
    Search,
    CheckCircle2,
    Printer
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from '@/components/ui/Dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table'
import { useSales } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { useDoctors } from '@/hooks/useDoctors'
import { SaleInput, SaleItem, getSaleItems, Sale } from '@/lib/types'
import { formatCurrency, formatShortDate, cn } from '@/lib/utils'
import { DEPARTAMENTOS_BOLIVIA } from '@/lib/types'
import { PrintableReceipt } from '@/components/receipt/PrintableReceipt'

interface CartItem extends SaleItem {
    id: string
}

export default function Sales() {
    const { sales, loading, error, addSale, updateSale, deleteSale } = useSales()
    const { products, loadProducts } = useProducts()
    const { doctors } = useDoctors()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingSale, setDeletingSale] = useState<string | null>(null)
    const [printingSale, setPrintingSale] = useState<Sale | null>(null)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [editingSaleId, setEditingSaleId] = useState<string | null>(null)

    const [tipoVenta, setTipoVenta] = useState<'NORMAL' | 'LUCIO' | 'DOCTORES' | 'ENVIO'>('NORMAL')
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedProductId, setSelectedProductId] = useState('')
    const [isQuickSale, setIsQuickSale] = useState(false)
    const [quickProductName, setQuickProductName] = useState('')
    const [addQuantity, setAddQuantity] = useState(1)
    const [addUnitPrice, setAddUnitPrice] = useState(0)

    const [metodoPago, setMetodoPago] = useState<'QR' | 'EFECTIVO'>('QR')
    const [clienteNombre, setClienteNombre] = useState('')
    const [precioEnvio, setPrecioEnvio] = useState(0)

    const [doctorId, setDoctorId] = useState('')
    const [pacienteNombre, setPacienteNombre] = useState('')
    const [lucioDelivery, setLucioDelivery] = useState(false)
    const [lucioDeliveryPrice, setLucioDeliveryPrice] = useState(0)

    const [departamento, setDepartamento] = useState('')

    const cartTotal = cart.reduce((sum, item) => sum + item.lineTotal, 0)
    const filteredSales = sales.filter(s =>
        s.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.doctorNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tipoVenta.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const resetForm = () => {
        setTipoVenta('NORMAL')
        setCart([])
        setSelectedProductId('')
        setIsQuickSale(false)
        setQuickProductName('')
        setAddQuantity(1)
        setAddUnitPrice(0)
        setMetodoPago('QR')
        setClienteNombre('')
        setPrecioEnvio(0)
        setDoctorId('')
        setPacienteNombre('')
        setLucioDelivery(false)
        setLucioDeliveryPrice(0)
        setDepartamento('')
    }

    const openCreateModal = () => {
        setEditingSaleId(null)
        resetForm()
        setIsModalOpen(true)
    }

    const openEditModal = (sale: Sale) => {
        setEditingSaleId(sale.id)
        setTipoVenta(sale.tipoVenta)
        
        // Restore cart items
        const restoredCart = getSaleItems(sale).map(i => ({...i, id: `edit-${Math.random()}`})) as CartItem[]
        setCart(restoredCart)
        
        setMetodoPago(sale.metodoPago || 'QR')
        setClienteNombre(sale.clienteNombre || '')
        setPrecioEnvio(sale.precioEnvio || 0)
        setDoctorId(sale.doctorId || '')
        setPacienteNombre(sale.pacienteNombre || '')
        setLucioDelivery(sale.lucioDelivery || false)
        setLucioDeliveryPrice(sale.lucioDeliveryPrice || 0)
        setDepartamento(sale.departamento || '')
        
        setIsModalOpen(true)
    }

    const handleAddToCart = () => {
        if (isQuickSale) {
            if (!quickProductName.trim()) { alert('Ingresa el nombre del producto'); return }
            if (addUnitPrice <= 0) { alert('El precio debe ser mayor a 0'); return }

            const newItem: CartItem = {
                id: `quick-${Date.now()}`,
                type: 'quick',
                productName: quickProductName,
                quantity: addQuantity,
                unitPrice: addUnitPrice,
                lineTotal: addQuantity * addUnitPrice,
            }
            setCart([...cart, newItem])
            setQuickProductName('')
            setAddQuantity(1)
            setAddUnitPrice(0)
        } else {
            if (!selectedProductId) { alert('Selecciona un producto'); return }
            const product = products.find(p => p.id === selectedProductId)
            if (!product) return

            const existingQty = cart.filter(i => i.productId === selectedProductId).reduce((sum, i) => sum + i.quantity, 0)
            if (product.stock < existingQty + addQuantity) {
                alert(`Stock insuficiente. Disponible: ${product.stock - existingQty}`)
                return
            }

            const newItem: CartItem = {
                id: `inv-${Date.now()}`,
                type: 'inventory',
                productId: product.id,
                productName: product.nombre,
                quantity: addQuantity,
                unitPrice: addUnitPrice || product.precioVenta,
                lineTotal: addQuantity * (addUnitPrice || product.precioVenta),
            }
            setCart([...cart, newItem])
            setSelectedProductId('')
            setAddQuantity(1)
            setAddUnitPrice(0)
        }
    }

    const handleRemoveFromCart = (itemId: string) => {
        setCart(cart.filter(i => i.id !== itemId))
    }

    const handleProductSelect = (value: string) => {
        if (value === 'quick') {
            setIsQuickSale(true)
            setSelectedProductId('')
            setAddUnitPrice(0)
        } else {
            setIsQuickSale(false)
            setSelectedProductId(value)
            const product = products.find(p => p.id === value)
            if (product) {
                setAddUnitPrice(product.precioVenta)
            }
        }
    }

    const handleDoctorSelect = (docId: string) => {
        setDoctorId(docId)
    }

    const handleSave = async () => {
        if (cart.length === 0) { alert('Agrega al menos un producto al carrito'); return }
        if (tipoVenta === 'DOCTORES') {
            if (!doctorId) { alert('Selecciona un doctor'); return }
            if (!pacienteNombre.trim()) { alert('Ingresa el nombre o número del paciente'); return }
            if (lucioDelivery && lucioDeliveryPrice <= 0) { alert('Ingresa el precio de la carrera de Lucio'); return }
        }
        if (tipoVenta === 'ENVIO' && !departamento) { alert('Selecciona un departamento'); return }

        setSaving(true)
        const selectedDoctor = doctors.find(d => d.id === doctorId)
        const saleItems: SaleItem[] = cart.map(({ id, ...item }) => item)

        const saleData: SaleInput = {
            tipoVenta,
            items: saleItems,
            precioVenta: cartTotal,
            ...(tipoVenta === 'NORMAL' && { metodoPago, clienteNombre }),
            ...(tipoVenta === 'LUCIO' && { metodoPago, precioEnvio, clienteNombre }),
            ...(tipoVenta === 'DOCTORES' && {
                doctorId,
                doctorNombre: selectedDoctor?.nombre || '',
                doctorCiudad: selectedDoctor?.ciudad || '',
                pacienteNombre,
                lucioDelivery,
                lucioDeliveryPrice: lucioDelivery ? lucioDeliveryPrice : 0,
            }),
            ...(tipoVenta === 'ENVIO' && { departamento }),
        }

        const success = editingSaleId 
            ? await updateSale(editingSaleId, saleData) 
            : await addSale(saleData)
            
        setSaving(false)

        if (success) {
            setIsModalOpen(false)
            setEditingSaleId(null)
            loadProducts()
        }
    }

    const openDeleteModal = (saleId: string) => {
        setDeletingSale(saleId)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingSale) return
        setSaving(true)
        const success = await deleteSale(deletingSale)
        setSaving(false)
        if (success) {
            setIsDeleteModalOpen(false)
            setDeletingSale(null)
        }
    }

    const handlePrintSale = (sale: Sale) => {
        setPrintingSale(sale)
        setTimeout(() => {
            window.print()
            setPrintingSale(null) // Clear printingSale after print dialog is initiated
        }, 100) // Brief delay to ensure component is rendered in DOM before printing
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Ventas</h1>
                    <p className="mt-2 text-slate-500">Historial de transacciones y terminal de punto de venta.</p>
                </div>
                <Button
                    onClick={openCreateModal}
                    size="lg"
                    className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20 text-white rounded-full px-8 transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva Venta POS
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

            {/* Sales Table */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl overflow-hidden rounded-2xl">
                {/* Toolbar */}
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar clientes o doctores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-transparent focus:bg-white transition-colors rounded-xl h-10"
                        />
                    </div>
                    <div className="w-full sm:w-auto text-sm text-slate-500 font-medium px-4 py-2 bg-slate-50 rounded-xl inline-flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 mr-2 text-slate-400" />
                        {filteredSales.length} ventas procesadas
                    </div>
                </div>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-4" />
                            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Cargando transacciones...</p>
                        </div>
                    ) : filteredSales.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <ShoppingCart className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No hay ventas registradas</h3>
                            <p className="mt-2 text-slate-500 max-w-sm">
                                {searchTerm ? 'Intenta usar otros términos.' : 'Abre el POS para procesar tu primera venta.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-semibold text-slate-600 py-4 hidden sm:table-cell">Fecha</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Tipo</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Detalle Productos</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 hidden md:table-cell">Información</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Total Pagado</TableHead>
                                        <TableHead className="text-right font-semibold text-slate-600 py-4">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {filteredSales.map((sale, index) => {
                                            const items = getSaleItems(sale)
                                            const hasQuickItems = items.some(i => i.type === 'quick')

                                            return (
                                                <motion.tr
                                                    key={sale.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                                                    className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-default"
                                                >
                                                    <TableCell className="whitespace-nowrap text-sm text-slate-500 font-medium hidden sm:table-cell">
                                                        {formatShortDate(sale.createdAt)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border',
                                                            sale.tipoVenta === 'NORMAL' && 'bg-emerald-50 text-emerald-700 border-emerald-100',
                                                            sale.tipoVenta === 'LUCIO' && 'bg-blue-50 text-blue-700 border-blue-100',
                                                            sale.tipoVenta === 'DOCTORES' && 'bg-purple-50 text-purple-700 border-purple-100',
                                                            sale.tipoVenta === 'ENVIO' && 'bg-amber-50 text-amber-700 border-amber-100',
                                                        )}>
                                                            {sale.tipoVenta === 'NORMAL' && <Store className="h-3.5 w-3.5" />}
                                                            {sale.tipoVenta === 'LUCIO' && <CreditCard className="h-3.5 w-3.5" />}
                                                            {sale.tipoVenta === 'DOCTORES' && <Stethoscope className="h-3.5 w-3.5" />}
                                                            {sale.tipoVenta === 'ENVIO' && <Truck className="h-3.5 w-3.5" />}
                                                            {sale.tipoVenta}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {hasQuickItems ? (
                                                                <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                                                    <Zap className="h-4 w-4 text-amber-500" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                                    <Package className="h-4 w-4 text-slate-500" />
                                                                </div>
                                                            )}
                                                            <div className="max-w-[180px] sm:max-w-[250px]">
                                                                {items.length === 1 ? (
                                                                    <span className="font-semibold text-slate-800 text-sm">{items[0].quantity}x {items[0].productName}</span>
                                                                ) : (
                                                                    <div className="text-sm">
                                                                        <span className="font-bold text-slate-800">{items.length} productos diferentes</span>
                                                                        <span className="text-slate-500 block text-xs truncate mt-0.5">
                                                                            {items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-600 hidden md:table-cell">
                                                        {sale.tipoVenta === 'NORMAL' && (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium text-slate-800">{sale.clienteNombre || 'Consumidor Final'}</span>
                                                                <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 w-max px-2 py-0.5 rounded">
                                                                    {sale.metodoPago === 'QR' ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                                                                    {sale.metodoPago}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {sale.tipoVenta === 'LUCIO' && (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium text-slate-800">{sale.clienteNombre || 'Consumidor Final'}</span>
                                                                <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 w-max px-2 py-0.5 rounded">
                                                                    {sale.metodoPago} {sale.precioEnvio ? `(+ ${formatCurrency(sale.precioEnvio)})` : ''}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {sale.tipoVenta === 'DOCTORES' && (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium text-purple-800">{sale.doctorNombre}</span>
                                                                <span className="text-xs text-slate-500">Pac: {sale.pacienteNombre || '—'}</span>
                                                            </div>
                                                        )}
                                                        {sale.tipoVenta === 'ENVIO' && <span className="font-medium">{sale.departamento}</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-black bg-primary-50 text-primary-700 border border-primary-100">
                                                            {formatCurrency(sale.precioVenta)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handlePrintSale(sale)}
                                                                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                                title="Imprimir Recibo"
                                                            >
                                                                <Printer className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openEditModal(sale)}
                                                                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                                title="Editar Venta"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(sale.id)}
                                                                className="h-8 w-8 rounded-full bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors inline-flex items-center justify-center cursor-pointer"
                                                                title="Anular venta"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
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

            {/* Premium Create Sale Modal (POS) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 rounded-2xl overflow-hidden border-0 shadow-2xl bg-slate-50">

                    {/* POS Header */}
                    <div className="bg-white px-6 py-5 border-b border-slate-200 shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900">
                                    {editingSaleId ? 'Editar Venta' : 'Punto de Venta'}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium mt-0.5">
                                    Procesa rápidamente la transacción
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="text-right hidden sm:block">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Total a Cobrar</h2>
                            <p className="text-4xl font-black text-primary-600 tabular-nums">
                                {formatCurrency(cartTotal)}
                            </p>
                        </div>
                    </div>

                    {/* POS Layout - Split Screen on Desktop */}
                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                        {/* LEFT: Cart & Product Entry */}
                        <div className="flex-1 lg:w-3/5 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
                            <div className="p-6 shrink-0 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary-500" />
                                    Agregar al Carrito
                                </h3>

                                <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
                                    <div className="flex-1 min-w-[220px]">
                                        <Label className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Buscador de Producto</Label>
                                        <Select value={isQuickSale ? 'quick' : selectedProductId} onValueChange={handleProductSelect}>
                                            <SelectTrigger className="h-12 bg-white rounded-xl border-slate-200 font-medium cursor-pointer">
                                                <SelectValue placeholder="Busca o escanea un producto..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 rounded-xl">
                                                <SelectItem value="quick" className="text-amber-700 font-bold bg-amber-50 cursor-pointer">
                                                    <span className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4" /> Venta Rápida (Sin Stock)
                                                    </span>
                                                </SelectItem>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0} className="font-medium cursor-pointer">
                                                        <div className="flex justify-between w-full pr-4 gap-8">
                                                            <span>{p.nombre}</span>
                                                            <span className={cn("text-xs font-bold", p.stock <= 0 ? "text-rose-500" : "text-emerald-600")}>
                                                                {p.stock} un. | {formatCurrency(p.precioVenta)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {isQuickSale && (
                                        <div className="flex-1 min-w-[200px]">
                                            <Label className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Descripción Venta</Label>
                                            <Input
                                                value={quickProductName}
                                                onChange={(e) => setQuickProductName(e.target.value)}
                                                placeholder="Ej. Curitas caja"
                                                className="h-12 bg-white rounded-xl border-slate-200"
                                            />
                                        </div>
                                    )}

                                    <div className="w-24">
                                        <Label className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Cantidad</Label>
                                        <Input
                                            type="number" min="1"
                                            value={addQuantity}
                                            onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
                                            className="h-12 text-center text-lg font-bold bg-white rounded-xl border-slate-200"
                                        />
                                    </div>

                                    <div className="w-32">
                                        <Label className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Precio Unit. Bs</Label>
                                        <Input
                                            type="number" min="0" step="0.01"
                                            value={addUnitPrice}
                                            onChange={(e) => setAddUnitPrice(parseFloat(e.target.value) || 0)}
                                            className="h-12 text-center text-lg font-bold text-primary-700 bg-primary-50 border-primary-200 rounded-xl"
                                        />
                                    </div>

                                    <Button onClick={handleAddToCart} className="h-12 w-12 rounded-xl bg-primary-500 hover:bg-primary-600 shadow-md flex-shrink-0 cursor-pointer p-0 flex items-center justify-center">
                                        <Plus className="h-6 w-6 text-white" />
                                    </Button>
                                </div>
                            </div>

                            {/* Cart List */}
                            <div className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                                        <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                                        <p className="font-medium text-lg">El carrito está vacío</p>
                                        <p className="text-sm">Agrega productos en el buscador de arriba</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest sticky top-0 z-10">
                                                <th className="py-3 px-6">Producto</th>
                                                <th className="py-3 px-4 text-center">Cant</th>
                                                <th className="py-3 px-4 text-right">P.U.</th>
                                                <th className="py-3 px-4 text-right">Total</th>
                                                <th className="py-3 px-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence>
                                                {cart.map((item) => (
                                                    <motion.tr
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors"
                                                    >
                                                        <td className="py-4 px-6">
                                                            <div className="font-bold text-slate-800">{item.productName}</div>
                                                            {item.type === 'quick' && <span className="text-[10px] uppercase font-black text-amber-500 flex items-center gap-1 mt-0.5"><Zap className="w-3 h-3" /> Venta Rápida</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-center font-bold text-slate-700 bg-slate-50/50">{item.quantity}</td>
                                                        <td className="py-4 px-4 text-right font-medium text-slate-500">{formatCurrency(item.unitPrice)}</td>
                                                        <td className="py-4 px-4 text-right font-black text-slate-800">{formatCurrency(item.lineTotal)}</td>
                                                        <td className="py-4 px-4 text-center">
                                                            <button onClick={() => handleRemoveFromCart(item.id)} className="h-8 w-8 rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-600 inline-flex items-center justify-center transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Transaction Details & Checkout */}
                        <div className="flex-1 lg:w-2/5 flex flex-col bg-slate-50 overflow-y-auto">
                            <div className="p-6 flex-1 space-y-6">

                                {/* Sale Type */}
                                <div>
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Tipo de Venta</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { type: 'NORMAL' as const, icon: Store, label: 'Normal' },
                                            { type: 'LUCIO' as const, icon: CreditCard, label: 'Promotor Lucio' },
                                            { type: 'DOCTORES' as const, icon: Stethoscope, label: 'Por Doctor' },
                                            { type: 'ENVIO' as const, icon: Truck, label: 'A Provincia' },
                                        ].map(({ type, icon: Icon, label }) => (
                                            <button
                                                key={type} type="button" onClick={() => setTipoVenta(type)}
                                                className={cn(
                                                    'flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all bg-white cursor-pointer relative overflow-hidden',
                                                    tipoVenta === type ? 'border-primary-500 shadow-md' : 'border-slate-100 hover:border-slate-300'
                                                )}
                                            >
                                                {tipoVenta === type && <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-primary-500" /></div>}
                                                <Icon className={cn('h-8 w-8', tipoVenta === type ? 'text-primary-600' : 'text-slate-400')} />
                                                <span className={cn("text-xs font-bold text-center", tipoVenta === type ? "text-primary-700" : "text-slate-500")}>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Forms Based on Type */}
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {(tipoVenta === 'NORMAL' || tipoVenta === 'LUCIO') && (
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Método de Cobro *</Label>
                                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                                    <Button
                                                        type="button" variant={metodoPago === 'QR' ? 'default' : 'ghost'} onClick={() => setMetodoPago('QR')}
                                                        className={cn("flex-1 rounded-lg cursor-pointer h-12", metodoPago === 'QR' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700')}
                                                    >
                                                        <CreditCard className="mr-2 h-5 w-5 text-blue-500" /> QR / Transf.
                                                    </Button>
                                                    <Button
                                                        type="button" variant={metodoPago === 'EFECTIVO' ? 'default' : 'ghost'} onClick={() => setMetodoPago('EFECTIVO')}
                                                        className={cn("flex-1 rounded-lg cursor-pointer h-12", metodoPago === 'EFECTIVO' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700')}
                                                    >
                                                        <Banknote className="mr-2 h-5 w-5 text-emerald-500" /> Efectivo
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Cliente (Opcional)</Label>
                                                <Input value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Nombre o CI/NIT" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                                            </div>

                                            {tipoVenta === 'LUCIO' && (
                                                <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <Label className="text-xs font-bold text-blue-700 tracking-wider uppercase">Retención Delivery Lucio (Bs) *</Label>
                                                    <Input type="number" min="0" step="0.01" value={precioEnvio} onChange={(e) => setPrecioEnvio(parseFloat(e.target.value) || 0)} placeholder="Ej: 15" className="h-12 border-blue-200 bg-white shadow-sm rounded-xl font-bold" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {tipoVenta === 'DOCTORES' && (
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Doctor Referente *</Label>
                                                <Select onValueChange={handleDoctorSelect} value={doctorId}>
                                                    <SelectTrigger className="h-12 bg-slate-50 rounded-xl border-slate-200 cursor-pointer">
                                                        <SelectValue placeholder="Selecciona el médico..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {doctors.length === 0 ? (
                                                            <SelectItem value="none" disabled>No médicos disponibles</SelectItem>
                                                        ) : (
                                                            doctors.map((d) => <SelectItem key={d.id} value={d.id} className="cursor-pointer">{d.nombre} ({d.ciudad})</SelectItem>)
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Nombre Paciente *</Label>
                                                <Input value={pacienteNombre} onChange={(e) => setPacienteNombre(e.target.value)} placeholder="Ej. Ana Rosas" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                                            </div>

                                            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 space-y-3">
                                                <Label className="flex items-center gap-3 cursor-pointer">
                                                    <input type="checkbox" checked={lucioDelivery} onChange={(e) => setLucioDelivery(e.target.checked)} className="h-5 w-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500" />
                                                    <span className="font-bold text-purple-900 text-sm flex items-center gap-2"><Truck className="w-4 h-4" /> ¿Solicitar Delivery a Lucio?</span>
                                                </Label>
                                                {lucioDelivery && (
                                                    <div className="pl-8 pt-2">
                                                        <Label className="text-xs font-bold text-purple-700 tracking-wider uppercase mb-1 block">Costo Carrera (Bs)</Label>
                                                        <Input type="number" min="0" step="0.01" value={lucioDeliveryPrice} onChange={(e) => setLucioDeliveryPrice(parseFloat(e.target.value) || 0)} className="h-10 border-purple-200 bg-white rounded-lg font-bold" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {tipoVenta === 'ENVIO' && (
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Destino (Departamento) *</Label>
                                                <Select onValueChange={setDepartamento} value={departamento}>
                                                    <SelectTrigger className="h-12 bg-slate-50 rounded-xl border-slate-200 cursor-pointer">
                                                        <SelectValue placeholder="Destino de encomienda" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        {DEPARTAMENTOS_BOLIVIA.map((dep: string) => <SelectItem key={dep} value={dep} className="cursor-pointer font-medium">{dep}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions / Footer */}
                            <div className="p-6 bg-white border-t border-slate-200 shrink-0">
                                <div className="sm:hidden mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
                                    <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Total a Cobrar</span>
                                    <span className="text-3xl font-black text-primary-600">{formatCurrency(cartTotal)}</span>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="flex-1 h-14 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-base cursor-pointer">
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || cart.length === 0}
                                        className="flex-[2] h-14 rounded-xl bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30 text-white font-bold text-lg cursor-pointer transition-transform active:scale-[0.98]"
                                    >
                                        {saving ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Procesando pago...</>
                                        ) : (
                                            <><ShoppingCart className="mr-2 h-5 w-5" /> {editingSaleId ? 'Guardar Cambios' : 'Completar Venta'}</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="p-6 text-center pt-8 bg-white">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Anular Venta</DialogTitle>
                        <DialogDescription className="text-slate-500 text-base">
                            Esta acción revertirá la venta y el stock de los productos volverá al inventario automáticamente.
                        </DialogDescription>
                    </div>
                    <div className="bg-slate-50 p-6 flex justify-stretch gap-3 border-t border-slate-100">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={saving}
                            className="flex-1 rounded-xl font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={saving}
                            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold shadow-lg shadow-rose-600/20 cursor-pointer"
                        >
                            {saving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Anulando...</>
                            ) : (
                                'Sí, anular venta'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden Printable Receipt component */}
            {printingSale && (
                <PrintableReceipt sale={printingSale} />
            )}
        </div>
    )
}
