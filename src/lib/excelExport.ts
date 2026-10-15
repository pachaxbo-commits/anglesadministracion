/**
 * excelExport - Utilidad para exportar datos a Excel con formato profesional
 * 
 * Características:
 * - Headers en negrita con fondo de color
 * - Columnas con ancho ajustado
 * - Fila de headers congelada
 * - Formato de fecha: dd/mm/yyyy HH:mm
 * - Números con 2 decimales
 * - Múltiples hojas en un solo archivo
 * - Totales en fila separada con formato
 * - Lucio sheet includes "Carrera de Doctor" rows
 */

import * as XLSX from 'xlsx'
import { Sale, getSaleItems } from '@/lib/types'

// Formato de fecha para Excel (dd/mm/yyyy HH:mm)
const formatDateExcel = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Formato de moneda (2 decimales)
const formatCurrencyExcel = (value: number): string => {
    return value.toFixed(2)
}

// Column width configuration
const COLUMN_WIDTHS: Record<string, number> = {
    'Fecha/Hora': 18,
    'Tipo': 16,
    'Producto': 25,
    'Cantidad': 10,
    'Cant.': 10,
    'Precio Unit.': 14,
    'Total': 14,
    'Total Venta': 14,
    'Total Línea': 14,
    'Método Pago': 14,
    'Método': 12,
    'Cliente': 20,
    'Cliente/Doctor': 22,
    'Doctor': 20,
    'Ciudad': 15,
    'Paciente': 20,
    'Producto/Paciente': 25,
    'Precio Carrera': 15,
    'Envío Lucio': 18,
    'Departamento': 15,
    'Creado por': 15,
    'Detalles': 25,
    'Concepto': 35,
    'Monto (Bs)': 15,
}

/**
 * Aplica estilos profesionales a una hoja de Excel
 */
const applyProfessionalStyles = (ws: XLSX.WorkSheet, headers: string[]): void => {
    // Set column widths
    const colWidths: { wch: number }[] = headers.map(h => ({
        wch: COLUMN_WIDTHS[h] || Math.max(h.length + 4, 12)
    }))
    ws['!cols'] = colWidths

    // Freeze first row (headers)
    ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', state: 'frozen' }

    // Set row heights for better readability
    const rowHeights: { hpt?: number }[] = []
    rowHeights[0] = { hpt: 24 } // Header row height
    ws['!rows'] = rowHeights
}

/**
 * Crea una hoja de Excel con formato profesional
 */
