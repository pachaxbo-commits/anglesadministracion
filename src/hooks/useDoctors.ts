/**
 * useDoctors - Hook para CRUD de doctores en Firestore
 * 
 * Colección: apps/farmacia/doctors
 * Incluye tracking de quién creó cada doctor
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
import { Doctor, DoctorInput } from '@/lib/types'

// Ruta de la colección en Firestore
const COLLECTION_PATH = `${FIRESTORE_PREFIX}/doctors`

export function useDoctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    // Cargar doctores al montar
    useEffect(() => {
        loadDoctors()
    }, [])

    /**
     * loadDoctors - Carga todos los doctores de Firestore
     */
    const loadDoctors = async () => {
        setLoading(true)
        setError(null)
        try {
            const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'))
            const snapshot = await getDocs(q)
            const doctorsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            })) as Doctor[]
            setDoctors(doctorsList)
        } catch (err: any) {
            console.error('Error cargando doctores:', err)
            setError('Error al cargar los doctores')
        } finally {
            setLoading(false)
        }
    }

    /**
     * addDoctor - Crea un nuevo doctor
     */
    const addDoctor = async (data: DoctorInput): Promise<boolean> => {
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
            await loadDoctors()
            return true
        } catch (err: any) {
            console.error('Error creando doctor:', err)
            setError('Error al crear el doctor')
            return false
        }
    }

    /**
     * updateDoctor - Actualiza un doctor existente
     */
    const updateDoctor = async (id: string, data: Partial<DoctorInput>): Promise<boolean> => {
        setError(null)
        try {
            const docRef = doc(db, COLLECTION_PATH, id)
            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            })
            await loadDoctors()
            return true
        } catch (err: any) {
            console.error('Error actualizando doctor:', err)
            setError('Error al actualizar el doctor')
            return false
        }
    }

    /**
     * deleteDoctor - Elimina un doctor
     */
    const deleteDoctor = async (id: string): Promise<boolean> => {
        setError(null)
        try {
            await deleteDoc(doc(db, COLLECTION_PATH, id))
            await loadDoctors()
            return true
        } catch (err: any) {
            console.error('Error eliminando doctor:', err)
            setError('Error al eliminar el doctor')
            return false
        }
    }

    return {
        doctors,
        loading,
        error,
        loadDoctors,
        addDoctor,
        updateDoctor,
        deleteDoctor,
    }
}
