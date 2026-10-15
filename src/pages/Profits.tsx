import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    Download,
    Loader2,
    CreditCard,
    Banknote,
    Stethoscope,
    Calendar,
    Store,
    Truck,
    FileSpreadsheet,
    Activity,
    Landmark,
    ShieldCheck,
    Filter
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/Dialog'
import { generateBankFinancialReportPDF } from '@/lib/pdfExport'
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
import { formatCurrency, cn } from '@/lib/utils'
import { getSaleItems, Sale } from '@/lib/types'
import { exportAllSalesToExcel, exportTableToExcel, exportLucioTableToExcel } from '@/lib/excelExport'

interface LucioTableRow {
    id: string
    type: 'sale' | 'carrera_doctor'
    date: Date
    sale?: Sale
    doctorName?: string
    doctorCity?: string
    patientName?: string
    deliveryPrice?: number
    saleTotal?: number
    createdByEmail?: string
}

const currentYear = new Date().getFullYear()
const availableYears = [currentYear - 1, currentYear, currentYear + 1]
const months = [
    { value: 'all', label: 'Todos los meses' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
]

const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export default function Profits() {
    const { sales, loading } = useSales()

    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())
    const [exporting, setExporting] = useState(false)

    const monthLabel = months.find(m => m.value === selectedMonth)?.label || ''

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleDate = sale.createdAt
            const yearMatch = saleDate.getFullYear() === parseInt(selectedYear)
            const monthMatch = selectedMonth === 'all' || saleDate.getMonth() + 1 === parseInt(selectedMonth)
            return yearMatch && monthMatch
        })
    }, [sales, selectedMonth, selectedYear])

    const normalSales = useMemo(() => filteredSales.filter(s => s.tipoVenta === 'NORMAL'), [filteredSales])
    const lucioSales = useMemo(() => filteredSales.filter(s => s.tipoVenta === 'LUCIO'), [filteredSales])
    const doctorSales = useMemo(() => filteredSales.filter(s => s.tipoVenta === 'DOCTORES'), [filteredSales])
    const envioSales = useMemo(() => filteredSales.filter(s => s.tipoVenta === 'ENVIO'), [filteredSales])

    const doctorDeliveries = useMemo(() =>
        doctorSales.filter(s => s.lucioDelivery && s.lucioDeliveryPrice && s.lucioDeliveryPrice > 0),
        [doctorSales]
    )

    const lucioTableRows: LucioTableRow[] = useMemo(() => {
        const rows: LucioTableRow[] = []
        lucioSales.forEach(sale => rows.push({ id: sale.id, type: 'sale', date: sale.createdAt, sale }))
        doctorDeliveries.forEach(sale => {
            rows.push({
                id: `carrera-${sale.id}`, type: 'carrera_doctor', date: sale.createdAt,
                doctorName: sale.doctorNombre || '—', doctorCity: sale.doctorCiudad || '—',
                patientName: sale.pacienteNombre || '—', deliveryPrice: sale.lucioDeliveryPrice || 0,
                saleTotal: sale.precioVenta, createdByEmail: sale.createdByEmail,
            })
        })
        return rows.sort((a, b) => b.date.getTime() - a.date.getTime())
    }, [lucioSales, doctorDeliveries])

    const totalGanancias = useMemo(() => filteredSales.reduce((sum, s) => sum + s.precioVenta, 0), [filteredSales])

    const totalNormalQR = useMemo(() => normalSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0), [normalSales])
    const totalNormalCash = useMemo(() => normalSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0), [normalSales])

    const totalLucioQR = useMemo(() => lucioSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0), [lucioSales])
    const totalLucioCash = useMemo(() => lucioSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0), [lucioSales])

    const totalLucioCarreras = useMemo(() => lucioSales.reduce((sum, s) => sum + (s.precioEnvio || 0), 0), [lucioSales])
    const totalLucioCarrerasDoctores = useMemo(() => doctorDeliveries.reduce((sum, s) => sum + (s.lucioDeliveryPrice || 0), 0), [doctorDeliveries])
    const totalAllLucioCarreras = totalLucioCarreras + totalLucioCarrerasDoctores

    const totalDoctores = useMemo(() => doctorSales.reduce((sum, s) => sum + s.precioVenta, 0), [doctorSales])

    const doctorSummary = useMemo(() => {
        const summary: Record<string, { nombre: string; ciudad: string; total: number; count: number }> = {}
        doctorSales.forEach(sale => {
            const key = sale.doctorId || sale.doctorNombre || 'Desconocido'
            if (!summary[key]) {
                summary[key] = { nombre: sale.doctorNombre || '—', ciudad: sale.doctorCiudad || '—', total: 0, count: 0 }
            }
            summary[key].total += sale.precioVenta
            summary[key].count += 1
        })
        return Object.values(summary).sort((a, b) => b.total - a.total)
    }, [doctorSales])

    const totalEnvios = useMemo(() => envioSales.reduce((sum, s) => sum + s.precioVenta, 0), [envioSales])

    const handleExportAll = async () => {
        setExporting(true)
        try {
            exportAllSalesToExcel({ sales: filteredSales, doctorDeliveries, selectedMonth, selectedYear, monthLabel })
        } catch (err) {
            console.error('Error exportando:', err)
            alert('Error al exportar el archivo')
        } finally {
            setExporting(false)
        }
    }

    const handleExportTable = (type: 'normal' | 'lucio' | 'doctores' | 'envios') => {
        if (type === 'lucio') {
            exportLucioTableToExcel(lucioSales, doctorDeliveries, monthLabel, selectedYear)
        } else {
            const salesByType = { normal: normalSales, lucio: lucioSales, doctores: doctorSales, envios: envioSales }
            exportTableToExcel(salesByType[type], type, monthLabel, selectedYear)
        }
    }

    // Modal state for Bank PDF
    const formatDateForInput = (d: Date): string => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [isBankPdfModalOpen, setIsBankPdfModalOpen] = useState(false)
    const [generatingPdf, setGeneratingPdf] = useState(false)

    // Default dates: 1st day of current month to today
    const now = new Date()
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const [bankStartDate, setBankStartDate] = useState<string>(formatDateForInput(firstDayCurrentMonth))
    const [bankEndDate, setBankEndDate] = useState<string>(formatDateForInput(now))

    // Quick range preset applicator
    const applyDatePreset = (preset: 'thisMonth' | 'lastMonth' | '3months' | '6months' | 'thisYear' | 'all') => {
        const today = new Date()
        if (preset === 'thisMonth') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1)
            setBankStartDate(formatDateForInput(start))
            setBankEndDate(formatDateForInput(today))
        } else if (preset === 'lastMonth') {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const end = new Date(today.getFullYear(), today.getMonth(), 0)
            setBankStartDate(formatDateForInput(start))
            setBankEndDate(formatDateForInput(end))
        } else if (preset === '3months') {
            const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
            setBankStartDate(formatDateForInput(start))
            setBankEndDate(formatDateForInput(today))
        } else if (preset === '6months') {
            const start = new Date(today.getFullYear(), today.getMonth() - 5, 1)
            setBankStartDate(formatDateForInput(start))
            setBankEndDate(formatDateForInput(today))
        } else if (preset === 'thisYear') {
            const start = new Date(today.getFullYear(), 0, 1)
            setBankStartDate(formatDateForInput(start))
            setBankEndDate(formatDateForInput(today))
        } else if (preset === 'all') {
            if (sales.length > 0) {
                const earliest = sales.reduce((min, s) => s.createdAt < min ? s.createdAt : min, sales[0].createdAt)
                setBankStartDate(formatDateForInput(earliest))
            } else {
                setBankStartDate('2024-01-01')
            }
            setBankEndDate(formatDateForInput(today))
        }
    }

    // Filtered sales for the modal preview
    const bankFilteredSales = useMemo(() => {
        if (!bankStartDate || !bankEndDate) return []
        const start = new Date(`${bankStartDate}T00:00:00`)
        const end = new Date(`${bankEndDate}T23:59:59.999`)
        return sales.filter(s => {
            const t = s.createdAt.getTime()
            return t >= start.getTime() && t <= end.getTime()
        })
    }, [sales, bankStartDate, bankEndDate])

    const bankTotalRevenue = useMemo(() => bankFilteredSales.reduce((acc, s) => acc + (s.precioVenta || 0), 0), [bankFilteredSales])
    const bankQRSales = useMemo(() => bankFilteredSales.filter(s => s.metodoPago === 'QR'), [bankFilteredSales])
    const bankTotalQR = useMemo(() => bankQRSales.reduce((acc, s) => acc + s.precioVenta, 0), [bankQRSales])
    const bankCashSales = useMemo(() => bankFilteredSales.filter(s => s.metodoPago === 'EFECTIVO'), [bankFilteredSales])
    const bankTotalCash = useMemo(() => bankCashSales.reduce((acc, s) => acc + s.precioVenta, 0), [bankCashSales])

    const handleDownloadBankPDF = () => {
        if (!bankStartDate || !bankEndDate) return
        setGeneratingPdf(true)
        try {
            const start = new Date(`${bankStartDate}T00:00:00`)
            const end = new Date(`${bankEndDate}T23:59:59.999`)
            generateBankFinancialReportPDF({
                startDate: start,
                endDate: end,
                sales: sales,
                companyName: 'Angles Administración',
                systemName: 'Sistema Central de Gestión y Control Operacional Angles',
            })
            setIsBankPdfModalOpen(false)
        } catch (err) {
            console.error('Error generando PDF bancario:', err)
            alert('Error al generar el documento PDF. Por favor intenta nuevamente.')
        } finally {
            setGeneratingPdf(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
                    <p className="mt-4 text-sm font-bold text-slate-500 tracking-widest uppercase">Generando inteligencia...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 w-full pb-12">

            {/* Context Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary-500" /> Rendimiento Financiero
                    </h1>
                    <p className="mt-2 text-slate-500">Analíticas de ventas, comisiones y desglose operacional de la farmacia.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Calendar className="h-5 w-5 text-slate-400 ml-2" />
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px] bg-white border-transparent shadow-sm rounded-xl font-medium cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                                {months.map(m => (
                                    <SelectItem key={m.value} value={m.value} className="cursor-pointer">{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[110px] bg-white border-transparent shadow-sm rounded-xl font-medium cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                                {availableYears.map(y => (
                                    <SelectItem key={y} value={y.toString()} className="cursor-pointer">{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mx-2 hidden sm:block w-px h-8 bg-slate-200" />

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <Button
                            onClick={() => setIsBankPdfModalOpen(true)}
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/25 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700/60"
                        >
                            <Landmark className="h-4 w-4 text-emerald-400" />
                            <span>PDF Oficial Banco</span>
                        </Button>

                        <Button
                            onClick={handleExportAll} disabled={exporting}
                            className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/20 text-white rounded-xl px-4 py-2 text-sm transition-all flex items-center justify-center"
                        >
                            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                            <span>Reporte Maestro</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Premium Metric KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Global KPI */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl overflow-hidden relative group">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp className="w-32 h-32" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <p className="text-primary-100 font-bold tracking-wider text-xs uppercase mb-1 drop-shadow-sm">Total Ingresos</p>
                            <p className="text-3xl lg:text-4xl font-black drop-shadow-md tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-primary-50">
                                {formatCurrency(totalGanancias)}
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                                <span className="text-xs font-medium text-primary-100">{filteredSales.length} transacciones</span>
                                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded backdrop-blur-sm">Mes: {monthLabel}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Normal Sales */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                    <Card className="border-0 shadow-soft bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-1.5 w-full bg-emerald-400" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-700 font-bold text-xs uppercase tracking-wider">
                                    <Store className="h-3.5 w-3.5" /> Normal
                                </div>
                                <span className="text-slate-400 text-xs font-bold">{normalSales.length} vent.</span>
                            </div>
                            <p className="text-2xl font-black text-slate-800">{formatCurrency(totalNormalQR + totalNormalCash)}</p>
                            <div className="mt-3 flex gap-2 text-xs font-semibold">
                                <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded">QR: {formatCurrency(totalNormalQR)}</span>
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Cash: {formatCurrency(totalNormalCash)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Lucio Sales */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                    <Card className="border-0 shadow-soft bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-1.5 w-full bg-blue-500" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1 rounded-lg text-blue-700 font-bold text-xs uppercase tracking-wider">
                                    <CreditCard className="h-3.5 w-3.5" /> Prom. Lucio
                                </div>
                                <span className="text-slate-400 text-xs font-bold">{lucioSales.length} vent.</span>
                            </div>
                            <p className="text-2xl font-black text-slate-800">{formatCurrency(totalLucioQR + totalLucioCash)}</p>
                            <div className="mt-3 flex gap-2 text-xs font-semibold">
                                <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded">QR: {formatCurrency(totalLucioQR)}</span>
                                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded" title="Deuda en efectivo">Deuda: {formatCurrency(totalLucioCash)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Doctores Sales */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                    <Card className="border-0 shadow-soft bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-1.5 w-full bg-purple-500" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 bg-purple-50 px-2.5 py-1 rounded-lg text-purple-700 font-bold text-xs uppercase tracking-wider">
                                    <Stethoscope className="h-3.5 w-3.5" /> Referidos
                                </div>
                                <span className="text-slate-400 text-xs font-bold">{doctorSales.length} vent.</span>
                            </div>
                            <p className="text-2xl font-black text-slate-800">{formatCurrency(totalDoctores)}</p>
                            <div className="mt-3">
                                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs font-semibold">{doctorSummary.length} médicos activos</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Envio Sales */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                    <Card className="border-0 shadow-soft bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-1.5 w-full bg-amber-500" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700 font-bold text-xs uppercase tracking-wider">
                                    <Truck className="h-3.5 w-3.5" /> Provincia
                                </div>
                                <span className="text-slate-400 text-xs font-bold">{envioSales.length} vent.</span>
                            </div>
                            <p className="text-2xl font-black text-slate-800">{formatCurrency(totalEnvios)}</p>
                            <div className="mt-3">
                                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold">Toda Bolivia</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ==============================================================
                LUCIO TABLE
                ============================================================== */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg"><CreditCard className="h-5 w-5 text-blue-600" /></div>
                        Liquidación Promotor Lucio
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleExportTable('lucio')} disabled={lucioTableRows.length === 0} className="shadow-sm border-slate-200">
                        <Download className="mr-2 h-4 w-4" /> Bajar Segmento
                    </Button>
                </CardHeader>
                <CardContent className="p-0">

                    {/* Resumen Interno Lucio */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
                        <div className="bg-white p-5">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">QR Transferido</p>
                            <p className="text-2xl font-black text-blue-600 text-center">{formatCurrency(totalLucioQR)}</p>
                        </div>
                        <div className="bg-white p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500 rounded-bl-3xl" />
                            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1 text-center">Deuda Pendiente (Efec)</p>
                            <p className="text-2xl font-black text-rose-600 text-center">{formatCurrency(totalLucioCash)}</p>
                        </div>
                        <div className="bg-amber-50 p-5 border-l border-amber-100 relative shadow-inner">
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1 text-center">Deuda de Farmacia (Carreras)</p>
                            <p className="text-3xl font-black text-amber-600 text-center drop-shadow-sm">{formatCurrency(totalAllLucioCarreras)}</p>
                            <p className="text-[10px] font-bold text-amber-500 text-center mt-1 uppercase">P.Lucio: {formatCurrency(totalLucioCarreras)} | Docts: {formatCurrency(totalLucioCarrerasDoctores)}</p>
                        </div>
                        <div className="bg-white p-5 border-l border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Delivery de Médicos</p>
                            <p className="text-2xl font-black text-purple-600 text-center">{doctorDeliveries.length}</p>
                        </div>
                    </div>

                    {lucioTableRows.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 bg-slate-50">Sin movimientos registrados para el promotor en esta fecha.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md">
                                    <TableRow className="border-slate-200">
                                        <TableHead className="py-4">Fecha Movimiento</TableHead>
                                        <TableHead className="py-4">Naturaleza</TableHead>
                                        <TableHead className="py-4">Beneficiario/Cliente</TableHead>
                                        <TableHead className="py-4">Detalle / Ítem</TableHead>
                                        <TableHead className="py-4 text-right">Volumen</TableHead>
                                        <TableHead className="py-4 text-right">Costo Carrera</TableHead>
                                        <TableHead className="py-4 text-center">Ingreso</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lucioTableRows.map(row => {
                                        if (row.type === 'sale' && row.sale) {
                                            const sale = row.sale
                                            const items = getSaleItems(sale)
                                            return items.map((item, idx) => (
                                                <TableRow key={`${row.id}-${idx}`} className="group hover:bg-blue-50/30 border-b border-slate-50">
                                                    <TableCell className="text-sm font-medium text-slate-500 whitespace-nowrap px-4 py-3">
                                                        {idx === 0 ? formatDateTime(row.date) : ''}
                                                    </TableCell>
                                                    <TableCell>
                                                        {idx === 0 && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                                <CreditCard className="h-3.5 w-3.5" /> Venta Lucio
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-slate-700">{idx === 0 ? (sale.clienteNombre || 'Consumidor Final') : ''}</TableCell>
                                                    <TableCell className="text-slate-600 font-medium">{item.productName}</TableCell>
                                                    <TableCell className="font-black text-right text-slate-800">{formatCurrency(item.lineTotal)}</TableCell>
                                                    <TableCell className="text-right font-medium text-amber-600">{idx === 0 ? formatCurrency(sale.precioEnvio || 0) : ''}</TableCell>
                                                    <TableCell className="text-center">
                                                        {idx === 0 && (
                                                            <span className={cn(
                                                                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold border',
                                                                sale.metodoPago === 'QR' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                                            )}>
                                                                {sale.metodoPago === 'QR' ? <CreditCard className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}
                                                                {sale.metodoPago}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        } else if (row.type === 'carrera_doctor') {
                                            return (
                                                <TableRow key={row.id} className="bg-purple-50/40 hover:bg-purple-50 transition-colors border-b border-purple-100">
                                                    <TableCell className="text-sm font-medium text-purple-800 whitespace-nowrap px-4 py-3">
                                                        {formatDateTime(row.date)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                                                            <Truck className="h-3.5 w-3.5" /> Carrera Doctor
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-purple-900">
                                                        {row.doctorName}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-purple-700 font-medium">
                                                        Pac: {row.patientName} <span className="text-purple-400 font-normal block text-xs">(Venta Base: {formatCurrency(row.saleTotal || 0)})</span>
                                                    </TableCell>
                                                    <TableCell className="text-right"><span className="text-slate-300">-</span></TableCell>
                                                    <TableCell className="font-black text-right text-amber-600 bg-amber-50/50">
                                                        {formatCurrency(row.deliveryPrice || 0)}
                                                    </TableCell>
                                                    <TableCell className="text-center"><span className="text-slate-300">-</span></TableCell>
                                                </TableRow>
                                            )
                                        }
                                        return null
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ==============================================================
                DOCTORES TABLE
                ============================================================== */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg"><Stethoscope className="h-5 w-5 text-purple-600" /></div>
                        Ventas Referidas de Doctores
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <span className="font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-xl border border-purple-100">
                            {formatCurrency(totalDoctores)}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleExportTable('doctores')} disabled={doctorSales.length === 0} className="shadow-sm border-slate-200">
                            <Download className="mr-2 h-4 w-4" /> Bajar Segmento
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {doctorSummary.length > 0 && (
                        <div className="bg-slate-50 border-b border-slate-100 p-5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ranking de Médicos</h4>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {doctorSummary.map((doc, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 text-sm truncate max-w-[140px]">{doc.nombre}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.count} Ventas</span>
                                        </div>
                                        <span className="text-purple-600 font-black text-lg">{formatCurrency(doc.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {doctorSales.length === 0 ? (
                        <div className="py-16 text-center text-slate-500 bg-white">Sin intervenciones médicas en este bloque.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md">
                                    <TableRow className="border-slate-200">
                                        <TableHead className="py-4">Transacción</TableHead>
                                        <TableHead className="py-4">Médico Tratante</TableHead>
                                        <TableHead className="py-4">Posología / Producto</TableHead>
                                        <TableHead className="py-4 text-center">Cant.</TableHead>
                                        <TableHead className="py-4 text-right">Facturado</TableHead>
                                        <TableHead className="py-4 text-center">Logística</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {doctorSales.flatMap(sale => {
                                        const items = getSaleItems(sale)
                                        return items.map((item, idx) => (
                                            <TableRow key={`${sale.id}-${idx}`} className="group hover:bg-slate-50/50 border-b border-slate-50 transition-colors">
                                                <TableCell className="text-sm font-medium text-slate-500 px-4 py-3">
                                                    {idx === 0 && (
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-800 font-bold">{formatDateTime(sale.createdAt).split(',')[0]}</span>
                                                            <span className="text-xs font-medium text-slate-400">{formatDateTime(sale.createdAt).split(',')[1]}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {idx === 0 && (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-purple-700">{sale.doctorNombre || '—'}</span>
                                                            <span className="text-xs text-slate-400 font-medium">Pac: {sale.pacienteNombre}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-700">{item.productName}</TableCell>
                                                <TableCell className="text-center font-bold text-slate-600 bg-slate-50/30">{item.quantity}</TableCell>
                                                <TableCell className="font-black text-right text-slate-800">{formatCurrency(item.lineTotal)}</TableCell>
                                                <TableCell className="text-center">
                                                    {idx === 0 && (
                                                        sale.lucioDelivery ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700" title="Delivery con Promotor">
                                                                <Truck className="h-3.5 w-3.5" />
                                                                Entregado ({formatCurrency(sale.lucioDeliveryPrice || 0)})
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-400">
                                                                Mostrador
                                                            </span>
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* We omit NORMAL and ENVIOS tables in explicit UI for brevity but they follow exactly same structure, I included them previously but the core Dashboard looks extremely complete now with global stats and Lucio/Doctor breakdowns which are the main focus point. Let's add them as compact tables below for data completeness. */}

            <div className="grid xl:grid-cols-2 gap-8">
                {/* NORMAL TABLE COMPACT */}
                <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Store className="h-5 w-5 text-emerald-500" /> Venta Mostrador
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleExportTable('normal')} disabled={normalSales.length === 0}><Download className="h-4 w-4 text-emerald-600" /></Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {normalSales.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-400">Sin datos</div>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md">
                                        <TableRow><TableHead>Día</TableHead><TableHead>Ítem</TableHead><TableHead className="text-right">Monto</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {normalSales.flatMap(sale => getSaleItems(sale).map((item, idx) => (
                                            <TableRow key={`${sale.id}-${idx}`} className="border-b border-slate-50">
                                                <TableCell className="text-xs text-slate-400">{idx === 0 ? formatDateTime(sale.createdAt).split(',')[0] : ''}</TableCell>
                                                <TableCell className="text-sm font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-sm font-bold text-right text-emerald-600">{formatCurrency(item.lineTotal)}</TableCell>
                                            </TableRow>
                                        )))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ENVIOS TABLE COMPACT */}
                <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-4">
                        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-amber-500" /> Encomiendas
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleExportTable('envios')} disabled={envioSales.length === 0}><Download className="h-4 w-4 text-amber-600" /></Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {envioSales.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-400">Sin datos</div>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md">
                                        <TableRow><TableHead>Día</TableHead><TableHead>Destino | Ítem</TableHead><TableHead className="text-right">Monto</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {envioSales.flatMap(sale => getSaleItems(sale).map((item, idx) => (
                                            <TableRow key={`${sale.id}-${idx}`} className="border-b border-slate-50">
                                                <TableCell className="text-xs text-slate-400">{idx === 0 ? formatDateTime(sale.createdAt).split(',')[0] : ''}</TableCell>
                                                <TableCell className="text-sm font-medium">
                                                    {idx === 0 ? <span className="font-bold text-amber-700 block text-xs bg-amber-50 w-max px-1 rounded mb-0.5">{sale.departamento}</span> : null}
                                                    {item.productName}
                                                </TableCell>
                                                <TableCell className="text-sm font-bold text-right text-amber-600">{formatCurrency(item.lineTotal)}</TableCell>
                                            </TableRow>
                                        )))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Descarga de PDF Bancario Oficial */}
            <Dialog open={isBankPdfModalOpen} onOpenChange={setIsBankPdfModalOpen}>
                <DialogContent className="max-w-2xl p-6 rounded-2xl bg-white shadow-2xl border border-slate-100">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20">
                                <Landmark className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">
                                    Reporte Oficial para Banco (PDF)
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Angles Administración — Estado formal de ingresos y conciliación de ventas con código de auditoría.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Presets de Rango */}
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                                <Filter className="h-3.5 w-3.5 text-primary-500" /> Rangos Rápidos
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => applyDatePreset('thisMonth')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    Este Mes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyDatePreset('lastMonth')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    Mes Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyDatePreset('3months')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    Últimos 3 Meses
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyDatePreset('6months')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    Últimos 6 Meses
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyDatePreset('thisYear')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    Año Actual ({currentYear})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyDatePreset('all')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors"
                                >
                                    Todo el Histórico
                                </button>
                            </div>
                        </div>

                        {/* Selectores de Fechas Personalizadas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    Fecha Inicial (Desde):
                                </label>
                                <input
                                    type="date"
                                    value={bankStartDate}
                                    onChange={(e) => setBankStartDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                    Fecha Final (Hasta):
                                </label>
                                <input
                                    type="date"
                                    value={bankEndDate}
                                    onChange={(e) => setBankEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                        </div>

                        {/* Previsualización en Vivo de Datos Seleccionados */}
                        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                                    Previsualización de Operaciones
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    {bankFilteredSales.length} transacciones encontradas
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Ingresos Brutos</p>
                                    <p className="text-base font-extrabold text-white">{formatCurrency(bankTotalRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-400 uppercase font-semibold">QR Bancario</p>
                                    <p className="text-sm font-bold text-emerald-300">
                                        {formatCurrency(bankTotalQR)}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {bankTotalRevenue > 0 ? ((bankTotalQR / bankTotalRevenue) * 100).toFixed(1) : 0}% del total
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Efectivo en Caja</p>
                                    <p className="text-sm font-bold text-slate-200">
                                        {formatCurrency(bankTotalCash)}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {bankTotalRevenue > 0 ? ((bankTotalCash / bankTotalRevenue) * 100).toFixed(1) : 0}% del total
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-rose-400 uppercase font-semibold">Carreras Lucio</p>
                                    <p className="text-sm font-bold text-rose-300">
                                        {formatCurrency(bankFilteredSales.reduce((sum, s) => sum + (s.precioEnvio || (s.lucioDelivery ? s.lucioDeliveryPrice || 0 : 0)), 0))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Banner de Garantía y Trazabilidad Institucional */}
                        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
                            <ShieldCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-900 leading-relaxed">
                                <p className="font-bold text-blue-950 mb-0.5">Certificación Oficial para el Banco:</p>
                                <p>
                                    El documento se emite con orientación horizontal (apaisado) con membrete de <strong>Angles Administración</strong>, código hash determinístico de auditoría, registro cronológico inmutable de Cloud Firestore, desglose de clientes, médicos, pacientes y sección de firmas formales.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsBankPdfModalOpen(false)}
                            className="rounded-xl border-slate-200 text-slate-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDownloadBankPDF}
                            disabled={generatingPdf || bankFilteredSales.length === 0}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md font-semibold px-6 flex items-center justify-center gap-2"
                        >
                            {generatingPdf ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                                    <span>Generando Dictamen PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 text-emerald-400" />
                                    <span>Descargar PDF Oficial</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
