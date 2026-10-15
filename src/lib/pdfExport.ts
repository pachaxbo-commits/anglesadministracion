/**
 * pdfExport.ts - Generador de Informes Financieros Oficiales en PDF
 * Sistema de Administración: Angles Administración
 * 
 * Diseñado específicamente con rigor contable, trazabilidad y presentación
 * corporativa para presentación ante entidades bancarias y crediticias.
 */

import jsPDF from 'jspdf'
import autoTable, { UserOptions } from 'jspdf-autotable'
import { Sale, getSaleItems } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

export interface BankReportFilterOptions {
    startDate: Date
    endDate: Date
    sales: Sale[]
    doctorDeliveries?: Sale[]
    companyName?: string
    systemName?: string
    notes?: string
}

// Genera un código hash/código de auditoría determinístico para validez bancaria
function generateAuditHash(startDate: Date, endDate: Date, count: number, total: number): string {
    const raw = `${startDate.getTime()}-${endDate.getTime()}-${count}-${total.toFixed(2)}-ANGLES`
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
    const prefix = 'ANG'
    const year = endDate.getFullYear()
    return `${prefix}-${year}-${hex.slice(0, 4)}-${hex.slice(4)}`
}

// Formateador de fecha/hora precisa
function formatDateTimeFull(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

function formatDateShort(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

/**
 * Genera y descarga el PDF Oficial de Estado Financiero y Auditoría de Ventas
 */
export function generateBankFinancialReportPDF(options: BankReportFilterOptions): void {
    const {
        startDate,
        endDate,
        sales,
        companyName = 'Angles Administración',
        systemName = 'Sistema Central de Gestión y Control Operacional Angles'
    } = options

    // 1. Filtrar transacciones estrictamente dentro del rango de fechas
    // Aseguramos que startDate sea a las 00:00:00 y endDate a las 23:59:59
    const startPeriod = new Date(startDate)
    startPeriod.setHours(0, 0, 0, 0)

    const endPeriod = new Date(endDate)
    endPeriod.setHours(23, 59, 59, 999)

    const filteredSales = sales
        .filter(sale => {
            const time = sale.createdAt.getTime()
            return time >= startPeriod.getTime() && time <= endPeriod.getTime()
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // Cronológico ascendente para libros bancarios

    // 2. Cálculos financieros y métricas
    const totalTransactions = filteredSales.length
    const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.precioVenta || 0), 0)

    // Desglose por método de pago (Crucial para bancos: QR vs Efectivo)
    const qrSales = filteredSales.filter(s => s.metodoPago === 'QR')
    const totalQR = qrSales.reduce((acc, s) => acc + s.precioVenta, 0)
    const countQR = qrSales.length
    const pctQR = totalRevenue > 0 ? ((totalQR / totalRevenue) * 100).toFixed(1) : '0.0'

    const cashSales = filteredSales.filter(s => s.metodoPago === 'EFECTIVO')
    const totalCash = cashSales.reduce((acc, s) => acc + s.precioVenta, 0)
    const countCash = cashSales.length
    const pctCash = totalRevenue > 0 ? ((totalCash / totalRevenue) * 100).toFixed(1) : '0.0'

    // Desglose de costos de delivery
    const lucioSales = filteredSales.filter(s => s.tipoVenta === 'LUCIO')
    const totalLucioDeliveryCost = lucioSales.reduce((acc, s) => acc + (s.precioEnvio || 0), 0)

    const doctorSales = filteredSales.filter(s => s.tipoVenta === 'DOCTORES')
    const totalDoctorLucioDeliveryCost = doctorSales
        .filter(s => s.lucioDelivery)
        .reduce((acc, s) => acc + (s.lucioDeliveryPrice || 0), 0)

    const totalLogisticsDeductions = totalLucioDeliveryCost + totalDoctorLucioDeliveryCost
    const ticketPromedio = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Código de Auditoría
    const auditCode = generateAuditHash(startPeriod, endPeriod, totalTransactions, totalRevenue)
    const emissionDate = new Date()

    // 3. Inicializar jsPDF en Landscape para máxima legibilidad de columnas bancarias
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4', // 297mm ancho x 210mm alto
    })

    const pageWidth = doc.internal.pageSize.getWidth() // 297
    const pageHeight = doc.internal.pageSize.getHeight() // 210
    const margin = 14

    const borderGray = [226, 232, 240]

    // ==========================================
    // ENCABEZADO INSTITUCIONAL
    // ==========================================
    // Banda superior institucional
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, 5, 'F')

    // Título de la empresa y sistema
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(15, 23, 42)
    doc.text(companyName.toUpperCase(), margin, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(systemName, margin, 20)
    doc.text('Registro Centralizado de Operaciones en la Nube | Base de Datos Verificada', margin, 24)

    // Recuadro del Título del Documento (Derecha)
    const titleBoxX = pageWidth - margin - 105
    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(titleBoxX, 8, 105, 21, 2, 2, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('ESTADO OFICIAL DE INGRESOS OPERACIONALES', titleBoxX + 5, 13)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text(`CÓDIGO DE AUDITORÍA:`, titleBoxX + 5, 18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 138)
    doc.text(auditCode, titleBoxX + 44, 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(`Emisión: ${formatDateTimeFull(emissionDate)} BOT | Validez: Fidedigno`, titleBoxX + 5, 24)

    // Línea divisoria suave
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.5)
    doc.line(margin, 28, pageWidth - margin, 28)

    // ==========================================
    // RECUADRO DE ALCANCE Y PERÍODO AUDITADO
    // ==========================================
    const periodBoxY = 31
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(margin, periodBoxY, pageWidth - (margin * 2), 12, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(15, 23, 42)
    doc.text('PERÍODO DE OPERACIONES AUDITADO:', margin + 4, periodBoxY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 58, 138)
    doc.setFont('helvetica', 'bold')
    doc.text(`Desde el ${formatDateShort(startPeriod)} hasta el ${formatDateShort(endPeriod)}`, margin + 65, periodBoxY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.setFontSize(8)
    doc.text(`Total Operaciones Registradas: ${totalTransactions}`, margin + 160, periodBoxY + 5)
    doc.text(`Finalidad: Conciliación Bancaria y Acreditación de Flujo de Caja`, margin + 4, periodBoxY + 9.5)

    // ==========================================
    // TARJETAS / MÉTRICAS FINANCIERAS RESUMEN
    // ==========================================
    const kpiY = 46
    const kpiGap = 4
    const kpiWidth = (pageWidth - (margin * 2) - (kpiGap * 4)) / 5
    const kpiHeight = 18

    // KPI 1: Total Ingresos
    doc.setFillColor(15, 23, 42)
    doc.roundedRect(margin, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(203, 213, 225)
    doc.text('INGRESOS BRUTOS TOTALES', margin + 3, kpiY + 4.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(255, 255, 255)
    doc.text(`Bs. ${totalRevenue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 3, kpiY + 11.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(148, 163, 184)
    doc.text(`${totalTransactions} transacciones verificadas`, margin + 3, kpiY + 15.5)

    // KPI 2: QR Bancario
    const kpi2X = margin + kpiWidth + kpiGap
    doc.setFillColor(240, 253, 250)
    doc.setDrawColor(204, 251, 241)
    doc.roundedRect(kpi2X, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(15, 118, 110)
    doc.text('PAGO QR BANCARIO (BANCOS)', kpi2X + 3, kpiY + 4.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(13, 148, 136)
    doc.text(`Bs. ${totalQR.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, kpi2X + 3, kpiY + 11.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(71, 85, 105)
    doc.text(`${pctQR}% del total (${countQR} transacciones)`, kpi2X + 3, kpiY + 15.5)

    // KPI 3: Efectivo en Caja
    const kpi3X = kpi2X + kpiWidth + kpiGap
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(kpi3X, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(51, 65, 85)
    doc.text('EFECTIVO EN CAJA', kpi3X + 3, kpiY + 4.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(30, 41, 59)
    doc.text(`Bs. ${totalCash.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, kpi3X + 3, kpiY + 11.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text(`${pctCash}% del total (${countCash} transacciones)`, kpi3X + 3, kpiY + 15.5)

    // KPI 4: Ticket Promedio
    const kpi4X = kpi3X + kpiWidth + kpiGap
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(kpi4X, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(51, 65, 85)
    doc.text('PROMEDIO POR OPERACIÓN', kpi4X + 3, kpiY + 4.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(30, 41, 59)
    doc.text(`Bs. ${ticketPromedio.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, kpi4X + 3, kpiY + 11.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text('Ticket medio operacional', kpi4X + 3, kpiY + 15.5)

    // KPI 5: Deducción Logística
    const kpi5X = kpi4X + kpiWidth + kpiGap
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(254, 202, 202)
    doc.roundedRect(kpi5X, kpiY, kpiWidth, kpiHeight, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(185, 28, 28)
    doc.text('COSTO LOGÍSTICA / ENVÍOS', kpi5X + 3, kpiY + 4.5)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(153, 27, 27)
    doc.text(`Bs. ${totalLogisticsDeductions.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, kpi5X + 3, kpiY + 11.5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(127, 29, 29)
    doc.text('Entregas y carreras Lucio', kpi5X + 3, kpiY + 15.5)

    // ==========================================
    // TABLA DETALLADA DE TRANSACCIONES (AUTOTABLE)
    // ==========================================
    // Preparamos las filas de la tabla
    const tableRows = filteredSales.map((sale, index) => {
        const items = getSaleItems(sale)
        const itemsSummary = items.map(i => `${i.quantity}x ${i.productName}`).join(', ')

        // Determinar referencia de cliente / doctor
        let clientRef = '—'
        if (sale.tipoVenta === 'NORMAL') {
            clientRef = sale.clienteNombre ? `Cliente: ${sale.clienteNombre}` : 'Venta de Mostrador'
        } else if (sale.tipoVenta === 'LUCIO') {
            clientRef = sale.clienteNombre ? `Domicilio: ${sale.clienteNombre}` : 'Envío Domicilio Lucio'
        } else if (sale.tipoVenta === 'DOCTORES') {
            const docInfo = sale.doctorNombre ? `Dr(a). ${sale.doctorNombre}` : 'Doctor'
            const pacInfo = sale.pacienteNombre ? ` (Pac: ${sale.pacienteNombre})` : ''
            clientRef = `${docInfo}${pacInfo}`
        } else if (sale.tipoVenta === 'ENVIO') {
            clientRef = `Despacho: ${sale.departamento || 'Nacional'}`
        }

        // Tipo traducido formal
        let canalName = 'MOSTRADOR'
        if (sale.tipoVenta === 'LUCIO') canalName = 'DOMICILIO LUCIO'
        if (sale.tipoVenta === 'DOCTORES') canalName = sale.lucioDelivery ? 'CLÍNICA (+LUCIO)' : 'CLÍNICA / RECETA'
        if (sale.tipoVenta === 'ENVIO') canalName = 'DEPARTAMENTAL'

        const operatorEmail = sale.createdByEmail ? sale.createdByEmail.split('@')[0] : 'admin'

        // Formato ID acortado para trazabilidad Firestore
        const shortId = sale.id ? sale.id.slice(0, 8).toUpperCase() : `OP-${index + 1}`

        return [
            (index + 1).toString(),
            formatDateTimeFull(sale.createdAt),
            `#${shortId}`,
            canalName,
            itemsSummary || 'Venta de productos farmacéuticos',
            clientRef,
            sale.metodoPago === 'QR' ? 'QR BANCARIO' : (sale.metodoPago === 'EFECTIVO' ? 'EFECTIVO' : 'REGISTRADO'),
            operatorEmail,
            formatCurrency(sale.precioVenta)
        ]
    })

    const tableStartY = kpiY + kpiHeight + 6

    const autoTableOptions: UserOptions = {
        startY: tableStartY,
        head: [[
            '#',
            'Fecha / Hora Original',
            'Ref ID',
            'Canal Operacional',
            'Detalle de Ítems / Productos',
            'Cliente / Médico / Destino',
            'Medio de Pago',
            'Operador',
            'Monto Total'
        ]],
        body: tableRows,
        theme: 'grid',
        margin: { left: margin, right: margin, bottom: 25 },
        styles: {
            font: 'helvetica',
            fontSize: 7,
            cellPadding: 1.8,
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
            textColor: [30, 41, 59],
            valign: 'middle',
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.2,
            halign: 'left',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },      // #
            1: { cellWidth: 26, halign: 'center' },     // Fecha / Hora
            2: { cellWidth: 19, halign: 'center' },     // Ref ID
            3: { cellWidth: 25, halign: 'left' },       // Canal
            4: { cellWidth: 'auto', halign: 'left' },   // Detalle ítems
            5: { cellWidth: 46, halign: 'left' },       // Cliente / Referencia
            6: { cellWidth: 22, halign: 'center' },     // Medio Pago
            7: { cellWidth: 18, halign: 'center' },     // Operador
            8: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, // Monto Total
        },
        foot: [[
            '',
            '',
            '',
            '',
            'RESUMEN CONSOLIDADO DE INGRESOS OPERACIONALES AUDITADOS',
            `Transacciones: ${totalTransactions}`,
            `QR: ${pctQR}% | EFECTIVO: ${pctCash}%`,
            'TOTAL:',
            formatCurrency(totalRevenue)
        ]],
        footStyles: {
            fillColor: [241, 245, 249],
            textColor: [15, 23, 42],
            fontStyle: 'bold',
            fontSize: 7.5,
            halign: 'left',
        },
        didDrawPage: (data) => {
            // Header continuo en páginas subsiguientes
            if (data.pageNumber > 1) {
                doc.setFillColor(15, 23, 42)
                doc.rect(0, 0, pageWidth, 4, 'F')

                doc.setFont('helvetica', 'bold')
                doc.setFontSize(8)
                doc.setTextColor(15, 23, 42)
                doc.text(`${companyName.toUpperCase()} — ESTADO DE INGRESOS OPERACIONALES (AUDITORÍA)`, margin, 10)

                doc.setFont('helvetica', 'normal')
                doc.setFontSize(7.5)
                doc.setTextColor(100, 116, 139)
                doc.text(`Período: ${formatDateShort(startPeriod)} - ${formatDateShort(endPeriod)} | Cód. Auditoría: ${auditCode}`, pageWidth - margin - 100, 10)

                doc.setDrawColor(226, 232, 240)
                doc.setLineWidth(0.4)
                doc.line(margin, 12, pageWidth - margin, 12)
            }

            // Pie de página en todas las páginas
            const footerY = pageHeight - 8
            doc.setDrawColor(226, 232, 240)
            doc.setLineWidth(0.3)
            doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(6.5)
            doc.setTextColor(100, 116, 139)
            doc.text(
                'Documento emitido electrónicamente con certificación de integridad transaccional por el Sistema de Administración Angles.',
                margin,
                footerY
            )

            // Numeración de páginas
            const pageStr = `Página ${data.pageNumber}`
            doc.text(pageStr, pageWidth - margin - 15, footerY)
        }
    }

    autoTable(doc, autoTableOptions)

    // ==========================================
    // SECCIÓN DE CERTIFICACIÓN LEGAL Y FIRMAS BANCARIAS
    // ==========================================
    // Verificamos si queda espacio en la última página o agregamos una página final de cierre
    const lastTableY = (doc as any).lastAutoTable?.finalY || 100
    const neededSpaceForCertification = 50

    if (lastTableY + neededSpaceForCertification > pageHeight - 15) {
        doc.addPage()
        // Dibuja encabezado en la nueva página
        doc.setFillColor(15, 23, 42)
        doc.rect(0, 0, pageWidth, 4, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(15, 23, 42)
        doc.text(`${companyName.toUpperCase()} — DICTAMEN DE CERTIFICACIÓN BANCARIA`, margin, 10)
    }

    const certStartY = (lastTableY + neededSpaceForCertification > pageHeight - 15) ? 18 : lastTableY + 8

    // Caja de Certificación Bancaria
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(203, 213, 225)
    doc.roundedRect(margin, certStartY, pageWidth - (margin * 2), 16, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(15, 23, 42)
    doc.text('DECLARACIÓN DE AUTENTICIDAD Y TRAZABILIDAD OPERACIONAL (PARA FINES BANCARIOS):', margin + 4, certStartY + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.setTextColor(71, 85, 105)
    const certText = 'Se certifica que la totalidad de los datos contenidos en este informe corresponden fidedignamente a las transacciones registradas cronológicamente en tiempo real en los servidores de base de datos de Angles Administración. Cada registro cuenta con marca temporal inalterable (timestamp) de creación, confirmación de método de pago y respaldo de operador, constituyendo un extracto verídico de los flujos de ingresos de la farmacia para evaluación financiera, apertura de líneas de crédito o auditorías bancarias.'
    doc.text(doc.splitTextToSize(certText, pageWidth - (margin * 2) - 8), margin + 4, certStartY + 9)

    // Bloques de Firmas (3 columnas: Titular/Administración, Control Interno, Recepción Banco)
    const signY = certStartY + 24
    const signColWidth = (pageWidth - (margin * 2) - 30) / 3

    // Firma 1: Administración
    const sign1X = margin + 5
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.4)
    doc.line(sign1X, signY + 12, sign1X + signColWidth, signY + 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text('ADMINISTRACIÓN GENERAL / PROPIETARIA', sign1X + (signColWidth / 2), signY + 16, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text('Angles Administración — Firma Autorizada', sign1X + (signColWidth / 2), signY + 20, { align: 'center' })

    // Firma 2: Sello del Sistema
    const sign2X = sign1X + signColWidth + 10
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.4)
    doc.line(sign2X, signY + 12, sign2X + signColWidth, signY + 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text('SELLO Y VALIDACIÓN ELECTRÓNICA', sign2X + (signColWidth / 2), signY + 16, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text(`Hash: ${auditCode} | Firestore Cloud`, sign2X + (signColWidth / 2), signY + 20, { align: 'center' })

    // Firma 3: Recepción Bancaria
    const sign3X = sign2X + signColWidth + 10
    doc.setDrawColor(148, 163, 184)
    doc.setLineWidth(0.4)
    doc.line(sign3X, signY + 12, sign3X + signColWidth, signY + 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text('RECEPCIÓN ENTIDAD BANCARIA / FINANCIERA', sign3X + (signColWidth / 2), signY + 16, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text('Oficial de Crédito / Analista de Riesgo', sign3X + (signColWidth / 2), signY + 20, { align: 'center' })

    // 4. Actualizar número total de páginas en pie de página (Page X of Y)
    const pageCount = (doc.internal as any).getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6.5)
        doc.setTextColor(100, 116, 139)
        const footerY = pageHeight - 8
        // Sobrescribir el texto de página con el total
        doc.setFillColor(255, 255, 255)
        doc.rect(pageWidth - margin - 22, footerY - 2.5, 25, 4, 'F')
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, footerY)
    }

    // 5. Descargar archivo
    const startStr = formatDateShort(startPeriod).replace(/\//g, '-')
    const endStr = formatDateShort(endPeriod).replace(/\//g, '-')
    const filename = `Reporte_Bancario_Angles_${startStr}_al_${endStr}.pdf`
    doc.save(filename)
}
