import React from 'react'
import { format } from 'date-fns'
import { Sale, SaleItem, getSaleItems } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { PHARMACY_CONFIG } from '@/config/pharmacy'

interface PrintableReceiptProps {
    sale: Sale
}

/**
 * PrintableReceipt Component
 * 
 * Este componente está diseñado estrictamente para ser impreso en impresoras térmicas (80mm o 58mm).
 * No incluye estilos de Tailwind interactivos, sino estilos fijos óptimos para papel en blanco y negro.
 * Se oculta en pantalla normal mediante CSS y solo aparece en @media print.
 */
export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(
    ({ sale }, ref) => {
        const {
            id,
            createdAt: fecha,
            precioVenta: total,
            tipoVenta,
            clienteNombre,
            metodoPago,
            doctorNombre,
            pacienteNombre,
            precioEnvio = 0,
            lucioDeliveryPrice = 0
        } = sale

        // Use the helper to safely ensure we get items list whether modern or legacy
        const itemsList = getSaleItems(sale)

        const saleDate = new Date(fecha)

        return (
            <div ref={ref} className="print-receipt-container">
                {/* Cabecera Ticket */}
                <div className="text-center mb-4 border-b border-black pb-3">
                    <h1 className="font-bold text-lg leading-tight uppercase">{PHARMACY_CONFIG.name}</h1>
                    <p className="text-xs mt-1">{PHARMACY_CONFIG.address}</p>
                    <p className="text-xs">Tel: {PHARMACY_CONFIG.phone}</p>
                    <p className="text-xs">NIT/CI: {PHARMACY_CONFIG.nit}</p>
                </div>

                {/* Info Venta */}
                <div className="text-xs space-y-1 mb-4 border-b border-black pb-2">
                    <p><strong>Recibo N°:</strong> {id.slice(-6).toUpperCase()}</p>
                    <p><strong>Fecha:</strong> {format(saleDate, "dd/MM/yyyy HH:mm")}</p>
                    <p><strong>Tipo:</strong> {tipoVenta} ({metodoPago})</p>

                    {clienteNombre && <p><strong>Cliente:</strong> {clienteNombre}</p>}
                    {doctorNombre && <p><strong>Doctor:</strong> {doctorNombre}</p>}
                    {pacienteNombre && <p><strong>Paciente:</strong> {pacienteNombre}</p>}
                </div>

                {/* Lista de Items */}
                <div className="mb-4">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="border-b border-black border-dashed">
                                <th className="py-1">Cant.</th>
                                <th className="py-1">Descripción</th>
                                <th className="py-1 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="align-top">
                            {itemsList.map((item: SaleItem, idx: number) => (
                                <tr key={idx} className="border-b border-black/20 border-dotted">
                                    <td className="py-1">{item.quantity}</td>
                                    <td className="py-1 pr-2">
                                        {item.productName}
                                        <div className="text-[10px] text-gray-500">P.U: {formatCurrency(item.unitPrice)}</div>
                                    </td>
                                    <td className="py-1 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totales Adicionales */}
                {(precioEnvio > 0 || lucioDeliveryPrice > 0) && (
                    <div className="text-xs space-y-1 mb-3 border-b border-black/20 pb-2">
                        {precioEnvio > 0 && (
                            <div className="flex justify-between">
                                <span>Cargo Envio:</span>
                                <span>{formatCurrency(precioEnvio)}</span>
                            </div>
                        )}
                        {lucioDeliveryPrice > 0 && (
                            <div className="flex justify-between">
                                <span>Delivery Lucio:</span>
                                <span>{formatCurrency(lucioDeliveryPrice)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Total Final */}
                <div className="flex justify-between items-center text-sm font-bold border-t-2 border-black pt-2 mb-6">
                    <span>TOTAL:</span>
                    <span className="text-lg">{formatCurrency(total)}</span>
                </div>

                {/* Footer Ticket */}
                <div className="text-center text-xs space-y-2 mt-4">
                    <p className="font-bold">{PHARMACY_CONFIG.ticketMessage}</p>
                    <p className="text-[10px] text-gray-500">Documento no válido como factura C.F.</p>
                    <p className="text-[10px] text-gray-500 mt-2">-- Impreso el {format(new Date(), "dd/MM/yy HH:mm")} --</p>
                </div>
            </div>
        )
    }
)
PrintableReceipt.displayName = 'PrintableReceipt'
