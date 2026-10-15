/**
 * Types - Definiciones de tipos para toda la aplicación
 * 
 * NO usamos fotos (Storage es de pago).
 * Namespace en Firestore: apps/farmacia/*
 */

// ===========================================
// PRODUCTO - Representa un producto en inventario
// ===========================================
export interface Product {
    id: string                    // ID único generado por Firestore
    nombre: string               // Nombre del producto
    costoProduccion: number      // Costo de producción (para referencia)
    precioVenta: number          // Precio de venta al público
    stock: number                // Cantidad disponible en inventario

    // Tracking de quién creó el registro
    createdByUid: string         // UID del usuario que creó
    createdByEmail: string       // Email del usuario que creó
    createdAt: Date              // Fecha de creación
    updatedAt: Date              // Última actualización
}

// Datos para crear/actualizar producto
export type ProductInput = {
    nombre: string
    costoProduccion: number
    precioVenta: number
    stock: number
}

// ===========================================
// DOCTOR - Representa un doctor registrado
// ===========================================
export interface Doctor {
    id: string                    // ID único generado por Firestore
    nombre: string               // Nombre completo del doctor
    ciudad: string               // Ciudad donde trabaja

    // Tracking de quién creó el registro
    createdByUid: string         // UID del usuario que creó
    createdByEmail: string       // Email del usuario que creó
    createdAt: Date              // Fecha de creación
    updatedAt: Date              // Última actualización
}

export type DoctorInput = {
    nombre: string
    ciudad: string
}

// ===========================================
// ITEM DE VENTA - Producto dentro de una venta
// ===========================================
export interface SaleItem {
    type: 'inventory' | 'quick'   // Tipo de item
    productId?: string            // ID del producto (solo para inventory)
    productName: string           // Nombre del producto
    quantity: number              // Cantidad
    unitPrice: number             // Precio unitario
    lineTotal: number             // quantity * unitPrice
}

// ===========================================
// VENTA - Representa una venta realizada
// ===========================================
export interface Sale {
    id: string                           // ID único generado por Firestore
    tipoVenta: 'NORMAL' | 'LUCIO' | 'DOCTORES' | 'ENVIO'  // Tipo de venta

    // ========== NUEVO: Multi-item support ==========
    items?: SaleItem[]                   // Lista de productos en la venta

    // ========== LEGACY: Compatibilidad con ventas antiguas ==========
    // Estos campos se mantienen para ventas antiguas sin items[]
    productoId?: string | null           // ID del producto (null si es venta rápida)
    productoNombre?: string              // Nombre del producto
    esVentaRapida?: boolean              // true = no afecta inventario
    cantidad?: number                    // Cantidad vendida
    precioUnitario?: number              // Precio unitario del producto
    // ========================================

    precioVenta: number                  // Precio total de la venta (suma de line totals)

    // Campos para NORMAL y LUCIO (ventas con pago directo)
    metodoPago?: 'QR' | 'EFECTIVO'       // Método de pago
    clienteNombre?: string               // Nombre o teléfono del cliente

    // Campos específicos para LUCIO (envío a domicilio)
    precioEnvio?: number                 // Precio de la carrera (delivery)
    boletoPagado?: boolean               // Si el boleto está pagado

    // Campos específicos para DOCTORES
    doctorId?: string                    // ID del doctor
    doctorNombre?: string                // Nombre del doctor
    doctorCiudad?: string                // Ciudad del doctor
    pacienteNombre?: string              // Nombre o número del paciente

    // NUEVO: Lucio delivery para doctores
    lucioDelivery?: boolean              // ¿Lucio llevará el pedido?
    lucioDeliveryPrice?: number          // Precio carrera (solo si lucioDelivery)

    // Campos específicos para ENVIO
    departamento?: string                // Departamento de destino
    envioPagado?: boolean                // Si el envío está pagado

    // Tracking de quién hizo la venta
    createdByUid: string                 // UID del usuario que creó la venta
    createdByEmail: string               // Email del usuario que creó la venta
    createdAt: Date                      // Fecha de la venta
}

export type SaleInput = Omit<Sale, 'id' | 'createdAt' | 'createdByUid' | 'createdByEmail'>

// ===========================================
// VENTA ELIMINADA - Registro de ventas borradas
// ===========================================
export interface DeletedSale extends Sale {
    deletedAt: Date                      // Fecha de eliminación
    deletedByUid: string                 // UID de quién eliminó
    deletedByEmail: string               // Email de quién eliminó
    deletedReason?: string               // Razón de eliminación (opcional)
}

// ===========================================
// LUCIO DELIVERY - Registro de carreras de Lucio
// ===========================================
export interface LucioDelivery {
    id: string                           // ID único
    saleId: string                       // ID de la venta asociada
    saleType: 'LUCIO' | 'DOCTORES'       // Tipo de venta origen

    // Información del delivery
    deliveryPrice: number                // Precio de la carrera

    // Detalles según tipo
    clienteNombre?: string               // Cliente (para Lucio sales)
    doctorNombre?: string                // Doctor (para Doctor sales)
    doctorCiudad?: string                // Ciudad del doctor
    pacienteNombre?: string              // Paciente (para Doctor sales)

    // Sale totals for reference 
    saleTotal: number                    // Total de la venta asociada

    // Tracking
    createdByUid: string
    createdByEmail: string
    createdAt: Date
}

// ===========================================
// CONSTANTES
// ===========================================

// Los 9 departamentos de Bolivia
export const DEPARTAMENTOS_BOLIVIA = [
    'La Paz',
    'Cochabamba',
    'Santa Cruz',
    'Oruro',
    'Potosí',
    'Chuquisaca',
    'Tarija',
    'Beni',
    'Pando'
] as const

export type DepartamentoBolivia = typeof DEPARTAMENTOS_BOLIVIA[number]

// Métodos de pago para Lucio
export const METODOS_PAGO = ['QR', 'EFECTIVO'] as const
export type MetodoPago = typeof METODOS_PAGO[number]

// Tipos de venta
export const TIPOS_VENTA = ['NORMAL', 'LUCIO', 'DOCTORES', 'ENVIO'] as const
export type TipoVenta = typeof TIPOS_VENTA[number]

// ===========================================
// HELPERS - Funciones de utilidad para ventas
// ===========================================

/**
 * getSaleItems - Obtiene los items de una venta (compatible con ventas antiguas)
 * Si la venta tiene items[], los devuelve. Si no, crea un item virtual.
 */
export function getSaleItems(sale: Sale): SaleItem[] {
    if (sale.items && sale.items.length > 0) {
        return sale.items
    }

    // Compatibilidad con ventas antiguas sin items[]
    return [{
        type: sale.esVentaRapida ? 'quick' : 'inventory',
        productId: sale.productoId || undefined,
        productName: sale.productoNombre || 'Producto sin nombre',
        quantity: sale.cantidad || 1,
        unitPrice: sale.precioUnitario || sale.precioVenta,
        lineTotal: sale.precioVenta,
    }]
}