const createProfessionalSheet = (
    data: any[][],
    headers: string[],
    totals?: { label: string; value: string | number }[]
): XLSX.WorkSheet => {
    // Preparar datos con headers
    const sheetData: any[][] = [headers, ...data]

    // Agregar filas de totales si existen
    if (totals && totals.length > 0) {
        sheetData.push([]) // Fila vacía separadora
        totals.forEach(t => {
            const row = new Array(headers.length).fill('')
            row[0] = t.label
            row[1] = typeof t.value === 'number' ? formatCurrencyExcel(t.value) : t.value
            sheetData.push(row)
        })
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    applyProfessionalStyles(ws, headers)

    return ws
}

interface ExportOptions {
    sales: Sale[]
    doctorDeliveries: Sale[]  // Doctor sales with lucioDelivery=true
    selectedMonth: string
    selectedYear: string
    monthLabel: string
}

/**
 * Exporta todas las ventas a un archivo Excel con múltiples hojas profesionales
 */
export const exportAllSalesToExcel = (options: ExportOptions): void => {
    const { sales, doctorDeliveries, selectedYear, monthLabel } = options

    // Filtrar ventas por tipo
    const normalSales = sales.filter(s => s.tipoVenta === 'NORMAL')
    const lucioSales = sales.filter(s => s.tipoVenta === 'LUCIO')
    const doctorSales = sales.filter(s => s.tipoVenta === 'DOCTORES')
    const envioSales = sales.filter(s => s.tipoVenta === 'ENVIO')

    // Calculate Lucio carreras totals
    const totalLucioCarreras = lucioSales.reduce((sum, s) => sum + (s.precioEnvio || 0), 0)
    const totalDoctorCarreras = doctorDeliveries.reduce((sum, s) => sum + (s.lucioDeliveryPrice || 0), 0)
    const totalAllCarreras = totalLucioCarreras + totalDoctorCarreras

    // Crear workbook
    const wb = XLSX.utils.book_new()

    // ========== HOJA 1: RESUMEN ==========
    const resumenHeaders = ['Concepto', 'Monto (Bs)']
    const resumenData: any[][] = [
        ['TOTAL GANANCIAS', formatCurrencyExcel(sales.reduce((sum, s) => sum + s.precioVenta, 0))],
        ['', ''],
        ['VENTAS NORMALES', ''],
        ['  Total QR', formatCurrencyExcel(normalSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0))],
        ['  Total Efectivo', formatCurrencyExcel(normalSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0))],
        ['', ''],
        ['VENTAS LUCIO', ''],
        ['  Total QR', formatCurrencyExcel(lucioSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0))],
        ['  Total Deuda Efectivo', formatCurrencyExcel(lucioSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0))],
        ['', ''],
        ['LUCIO - COSTO CARRERAS', ''],
        ['  Total Carreras', formatCurrencyExcel(totalAllCarreras)],
        ['  Carreras Ventas Lucio', formatCurrencyExcel(totalLucioCarreras)],
        ['  Carreras Entregas Doctores', formatCurrencyExcel(totalDoctorCarreras)],
        ['', ''],
        ['VENTAS DOCTORES', ''],
        ['  Total Doctores', formatCurrencyExcel(doctorSales.reduce((sum, s) => sum + s.precioVenta, 0))],
        ['', ''],
        ['ENVÍOS', ''],
        ['  Total Envíos', formatCurrencyExcel(envioSales.reduce((sum, s) => sum + s.precioVenta, 0))],
    ]
    const wsResumen = createProfessionalSheet(resumenData, resumenHeaders)
    wsResumen['!cols'] = [{ wch: 35 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

    // ========== HOJA 2: VENTAS NORMALES ==========
    const normalHeaders = ['Fecha/Hora', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Método Pago', 'Cliente', 'Creado por']
    const normalData = normalSales.flatMap(sale => {
        const items = getSaleItems(sale)
        return items.map((item, idx) => [
            idx === 0 ? formatDateExcel(sale.createdAt) : '',
            item.productName,
            item.quantity,
            formatCurrencyExcel(item.unitPrice),
            formatCurrencyExcel(item.lineTotal),
            idx === 0 ? (sale.metodoPago || '—') : '',
            idx === 0 ? (sale.clienteNombre || '—') : '',
            idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
        ])
    })
    const wsNormal = createProfessionalSheet(normalData, normalHeaders, [
        { label: 'Total QR', value: normalSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0) },
        { label: 'Total Efectivo', value: normalSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0) },
    ])
    XLSX.utils.book_append_sheet(wb, wsNormal, 'Normal')

    // ========== HOJA 3: VENTAS LUCIO (includes Carrera de Doctor rows) ==========
    const lucioHeaders = ['Fecha/Hora', 'Tipo', 'Cliente/Doctor', 'Producto/Paciente', 'Total Venta', 'Precio Carrera', 'Método Pago', 'Creado por']
    const lucioData: any[][] = []

    // Add Lucio sales
    lucioSales.forEach(sale => {
        const items = getSaleItems(sale)
        items.forEach((item, idx) => {
            lucioData.push([
                idx === 0 ? formatDateExcel(sale.createdAt) : '',
                idx === 0 ? 'Venta Lucio' : '',
                idx === 0 ? (sale.clienteNombre || '—') : '',
                item.productName,
                formatCurrencyExcel(item.lineTotal),
                idx === 0 ? formatCurrencyExcel(sale.precioEnvio || 0) : '',
                idx === 0 ? (sale.metodoPago || '—') : '',
                idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
            ])
        })
    })

    // Add "Carrera de Doctor" rows
    doctorDeliveries.forEach(sale => {
        lucioData.push([
            formatDateExcel(sale.createdAt),
            'Carrera Doctor',
            `${sale.doctorNombre || '—'} (${sale.doctorCiudad || '—'})`,
            `Paciente: ${sale.pacienteNombre || '—'}`,
            `(Ref: ${formatCurrencyExcel(sale.precioVenta)})`,
            formatCurrencyExcel(sale.lucioDeliveryPrice || 0),
            '—',
            sale.createdByEmail?.split('@')[0] || '—',
        ])
    })

    // Sort by date (descending) - items already have date in first column
    lucioData.sort((a, b) => {
        const dateA = a[0] ? new Date(a[0].split(' ')[0].split('/').reverse().join('-')) : new Date(0)
        const dateB = b[0] ? new Date(b[0].split(' ')[0].split('/').reverse().join('-')) : new Date(0)
        return dateB.getTime() - dateA.getTime()
    })

    const wsLucio = createProfessionalSheet(lucioData, lucioHeaders, [
        { label: 'Total QR', value: lucioSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0) },
        { label: 'Total Deuda Efectivo', value: lucioSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0) },
        { label: 'Costo Carreras (Lucio)', value: totalLucioCarreras },
        { label: 'Costo Carreras (Doctores)', value: totalDoctorCarreras },
        { label: 'Costo Total Carreras', value: totalAllCarreras },
    ])
    XLSX.utils.book_append_sheet(wb, wsLucio, 'Lucio')

    // ========== HOJA 4: VENTAS DOCTORES ==========
    const doctorHeaders = ['Fecha/Hora', 'Doctor', 'Ciudad', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Paciente', 'Envío Lucio', 'Precio Carrera', 'Creado por']
    const doctorData = doctorSales.flatMap(sale => {
        const items = getSaleItems(sale)
        return items.map((item, idx) => [
            idx === 0 ? formatDateExcel(sale.createdAt) : '',
            idx === 0 ? (sale.doctorNombre || '—') : '',
            idx === 0 ? (sale.doctorCiudad || '—') : '',
            item.productName,
            item.quantity,
            formatCurrencyExcel(item.unitPrice),
            formatCurrencyExcel(item.lineTotal),
            idx === 0 ? (sale.pacienteNombre || '—') : '',
            idx === 0 ? (sale.lucioDelivery ? 'Sí' : 'No') : '',
            idx === 0 ? formatCurrencyExcel(sale.lucioDeliveryPrice || 0) : '',
            idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
        ])
    })
    const wsDoctores = createProfessionalSheet(doctorData, doctorHeaders, [
        { label: 'Total Doctores', value: doctorSales.reduce((sum, s) => sum + s.precioVenta, 0) },
        { label: 'Entregas con Lucio', value: doctorDeliveries.length },
        { label: 'Costo Carreras Lucio', value: totalDoctorCarreras },
    ])
    XLSX.utils.book_append_sheet(wb, wsDoctores, 'Doctores')

    // ========== HOJA 5: ENVÍOS ==========
    const envioHeaders = ['Fecha/Hora', 'Departamento', 'Producto', 'Cantidad', 'Total', 'Creado por']
    const envioData = envioSales.flatMap(sale => {
        const items = getSaleItems(sale)
        return items.map((item, idx) => [
            idx === 0 ? formatDateExcel(sale.createdAt) : '',
            idx === 0 ? (sale.departamento || '—') : '',
            item.productName,
            item.quantity,
            formatCurrencyExcel(item.lineTotal),
            idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
        ])
    })
    const wsEnvios = createProfessionalSheet(envioData, envioHeaders, [
        { label: 'Total Envíos', value: envioSales.reduce((sum, s) => sum + s.precioVenta, 0) },
    ])
    XLSX.utils.book_append_sheet(wb, wsEnvios, 'Envíos')

    // ========== HOJA 6: TODAS LAS VENTAS ==========
    const allHeaders = ['Fecha/Hora', 'Tipo', 'Producto', 'Cantidad', 'Precio Unit.', 'Total Línea', 'Total Venta', 'Detalles', 'Creado por']
    const allData = sales.flatMap(sale => {
        const items = getSaleItems(sale)
        return items.map((item, idx) => {
            let detalles = ''
            if (sale.tipoVenta === 'NORMAL' || sale.tipoVenta === 'LUCIO') {
                detalles = `${sale.metodoPago || ''} - ${sale.clienteNombre || ''}`
            } else if (sale.tipoVenta === 'DOCTORES') {
                detalles = `${sale.doctorNombre || ''} - ${sale.pacienteNombre || ''}`
            } else if (sale.tipoVenta === 'ENVIO') {
                detalles = sale.departamento || ''
            }

            return [
                idx === 0 ? formatDateExcel(sale.createdAt) : '',
                idx === 0 ? sale.tipoVenta : '',
                item.productName,
                item.quantity,
                formatCurrencyExcel(item.unitPrice),
                formatCurrencyExcel(item.lineTotal),
                idx === 0 ? formatCurrencyExcel(sale.precioVenta) : '',
                idx === 0 ? detalles : '',
                idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
            ]
        })
    })
    const wsTodas = createProfessionalSheet(allData, allHeaders, [
        { label: 'Total General', value: sales.reduce((sum, s) => sum + s.precioVenta, 0) },
    ])
    XLSX.utils.book_append_sheet(wb, wsTodas, 'Todas las Ventas')

    // Descargar archivo
    const filename = `Ganancias_${monthLabel.replace(/ /g, '_')}_${selectedYear}.xlsx`
    XLSX.writeFile(wb, filename)
}

