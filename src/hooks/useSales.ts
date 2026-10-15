/**
 * useSales - Hook para CRUD de ventas en Firestore
 * 
 * Colección: apps/farmacia/sales
 * Colección eliminadas: apps/farmacia/deletedSales
 * 
 * Reglas importantes:
 * - Multi-item: cada venta puede tener múltiples items
 * - Items de inventario: reducen stock al crear, restauran al eliminar
 * - Items rápidos: NO afectan stock
 * - Doctor deliveries con lucioDelivery=true se muestran en tabla Lucio
 * - Backward compatibility: ventas antiguas sin items[] se manejan correctamente
 */

import { useState, useEffect } from 'react'
import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    Timestamp,
    increment
} from 'firebase/firestore'
import { db, FIRESTORE_PREFIX } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Sale, SaleInput, DeletedSale, getSaleItems } from '@/lib/types'

// Rutas de las colecciones en Firestore
const SALES_PATH = `${FIRESTORE_PREFIX}/sales`
const DELETED_SALES_PATH = `${FIRESTORE_PREFIX}/deletedSales`
const PRODUCTS_PATH = `${FIRESTORE_PREFIX}/products`

export function useSales() {
    const [sales, setSales] = useState<Sale[]>([])
    const [deletedSales, setDeletedSales] = useState<DeletedSale[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Cargar ventas al montar
    useEffect(() => {
        loadSales()
        loadDeletedSales()
    }, [])

    /**
     * loadSales - Carga todas las ventas de Firestore
     */
    const loadSales = async () => {
        setLoading(true)
        setError(null)
        try {
            const q = query(collection(db, SALES_PATH), orderBy('createdAt', 'desc'))
            const snapshot = await getDocs(q)
            const salesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Sale[]
            setSales(salesList)
        } catch (err: any) {
            console.error('Error cargando ventas:', err)
            setError('Error al cargar las ventas')
        } finally {
            setLoading(false)
        }
    }

    /**
     * loadDeletedSales - Carga todas las ventas eliminadas
     */
    const loadDeletedSales = async () => {
        try {
            const q = query(collection(db, DELETED_SALES_PATH), orderBy('deletedAt', 'desc'))
            const snapshot = await getDocs(q)
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                deletedAt: doc.data().deletedAt?.toDate() || new Date(),
            })) as DeletedSale[]
            setDeletedSales(list)
        } catch (err: any) {
            console.error('Error cargando ventas eliminadas:', err)
        }
    }

    /**
     * addSale - Crea una nueva venta
     * 
     * Reduce stock para cada item de inventario en items[]
     */
    const addSale = async (data: SaleInput): Promise<boolean> => {
        if (!user) return false

        setError(null)
        try {
            // Crear la venta
            await addDoc(collection(db, SALES_PATH), {
                ...data,
                createdByUid: user.uid,
                createdByEmail: user.email,
                createdAt: Timestamp.now(),
            })

            // Reducir stock para cada item de inventario
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    if (item.type === 'inventory' && item.productId) {
                        const productRef = doc(db, PRODUCTS_PATH, item.productId)
                        await updateDoc(productRef, {
                            stock: increment(-item.quantity)
                        })
                    }
                }
            } else if (!data.esVentaRapida && data.productoId) {
                // Backward compatibility: single product
                const productRef = doc(db, PRODUCTS_PATH, data.productoId)
                await updateDoc(productRef, {
                    stock: increment(-(data.cantidad || 1))
                })
            }

            await loadSales()
            return true
        } catch (err: any) {
            console.error('Error creando venta:', err)
            setError('Error al crear la venta')
            return false
        }
    }

    /**
     * deleteSale - Elimina una venta y la mueve a ventas eliminadas
     * 
     * Restaura stock para cada item de inventario
     */
    const deleteSale = async (saleId: string, reason?: string): Promise<boolean> => {
        if (!user) return false

        setError(null)
        try {
            // Encontrar la venta
            const sale = sales.find(s => s.id === saleId)
            if (!sale) {
                setError('Venta no encontrada')
                return false
            }

            // Mover a ventas eliminadas
            await addDoc(collection(db, DELETED_SALES_PATH), {
                ...sale,
                id: saleId,
                deletedAt: Timestamp.now(),
                deletedByUid: user.uid,
                deletedByEmail: user.email,
                deletedReason: reason || '',
            })

            // Eliminar la venta original
            await deleteDoc(doc(db, SALES_PATH, saleId))

            // Restaurar stock para cada item de inventario
            const items = getSaleItems(sale)
            for (const item of items) {
                if (item.type === 'inventory' && item.productId) {
                    const productRef = doc(db, PRODUCTS_PATH, item.productId)
                    await updateDoc(productRef, {
                        stock: increment(item.quantity)
                    })
                }
            }

            await loadSales()
            await loadDeletedSales()
            return true
        } catch (err: any) {
            console.error('Error eliminando venta:', err)
            setError('Error al eliminar la venta')
            return false
        }
    }

    /**
     * updateSale - Modifica una venta existente
     * 
     * Restaura el stock de los items anteriores y reduce el stock de los nuevos.
     */
    const updateSale = async (saleId: string, data: SaleInput): Promise<boolean> => {
        if (!user) return false

        setError(null)
        try {
            const existingSale = sales.find(s => s.id === saleId)
            if (!existingSale) {
                setError('Venta original no encontrada para editar')
                return false
            }

            // 1. Restaurar stock de items antiguos
            const oldItems = getSaleItems(existingSale)
            for (const item of oldItems) {
                if (item.type === 'inventory' && item.productId) {
                    const productRef = doc(db, PRODUCTS_PATH, item.productId)
                    await updateDoc(productRef, {
                        stock: increment(item.quantity)
                    })
                }
            }

            // 2. Reducir stock para los nuevos items
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    if (item.type === 'inventory' && item.productId) {
                        const productRef = doc(db, PRODUCTS_PATH, item.productId)
                        await updateDoc(productRef, {
                            stock: increment(-item.quantity)
                        })
                    }
                }
            }

            // 3. Actualizar la venta
            const saleRef = doc(db, SALES_PATH, saleId)
            await updateDoc(saleRef, {
                ...data,
                // Se preserva createdAt, createdByUid del documento original,
                // pero se guarda timestamp de actualizacion
                updatedAt: Timestamp.now(),
                updatedByUid: user.uid
            })

            await loadSales()
            return true
        } catch (err: any) {
            console.error('Error actualizando venta:', err)
            setError('Error al editar la venta')
            return false
        }
    }

    return {
        sales,
        deletedSales,
        loading,
        error,
        loadSales,
        loadDeletedSales,
        addSale,
        updateSale,
        deleteSale,
    }
}
