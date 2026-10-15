import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Input - Componente de campo de entrada
 * 
 * Campo de texto estilizado para formularios.
 * Soporta todos los tipos de input HTML (text, email, password, number, etc.)
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
