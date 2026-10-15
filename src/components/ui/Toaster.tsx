import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Toast/Toaster - Sistema de notificaciones emergentes
 * 
 * Muestra mensajes temporales al usuario (éxito, error, info).
 * Uso: toast.success("Producto guardado"), toast.error("Error al guardar")
 */

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (type: ToastType, message: string) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook para usar el sistema de toast
export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider')
    }

    return {
        success: (message: string) => context.addToast('success', message),
        error: (message: string) => context.addToast('error', message),
        info: (message: string) => context.addToast('info', message),
    }
}

// Proveedor que envuelve la app
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (type: ToastType, message: string) => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, type, message }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    )
}

// Componente individual de toast
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    useEffect(() => {
        // Auto-remover después de 4 segundos
        const timer = setTimeout(onRemove, 4000)
        return () => clearTimeout(timer)
    }, [onRemove])

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    }

    const styles = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        info: 'border-blue-200 bg-blue-50',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
                styles[toast.type]
            )}
        >
            {icons[toast.type]}
            <p className="text-sm font-medium text-gray-900">{toast.message}</p>
            <button
                onClick={onRemove}
                className="ml-auto text-gray-400 hover:text-gray-600"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    )
}

// Contenedor de toasts (va en la raíz de la app)
export function Toaster() {
    const context = useContext(ToastContext)

    if (!context) {
        // Si no hay provider, crear uno simple
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {context.toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => context.removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
