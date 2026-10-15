import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn - Combina clases de Tailwind de forma inteligente
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * formatCurrency - Formatea un número como moneda boliviana (Bs)
 */
export function formatCurrency(amount: number): string {
    return `Bs. ${amount.toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

/**
 * formatDate - Formatea una fecha en español
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

/**
 * formatShortDate - Formatea una fecha corta
 */
export function formatShortDate(date: Date): string {
    return date.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

/**
 * getFirebaseErrorMessage - Traduce errores de Firebase a español
 */
export function getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'El correo electrónico no es válido.',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
        'auth/user-not-found': 'No existe una cuenta con este correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña.',
        'auth/email-already-in-use': 'Este correo ya está registrado.',
        'auth/weak-password': 'La contraseña es muy débil.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
        'auth/popup-closed-by-user': 'Se cerró la ventana de autenticación.',
        'auth/operation-not-allowed': 'Esta operación no está permitida.',
        'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión.',
    }

    return errorMessages[errorCode] || 'Ocurrió un error. Intenta de nuevo.'
}
