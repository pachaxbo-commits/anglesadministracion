/**
 * useProducts - Hook para CRUD de productos en Firestore
 * 
 * Colección: apps/farmacia/products
 * SIN fotos (Storage es de pago)
 */

import { useState, useEffect } from 'react'
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore'
import { db, FIRESTORE_PREFIX } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { Product, ProductInput } from '@/lib/types'

// Ruta de la colección en Firestore
const COLLECTION_PATH = `${FIRESTORE_PREFIX}/products`

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Cargar productos al montar
    useEffect(() => {
        loadProducts()
    }, [])

    /**
     * loadProducts - Carga todos los productos de Firestore
     */
    const loadProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'))
            const snapshot = await getDocs(q)
            const productsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as Product[]
            setProducts(productsList)
        } catch (err: any) {
            console.error('Error cargando productos:', err)
            setError('Error al cargar los productos')
        } finally {
            setLoading(false)
        }
    }

    /**
     * addProduct - Crea un nuevo producto
     */
    const addProduct = async (data: ProductInput): Promise<boolean> => {
        if (!user) return false

        setError(null)
        try {
            await addDoc(collection(db, COLLECTION_PATH), {
                ...data,
                createdByUid: user.uid,
                createdByEmail: user.email,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            })
            await loadProducts()
            return true
        } catch (err: any) {
            console.error('Error creando producto:', err)
            setError('Error al crear el producto')
            return false
        }
    }

    /**
     * updateProduct - Actualiza un producto existente
     */
    const updateProduct = async (id: string, data: Partial<ProductInput>): Promise<boolean> => {
        setError(null)
        try {
            const docRef = doc(db, COLLECTION_PATH, id)
            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            })
            await loadProducts()
            return true
        } catch (err: any) {
            console.error('Error actualizando producto:', err)
            setError('Error al actualizar el producto')
            return false
        }
    }

    /**
     * deleteProduct - Elimina un producto
     */
    const deleteProduct = async (id: string): Promise<boolean> => {
        setError(null)
        try {
            await deleteDoc(doc(db, COLLECTION_PATH, id))
            await loadProducts()
            return true
        } catch (err: any) {
            console.error('Error eliminando producto:', err)
            setError('Error al eliminar el producto')
            return false
        }
    }

    /**
     * updateStock - Actualiza solo el stock de un producto
     */
    const updateStock = async (id: string, newStock: number): Promise<boolean> => {
        if (newStock < 0) {
            setError('El stock no puede ser negativo')
            return false
        }

        return updateProduct(id, { stock: newStock })
    }

    return {
        products,
        loading,
        error,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
    }
}