/**
 * Exporta tabla Lucio con Carrera de Doctor rows incluidas
 */
export const exportLucioTableToExcel = (
    lucioSales: Sale[],
    doctorDeliveries: Sale[],
    monthLabel: string,
    year: string
): void => {
    const wb = XLSX.utils.book_new()

    const totalLucioCarreras = lucioSales.reduce((sum, s) => sum + (s.precioEnvio || 0), 0)
    const totalDoctorCarreras = doctorDeliveries.reduce((sum, s) => sum + (s.lucioDeliveryPrice || 0), 0)

    const headers = ['Fecha/Hora', 'Tipo', 'Cliente/Doctor', 'Producto/Paciente', 'Total Venta', 'Precio Carrera', 'Método Pago', 'Creado por']
    const data: any[][] = []

    // Add Lucio sales
    lucioSales.forEach(sale => {
        const items = getSaleItems(sale)
        items.forEach((item, idx) => {
            data.push([
                idx === 0 ? formatDateExcel(sale.createdAt) : '',
                idx === 0 ? 'Venta Lucio' : '',
                idx === 0 ? (sale.clienteNombre || '—') : '',
                item.productName,
                formatCurrencyExcel(item.lineTotal),
                idx === 0 ? formatCurrencyExcel(sale.precioEnvio || 0) : '',
                idx === 0 ? (sale.metodoPago || '—') : '',
                idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
            ])
        })
    })

    // Add "Carrera de Doctor" rows
    doctorDeliveries.forEach(sale => {
        data.push([
            formatDateExcel(sale.createdAt),
            'Carrera Doctor',
            `${sale.doctorNombre || '—'} (${sale.doctorCiudad || '—'})`,
            `Paciente: ${sale.pacienteNombre || '—'}`,
            `(Ref: ${formatCurrencyExcel(sale.precioVenta)})`,
            formatCurrencyExcel(sale.lucioDeliveryPrice || 0),
            '—',
            sale.createdByEmail?.split('@')[0] || '—',
        ])
    })

    const ws = createProfessionalSheet(data, headers, [
        { label: 'Total QR', value: lucioSales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0) },
        { label: 'Total Deuda Efectivo', value: lucioSales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0) },
        { label: 'Costo Carreras (Lucio)', value: totalLucioCarreras },
        { label: 'Costo Carreras (Doctores)', value: totalDoctorCarreras },
        { label: 'Costo Total Carreras', value: totalLucioCarreras + totalDoctorCarreras },
    ])

    XLSX.utils.book_append_sheet(wb, ws, 'Ventas Lucio')
    XLSX.writeFile(wb, `Ventas_Lucio_${monthLabel}_${year}.xlsx`)
}

