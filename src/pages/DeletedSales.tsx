import { Trash2, Loader2, Zap, RefreshCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table'
import { useSales } from '@/hooks/useSales'
import { formatCurrency, formatShortDate, cn } from '@/lib/utils'

export default function DeletedSales() {
    const { deletedSales, loading: loadingSales } = useSales()

    const getSaleTypeBadge = (tipo: string) => {
        switch (tipo) {
            case 'LUCIO':
                return 'bg-blue-50 text-blue-700 border-blue-100'
            case 'DOCTORES':
                return 'bg-purple-50 text-purple-700 border-purple-100'
            case 'ENVIO':
                return 'bg-amber-50 text-amber-700 border-amber-100'
            default:
                return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        }
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ventas Eliminadas</h1>
                <p className="mt-2 text-slate-500">Historial de transacciones anuladas y devoluciones de stock al inventario.</p>
            </div>

            {/* Info card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-400" />
                    <CardContent className="flex items-start sm:items-center gap-4 p-5">
                        <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-sky-50 mt-1 sm:mt-0">
                            <RefreshCcw className="h-5 w-5 text-sky-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Acerca del stock</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                                El stock se restaura automáticamente al eliminar ventas de inventario. Las ventas rápidas (<Zap className="w-3 h-3 inline text-amber-500" />) no afectan el stock.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Deleted Sales table */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl overflow-hidden rounded-2xl mt-8">
                <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Trash2 className="h-5 w-5 text-rose-500" />
                        Historial de Eliminaciones ({deletedSales.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingSales ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <Loader2 className="mx-auto h-10 w-10 animate-spin text-rose-500 mb-4" />
                            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Cargando anulaciones...</p>
                        </div>
                    ) : deletedSales.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Trash2 className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No hay ventas anuladas</h3>
                            <p className="mt-2 text-slate-500 max-w-sm">
                                Todo está en orden. Las transacciones que elimines desde el módulo de Ventas aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-semibold text-slate-600 py-4 px-6 hidden sm:table-cell">Eliminación</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Tipo</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Producto</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 text-center">Cant.</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 text-right">Total Pérdida</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 text-center">Estado Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {deletedSales.map((sale, index) => (
                                            <motion.tr
                                                key={sale.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                                                className="group border-b border-slate-50 hover:bg-rose-50/30 transition-colors"
                                            >
                                                <TableCell className="text-sm px-6 py-4 hidden sm:table-cell">
                                                    <div className="flex flex-col">
                                                        <span className="text-rose-600 font-bold">{formatShortDate(sale.deletedAt)}</span>
                                                        <span className="text-xs text-slate-400 mt-0.5" title="Fecha original de venta">Emitido: {formatShortDate(sale.createdAt)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        'inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-bold border',
                                                        getSaleTypeBadge(sale.tipoVenta)
                                                    )}>
                                                        {sale.tipoVenta}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {sale.esVentaRapida ? (
                                                            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                                                                <Zap className="h-4 w-4 text-amber-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                                <RefreshCcw className="h-4 w-4 text-slate-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-slate-800 line-through decoration-slate-300">
                                                            {sale.productoNombre}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-slate-600">
                                                    {sale.cantidad}
                                                </TableCell>
                                                <TableCell className="font-black text-right text-rose-600">
                                                    {formatCurrency(sale.precioVenta)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {sale.esVentaRapida ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">
                                                            No aplica
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold">
                                                            <RefreshCcw className="h-3.5 w-3.5" />
                                                            Restaurado (+{sale.cantidad})
                                                        </span>
                                                    )}
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
        </div>
    )
}
