'use client'
import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Calendar, User, Phone, CheckCircle2, Clock } from 'lucide-react'

interface Props {
    servicios: any[]
    horarios: any[]
    fetchData: () => void
}

export default function ManualReservasTab({ servicios, horarios, fetchData }: Props) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        whatsapp_cliente: '',
        servicio_id: '',
        horario_id: ''
    })

    const horariosFiltrados = useMemo(() => {
        const ahora = new Date();
        return horarios
            .filter(h => h.estado === 'disponible')
            .filter(h => new Date(h.dia_hora) >= ahora)
            .sort((a, b) => new Date(a.dia_hora).getTime() - new Date(b.dia_hora).getTime());
    }, [horarios]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // INSERT SIN LA COLUMNA 'NOTAS'
            const { data: nuevaReserva, error: insertError } = await supabase
                .from('reservas')
                .insert([{
                    nombre_cliente: formData.nombre_cliente,
                    whatsapp_cliente: formData.whatsapp_cliente,
                    servicio_id: parseInt(formData.servicio_id),
                    horario_id: parseInt(formData.horario_id),
                    estado_pago: 'aprobado',
                    monto_senia: 0,
                    payment_id: 'MANUAL-' + Date.now()
                }])
                .select('*, servicios(*), horarios_disponibles(*)')
                .single()

            if (insertError) throw insertError

            // Sigue disparando la API de Calendar (las notas irán vacías o undefined)
            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reserva: nuevaReserva })
            })

            setSuccess(true)
            fetchData()

            setTimeout(() => {
                setSuccess(false)
                setFormData({ nombre_cliente: '', whatsapp_cliente: '', servicio_id: '', horario_id: '' })
            }, 3000)

        } catch (error) {
            console.error("Error:", error)
            alert("Error al crear la reserva. Revisa la consola.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={64} className="text-tekila-pink mb-4" />
                <h2 className="text-xl italic font-light">Reserva Agendada</h2>
                <p className="text-[0.625rem] text-zinc-500 uppercase tracking-widest mt-2">Sincronizado con Calendar y bloqueado en la web</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[0.625rem] uppercase tracking-widest text-zinc-500 ml-2 text-left block">Nombre Cliente</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                required
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-tekila-pink transition-all"
                                placeholder="Ej: Maria Lopez"
                                value={formData.nombre_cliente}
                                onChange={e => setFormData({ ...formData, nombre_cliente: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.625rem] uppercase tracking-widest text-zinc-500 ml-2 text-left block">WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                required
                                className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-tekila-pink transition-all"
                                placeholder="261..."
                                value={formData.whatsapp_cliente}
                                onChange={e => setFormData({ ...formData, whatsapp_cliente: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[0.625rem] uppercase tracking-widest text-zinc-500 ml-2 text-left block">Servicio</label>
                        <select
                            required
                            className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-tekila-pink appearance-none cursor-pointer"
                            value={formData.servicio_id}
                            onChange={e => setFormData({ ...formData, servicio_id: e.target.value })}
                        >
                            <option value="">Seleccionar servicio...</option>
                            {servicios.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre} - ${s.precio}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[0.625rem] uppercase tracking-widest text-zinc-500 ml-2 text-left block">Horario Disponible</label>
                        <div className="relative">
                            <select
                                required
                                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-tekila-pink appearance-none cursor-pointer"
                                value={formData.horario_id}
                                onChange={e => setFormData({ ...formData, horario_id: e.target.value })}
                            >
                                <option value="">Seleccionar turno...</option>
                                {horariosFiltrados.map(h => {
                                    const fecha = new Date(h.dia_hora);
                                    const label = fecha.toLocaleString('es-AR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    }) + ' hs';

                                    return <option key={h.id} value={h.id}>{label}</option>
                                })}
                            </select>
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || horariosFiltrados.length === 0}
                    className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase text-[0.75rem] tracking-[0.2em] hover:bg-tekila-pink hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Turno Manual'}
                </button>
            </form>
        </div>
    )
}