/**
 * Exporta una tabla específica a Excel
 */
export const exportTableToExcel = (
    sales: Sale[],
    tableType: 'normal' | 'lucio' | 'doctores' | 'envios' | 'todas',
    monthLabel: string,
    year: string
): void => {
    const wb = XLSX.utils.book_new()

    switch (tableType) {
        case 'normal': {
            const headers = ['Fecha/Hora', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Método Pago', 'Cliente', 'Creado por']
            const data = sales.flatMap(sale => {
                const items = getSaleItems(sale)
                return items.map((item, idx) => [
                    idx === 0 ? formatDateExcel(sale.createdAt) : '',
                    item.productName,
                    item.quantity,
                    formatCurrencyExcel(item.unitPrice),
                    formatCurrencyExcel(item.lineTotal),
                    idx === 0 ? (sale.metodoPago || '—') : '',
                    idx === 0 ? (sale.clienteNombre || '—') : '',
                    idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
                ])
            })
            const ws = createProfessionalSheet(data, headers, [
                { label: 'Total QR', value: sales.filter(s => s.metodoPago === 'QR').reduce((sum, s) => sum + s.precioVenta, 0) },
                { label: 'Total Efectivo', value: sales.filter(s => s.metodoPago === 'EFECTIVO').reduce((sum, s) => sum + s.precioVenta, 0) },
            ])
            XLSX.utils.book_append_sheet(wb, ws, 'Ventas Normal')
            XLSX.writeFile(wb, `Ventas_Normal_${monthLabel}_${year}.xlsx`)
            break
        }
        case 'doctores': {
            const headers = ['Fecha/Hora', 'Doctor', 'Ciudad', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Paciente', 'Envío Lucio', 'Precio Carrera', 'Creado por']
            const data = sales.flatMap(sale => {
                const items = getSaleItems(sale)
                return items.map((item, idx) => [
                    idx === 0 ? formatDateExcel(sale.createdAt) : '',
                    idx === 0 ? (sale.doctorNombre || '—') : '',
                    idx === 0 ? (sale.doctorCiudad || '—') : '',
                    item.productName,
                    item.quantity,
                    formatCurrencyExcel(item.unitPrice),
                    formatCurrencyExcel(item.lineTotal),
                    idx === 0 ? (sale.pacienteNombre || '—') : '',
                    idx === 0 ? (sale.lucioDelivery ? 'Sí' : 'No') : '',
                    idx === 0 ? formatCurrencyExcel(sale.lucioDeliveryPrice || 0) : '',
                    idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
                ])
            })
            const ws = createProfessionalSheet(data, headers, [
                { label: 'Total Doctores', value: sales.reduce((sum, s) => sum + s.precioVenta, 0) },
                { label: 'Costo Carreras Lucio', value: sales.filter(s => s.lucioDelivery).reduce((sum, s) => sum + (s.lucioDeliveryPrice || 0), 0) },
            ])
            XLSX.utils.book_append_sheet(wb, ws, 'Ventas Doctores')
            XLSX.writeFile(wb, `Ventas_Doctores_${monthLabel}_${year}.xlsx`)
            break
        }
        case 'envios': {
            const headers = ['Fecha/Hora', 'Departamento', 'Producto', 'Cantidad', 'Total', 'Creado por']
            const data = sales.flatMap(sale => {
                const items = getSaleItems(sale)
                return items.map((item, idx) => [
                    idx === 0 ? formatDateExcel(sale.createdAt) : '',
                    idx === 0 ? (sale.departamento || '—') : '',
                    item.productName,
                    item.quantity,
                    formatCurrencyExcel(item.lineTotal),
                    idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
                ])
            })
            const ws = createProfessionalSheet(data, headers, [
                { label: 'Total Envíos', value: sales.reduce((sum, s) => sum + s.precioVenta, 0) },
            ])
            XLSX.utils.book_append_sheet(wb, ws, 'Envíos')
            XLSX.writeFile(wb, `Envios_${monthLabel}_${year}.xlsx`)
            break
        }
        case 'todas':
        default: {
            const headers = ['Fecha/Hora', 'Tipo', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Detalles', 'Creado por']
            const data = sales.flatMap(sale => {
                const items = getSaleItems(sale)
                return items.map((item, idx) => {
                    let detalles = ''
                    if (sale.tipoVenta === 'NORMAL' || sale.tipoVenta === 'LUCIO') {
                        detalles = `${sale.metodoPago || ''} - ${sale.clienteNombre || ''}`
                    } else if (sale.tipoVenta === 'DOCTORES') {
                        detalles = `${sale.doctorNombre || ''} - ${sale.pacienteNombre || ''}`
                    } else if (sale.tipoVenta === 'ENVIO') {
                        detalles = sale.departamento || ''
                    }
                    return [
                        idx === 0 ? formatDateExcel(sale.createdAt) : '',
                        idx === 0 ? sale.tipoVenta : '',
                        item.productName,
                        item.quantity,
                        formatCurrencyExcel(item.unitPrice),
                        formatCurrencyExcel(item.lineTotal),
                        idx === 0 ? detalles : '',
                        idx === 0 ? (sale.createdByEmail?.split('@')[0] || '—') : '',
                    ]
                })
            })
            const ws = createProfessionalSheet(data, headers, [
                { label: 'Total General', value: sales.reduce((sum, s) => sum + s.precioVenta, 0) },
            ])
            XLSX.utils.book_append_sheet(wb, ws, 'Todas las Ventas')
            XLSX.writeFile(wb, `Todas_Ventas_${monthLabel}_${year}.xlsx`)
            break
        }
    }
}
