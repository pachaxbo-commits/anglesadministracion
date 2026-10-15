import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope, Plus, Pencil, Trash2, Loader2, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/Dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table'
import { useDoctors } from '@/hooks/useDoctors'
import { DoctorInput } from '@/lib/types'
import { formatShortDate } from '@/lib/utils'

export default function Doctors() {
    const { doctors, loading, error, addDoctor, updateDoctor, deleteDoctor } = useDoctors()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingDoctor, setEditingDoctor] = useState<string | null>(null)
    const [deletingDoctor, setDeletingDoctor] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<DoctorInput>({
        nombre: '',
        ciudad: '',
    })

    const openCreateModal = () => {
        setFormData({ nombre: '', ciudad: '' })
        setEditingDoctor(null)
        setIsModalOpen(true)
    }

    const openEditModal = (doctorId: string) => {
        const doctor = doctors.find(d => d.id === doctorId)
        if (doctor) {
            setFormData({
                nombre: doctor.nombre,
                ciudad: doctor.ciudad,
            })
            setEditingDoctor(doctorId)
            setIsModalOpen(true)
        }
    }

    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            alert('El nombre del doctor es requerido')
            return
        }
        if (!formData.ciudad.trim()) {
            alert('La ciudad es requerida')
            return
        }

        setSaving(true)

        let success: boolean
        if (editingDoctor) {
            success = await updateDoctor(editingDoctor, formData)
        } else {
            success = await addDoctor(formData)
        }

        setSaving(false)

        if (success) {
            setIsModalOpen(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingDoctor) return

        setSaving(true)
        const success = await deleteDoctor(deletingDoctor)
        setSaving(false)

        if (success) {
            setIsDeleteModalOpen(false)
            setDeletingDoctor(null)
        }
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Directorio Médico</h1>
                    <p className="mt-2 text-slate-500">Gestiona los doctores que remiten pacientes a la farmacia.</p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20 text-white rounded-full px-6 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Doctor
                </Button>
            </div>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 flex items-center shadow-sm">
                            <Loader2 className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Doctors table */}
            <Card className="border-0 shadow-soft bg-white/60 backdrop-blur-xl overflow-hidden rounded-2xl">
                <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Users className="h-5 w-5 text-purple-500" />
                        Lista de Doctores ({doctors.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Cargando directorio...</p>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <Stethoscope className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No hay doctores registrados</h3>
                            <p className="mt-2 text-slate-500 max-w-sm mb-6">
                                Comienza a registrar a los médicos que trabajan con tu farmacia para llevar un mejor control.
                            </p>
                            <Button onClick={openCreateModal} variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Crear primer doctor
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80 sticky top-0 backdrop-blur-md z-10">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="font-semibold text-slate-600 py-4 px-6">Información del Médico</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 hidden sm:table-cell">Ciudad</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4 hidden md:table-cell">Registrado Por</TableHead>
                                        <TableHead className="font-semibold text-slate-600 py-4">Fecha</TableHead>
                                        <TableHead className="text-right font-semibold text-slate-600 py-4 px-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {doctors.map((doctor, index) => (
                                            <motion.tr
                                                key={doctor.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                                                className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                            >
                                                <TableCell className="font-medium px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-purple-50 border border-purple-100">
                                                            <Stethoscope className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-800 font-bold">{doctor.nombre}</span>
                                                            <span className="text-xs text-slate-500 flex items-center mt-0.5 sm:hidden">
                                                                <MapPin className="h-3 w-3 mr-1" /> {doctor.ciudad}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium">
                                                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                        {doctor.ciudad}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 hidden md:table-cell">
                                                    {doctor.createdByEmail?.split('@')[0] || '—'}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500 font-medium">
                                                    {formatShortDate(doctor.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right px-6 py-4">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(doctor.id)}
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setDeletingDoctor(doctor.id)
                                                                setIsDeleteModalOpen(true)
                                                            }}
                                                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden border-0 shadow-2xl p-0">
                    <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500 text-white shadow-inner">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">
                                {editingDoctor ? 'Editar Médico' : 'Registrar Nuevo Médico'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-0.5">
                                {editingDoctor
                                    ? 'Actualiza los datos del profesional en el directorio.'
                                    : 'Añade un médico al directorio de la farmacia.'
                                }
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Dra. María López"
                                className="h-12 bg-white border-slate-200 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ciudad" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lugar de Trabajo / Ciudad *</Label>
                            <Input
                                id="ciudad"
                                value={formData.ciudad}
                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                placeholder="Ej: Red Salud - Santa Cruz"
                                className="h-12 bg-white border-slate-200 rounded-xl"
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-white border-t border-slate-100 flex sm:justify-between">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="rounded-xl font-bold h-11 w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="rounded-xl h-11 w-full sm:w-auto bg-primary-500 hover:bg-primary-600 shadow-sm text-white font-bold cursor-pointer">
                            {saving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                            ) : (
                                editingDoctor ? 'Guardar Cambios' : 'Registrar Médico'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="p-6 text-center pt-8 bg-white">
                        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-slate-900 mb-2">Eliminar Médico</DialogTitle>
                        <DialogDescription className="text-slate-500 text-base">
                            Esta acción no se puede deshacer. Los reportes de ventas anteriores mantendrán el nombre registrado en la transacción.
                        </DialogDescription>
                    </div>
                    <div className="bg-slate-50 p-6 flex justify-stretch gap-3 border-t border-slate-100">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={saving}
                            className="flex-1 rounded-xl font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={saving}
                            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold shadow-lg shadow-rose-600/20 cursor-pointer"
                        >
                            {saving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</>
                            ) : (
                                'Sí, eliminar médico'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
