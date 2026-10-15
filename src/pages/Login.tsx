import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

/**
 * Login - Página de inicio de sesión
 * 
 * Usa Firebase Auth real para autenticar a las propietarias.
 * Solo las cuentas creadas manualmente en Firebase Console pueden acceder.
 */
export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validaciones básicas
        if (!email.trim()) {
            setError('Por favor ingresa tu correo electrónico.')
            return
        }
        if (!password) {
            setError('Por favor ingresa tu contraseña.')
            return
        }

        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error || 'Error al iniciar sesión.')
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
                        {/* Logo */}
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
                            <span className="text-3xl font-bold text-white">F</span>
                        </div>
                        <CardTitle className="text-2xl">Bienvenida</CardTitle>
                        <CardDescription>
                            Sistema de Gestión de Farmacia
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
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

                            {/* Email */}
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

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10"
                                        autoComplete="current-password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot password link */}
                            <div className="text-right">
                                <Link
                                    to="/recuperar-password"
                                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            {/* Submit button */}
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Ingresando...
                                    </span>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer info */}
                <p className="mt-4 text-center text-xs text-gray-500">
                    Sistema exclusivo para propietarias
                </p>
            </motion.div>
        </div>
    )
}
