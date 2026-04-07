'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, User, AlertCircle, CheckCircle2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { PrimaryButton } from './Button'

interface Servicio {
  id: string
  nombre: string
}

export function BookingFlow({ servicio, totalAPagarAhora, totalServicio }: { servicio: Servicio, totalAPagarAhora: number, totalServicio: number }) {
  const [step, setStep] = useState(1)
  const [horarios, setHorarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const [errores, setErrores] = useState({ nombre: false, whatsapp: false, msg: '' })

  const [seleccion, setSeleccion] = useState({
    horarioId: '',
    nombre: '',
    whatsapp: '',
    label: ''
  })

  useEffect(() => {
    async function cargarHorarios() {
      const { data } = await supabase
        .from('horarios_disponibles')
        .select('*')
        .eq('estado', 'disponible')
        .order('dia_hora', { ascending: true })

      if (data && data.length > 0) {
        const ahora = new Date()
        const futuros = data.filter(h => new Date(h.dia_hora) > ahora)
        setHorarios(futuros)
      }
      setLoading(false)
    }
    cargarHorarios()
  }, [])

  const groupedHorarios: Record<string, Record<string, any[]>> = useMemo(() => {
    return horarios.reduce((acc, h) => {
      const fecha = new Date(h.dia_hora)
      const mes = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
      let dia = fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })
      dia = dia.charAt(0).toUpperCase() + dia.slice(1)

      if (!acc[mes]) acc[mes] = {}
      if (!acc[mes][dia]) acc[mes][dia] = []

      acc[mes][dia].push({
        ...h,
        horaStr: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
      })
      return acc
    }, {} as Record<string, Record<string, any[]>>)
  }, [horarios])

  const handleFinalizarReserva = async () => {
    const nombreLimpio = seleccion.nombre.trim()
    const waLimpio = seleccion.whatsapp.replace(/\D/g, '')

    let errorNombre = false
    let errorWA = false
    let mensaje = ''

    if (nombreLimpio.length < 3) {
      errorNombre = true
      mensaje = "El nombre es muy corto."
    } else if (nombreLimpio.length > 35) {
      errorNombre = true
      mensaje = "Nombre demasiado largo."
    }

    if (waLimpio.length < 10) {
      errorWA = true
      mensaje = "El número debe tener al menos 10 dígitos."
    } else if (waLimpio.length > 15) {
      errorWA = true
      mensaje = "Número no válido (demasiado largo)."
    }

    if (errorNombre || errorWA) {
      setErrores({ nombre: errorNombre, whatsapp: errorWA, msg: mensaje })
      return
    }

    setIsProcessing(true)
    try {
      const { data: reserva, error: resError } = await supabase
        .from('reservas')
        .insert([{
          servicio_id: servicio.id,
          horario_id: seleccion.horarioId,
          nombre_cliente: nombreLimpio,
          whatsapp_cliente: waLimpio,
          monto_senia: totalAPagarAhora,
          estado_pago: 'pendiente',
        }])
        .select()
        .single()

      if (resError) throw resError

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreServicio: servicio.nombre,
          precioSenia: totalAPagarAhora,
          reservaId: reserva.id
        })
      })

      const { init_point } = await response.json()

      if (init_point) {
        window.location.href = init_point
      } else {
        throw new Error("No se pudo generar el init_point")
      }

    } catch (error) {
      console.error(error)
      alert("Hubo un problema al procesar la reserva. Por favor reintentá.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
            <label className="text-[0.625rem] uppercase tracking-[0.3em] font-black text-zinc-400 flex items-center gap-2 italic">
              <Calendar size={14} className="text-tekila-pink" /> 1. Disponibilidad
            </label>
            <span className="text-[0.5625rem] text-zinc-300 italic font-medium uppercase tracking-tighter">Maipú, Mendoza</span>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {loading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-900/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : Object.keys(groupedHorarios).length > 0 ? (
              Object.entries(groupedHorarios).map(([mes, dias]) => (
                <div key={mes} className="border border-zinc-100 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedMonth(expandedMonth === mes ? null : mes)}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                  >
                    <span className="text-[0.6875rem] uppercase tracking-widest font-black text-tekila-pink capitalize">{mes}</span>
                    <span className="text-zinc-400">
                      {expandedMonth === mes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {expandedMonth === mes && (
                    <div className="p-3 bg-background flex flex-col gap-3">
                      {Object.entries(dias).map(([dia, turnos]) => (
                        <div key={dia} className="border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => setExpandedDay(expandedDay === dia ? null : dia)}
                            className="w-full p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                          >
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{dia}</span>
                            <span className="text-zinc-400">
                              {expandedDay === dia ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          </button>

                          {expandedDay === dia && (
                            <div className="p-4 grid grid-cols-2 gap-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-t border-zinc-50 dark:border-zinc-800/50">
                              {turnos.map((h: any) => {
                                const isSelected = seleccion.horarioId === h.id
                                return (
                                  <button
                                    key={h.id}
                                    onClick={() => setSeleccion({ ...seleccion, horarioId: h.id, label: `${dia} - ${h.horaStr} hs` })}
                                    className={`py-3 px-4 rounded-xl transition-all duration-300 border flex justify-center items-center gap-2 ${isSelected
                                      ? 'border-tekila-pink bg-tekila-pink text-white shadow-md scale-[1.02]'
                                      : 'border-zinc-200 dark:border-zinc-700 bg-background hover:border-tekila-pink/50 text-zinc-600 dark:text-zinc-300'
                                      }`}
                                  >
                                    <span className={`text-sm tracking-wide ${isSelected ? 'font-bold' : 'font-medium'}`}>{h.horaStr} hs</span>
                                    {isSelected && <CheckCircle2 size={16} className="text-white shrink-0" />}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center border border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
                <p className="text-[0.625rem] uppercase tracking-widest text-zinc-400 italic">No hay turnos disponibles por el momento.</p>
              </div>
            )}
          </div>

          <button
            disabled={!seleccion.horarioId}
            onClick={() => setStep(2)}
            className={`w-full py-6 px-8 rounded-full uppercase tracking-widest text-[0.75rem] font-black transition-all duration-300 shadow-xl ${!seleccion.horarioId
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed shadow-none'
              : 'bg-tekila-pink text-white hover:bg-tekila-pink/90 hover:scale-[1.02]'
              }`}
          >
            Confirmar Horario
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

          <div className="space-y-5">
            <label className="text-[0.625rem] uppercase tracking-[0.3em] font-black text-zinc-400 flex items-center gap-2 italic">
              <User size={14} className="text-tekila-pink" /> Datos de contacto
            </label>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={35}
                placeholder="Nombre y Apellido completo"
                className={`w-full p-5 bg-zinc-50 dark:bg-zinc-900 rounded-[1.375rem] text-sm outline-none border transition-all ${errores.nombre ? 'border-red-500 ring-1 ring-red-500/20' : 'border-zinc-100 dark:border-zinc-800'
                  } focus:border-tekila-pink`}
                value={seleccion.nombre}
                onChange={(e) => { setSeleccion({ ...seleccion, nombre: e.target.value }); setErrores({ ...errores, nombre: false }) }}
              />

              <input
                type="tel"
                maxLength={15}
                placeholder="WhatsApp (Ej: 261 555 6677)"
                className={`w-full p-5 bg-zinc-50 dark:bg-zinc-900 rounded-[1.375rem] text-sm outline-none border transition-all ${errores.whatsapp ? 'border-red-500 ring-1 ring-red-500/20' : 'border-zinc-100 dark:border-zinc-800'
                  } focus:border-tekila-pink`}
                value={seleccion.whatsapp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setSeleccion({ ...seleccion, whatsapp: val });
                  setErrores({ ...errores, whatsapp: false })
                }}
              />

              {errores.msg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-[0.625rem] text-red-600 dark:text-red-400 font-bold uppercase tracking-tight leading-none">{errores.msg}</p>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN DE PAGO SINCRONIZADO - IMPACT CARD NEON */}
          <div className="p-6 rounded-[1.875rem] bg-gradient-to-br from-[#ff0080] to-[#b00058] shadow-[0_20px_50px_rgba(255,0,128,0.3)] border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="flex flex-col gap-3 mb-6 relative z-10">
              <div className="flex justify-between text-[0.625rem] text-white/70 uppercase tracking-widest">
                <span>Valor del servicio</span>
                <span className="text-white font-medium">${totalServicio.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-[0.625rem] text-white/70 uppercase tracking-widest">
                <span>Valor de la seña</span>
                <span className="text-white font-medium">${(totalServicio / 2).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-[0.625rem] text-white/70 uppercase tracking-widest">
                <span>Gestión online (MP)</span>
                <span className="text-white font-medium">${(totalAPagarAhora - (totalServicio / 2)).toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 pt-5 border-t border-white/20 relative z-10">
              <span className="text-[0.6875rem] uppercase tracking-[0.2em] font-black text-white">Total a abonar hoy</span>
              <span className="text-3xl font-black text-white drop-shadow-md">
                ${totalAPagarAhora.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2 text-[0.5625rem] text-white/80 italic font-medium">
                <CheckCircle2 size={12} className="text-white" />
                <p>Turno: {seleccion.label}</p>
              </div>
              <p className="text-[0.5rem] text-white/50 uppercase tracking-widest font-medium">
                * Incluye gasto de gestión por pago online
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <PrimaryButton
              text={isProcessing ? "Redirigiendo..." : "Pagar y Reservar"}
              disabled={isProcessing}
              onClick={handleFinalizarReserva}
            />
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 text-[0.5625rem] uppercase tracking-[0.4em] text-zinc-400 hover:text-tekila-pink transition-colors font-black"
            >
              <ArrowLeft size={12} /> Volver a horarios
            </button>
          </div>
        </div>
      )}
    </div>
  )
}