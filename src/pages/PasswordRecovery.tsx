import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

/**
 * PasswordRecovery - Página de recuperación de contraseña
 * 
 * Envía un email de Firebase para restablecer la contraseña.
 */
export default function PasswordRecovery() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const { resetPassword } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            setError('Por favor ingresa tu correo electrónico.')
            return
        }

        setLoading(true)

        const result = await resetPassword(email)

        if (result.success) {
            setSent(true)
        } else {
            setError(result.error || 'Error al enviar el correo.')
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
                        <CardDescription>
                            {sent
                                ? 'Revisa tu correo electrónico'
                                : 'Ingresa tu correo y te enviaremos instrucciones'
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {sent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4 text-center"
                            >
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-900">¡Correo enviado!</p>
                                    <p className="text-sm text-gray-600">
                                        Revisa tu bandeja de entrada en <strong>{email}</strong>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Si no lo ves, revisa la carpeta de spam.
                                    </p>
                                </div>
                                <Link to="/login">
                                    <Button variant="outline" className="w-full mt-4">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Volver al login
                                    </Button>
                                </Link>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Error message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            autoComplete="email"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Enviando...
                                        </span>
                                    ) : (
                                        'Enviar instrucciones'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="mr-1 h-3 w-3" />
                                        Volver al login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
