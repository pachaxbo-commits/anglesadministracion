import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
    User,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ToastProvider } from '@/components/ui/Toaster'
import { getFirebaseErrorMessage } from '@/lib/utils'

/**
 * AuthContext - Contexto de autenticación real con Firebase
 * 
 * Maneja:
 * - Estado del usuario actual
 * - Login con email/password
 * - Logout
 * - Recuperación de contraseña
 * - Mensajes de error en español
 */

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })

        // Limpiar suscripción al desmontar
        return () => unsubscribe()
    }, [])

    /**
     * login - Inicia sesión con email y contraseña
     */
    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            return { success: true }
        } catch (error: any) {
            const errorMessage = getFirebaseErrorMessage(error.code)
            return { success: false, error: errorMessage }
        }
    }

    /**
     * logout - Cierra la sesión actual
     */
    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        }
    }

    /**
     * resetPassword - Envía email de recuperación de contraseña
     */
    const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await sendPasswordResetEmail(auth, email)
            return { success: true }
        } catch (error: any) {
            const errorMessage = getFirebaseErrorMessage(error.code)
            return { success: false, error: errorMessage }
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, resetPassword }}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AuthContext.Provider>
    )
}
