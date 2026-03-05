'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Phone, AlertCircle, CheckCircle2, Trash2, ArrowLeft } from 'lucide-react'
import { PrimaryButton } from './Button'

interface Servicio {
  id: string
  nombre: string
}

export function BookingFlow({ servicio, totalAPagarAhora }: { servicio: Servicio, totalAPagarAhora: number }) {
  const [step, setStep] = useState(1)
  const [horarios, setHorarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conRetiro, setConRetiro] = useState(false)

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

      if (data) {
        const ahora = new Date()
        // Filtramos solo turnos futuros
        const futuros = data.filter(h => new Date(h.dia_hora) > ahora)
        setHorarios(futuros)
      }
      setLoading(false)
    }
    cargarHorarios()
  }, [])

  const handleFinalizarReserva = async () => {
    const nombreLimpio = seleccion.nombre.trim()
    const waLimpio = seleccion.whatsapp.replace(/\D/g, '')

    let errorNombre = false
    let errorWA = false
    let mensaje = ''

    // VALIDACIONES DE SEGURIDAD
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
      // 1. Insertamos la reserva en Supabase
      const { data: reserva, error: resError } = await supabase
        .from('reservas')
        .insert([{
          servicio_id: servicio.id,
          horario_id: seleccion.horarioId,
          nombre_cliente: nombreLimpio,
          whatsapp_cliente: waLimpio,
          monto_senia: totalAPagarAhora,
          estado_pago: 'pendiente',
          // Asegúrate de tener esta columna en tu DB si quieres trackear el retiro
          notas: conRetiro ? "Requiere retiro previo de otro salón" : ""
        }])
        .select()
        .single()

      if (resError) throw resError

      // 2. Generamos el link de Mercado Pago
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreServicio: `${servicio.nombre}${conRetiro ? ' (+ Retiro)' : ''}`,
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

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return {
      dia: fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }),
      // FORZAMOS FORMATO 24HS
      hora: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">

      {/* PASO 1: SELECCIÓN DE TURNO */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 flex items-center gap-2 italic">
              <Calendar size={14} className="text-fuchsia-500" /> 1. Disponibilidad
            </label>
            <span className="text-[9px] text-zinc-300 italic font-medium uppercase tracking-tighter">Maipú, Mendoza</span>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
            {loading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-900/50 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : horarios.length > 0 ? (
              horarios.map((h) => {
                const f = formatearFecha(h.dia_hora)
                const isSelected = seleccion.horarioId === h.id
                return (
                  <button
                    key={h.id}
                    onClick={() => setSeleccion({ ...seleccion, horarioId: h.id, label: `${f.dia} - ${f.hora} hs` })}
                    className={`flex justify-between items-center p-5 rounded-2xl transition-all duration-300 border ${isSelected
                        ? 'border-fuchsia-500 bg-fuchsia-50/30 dark:bg-fuchsia-500/5 ring-1 ring-fuchsia-500'
                        : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                      }`}
                  >
                    <div className="text-left">
                      <p className={`text-[10px] uppercase tracking-wider font-black mb-1 ${isSelected ? 'text-fuchsia-600' : 'text-zinc-400'}`}>
                        {f.dia}
                      </p>
                      <p className="text-lg font-light italic leading-none">{f.hora} hs</p>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="text-fuchsia-500" />}
                  </button>
                )
              })
            ) : (
              <div className="py-12 text-center border border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 italic">No hay turnos disponibles por el momento.</p>
              </div>
            )}
          </div>

          <PrimaryButton
            text="Confirmar Horario"
            disabled={!seleccion.horarioId}
            onClick={() => setStep(2)}
          />
        </div>
      )}

      {/* PASO 2: DATOS Y ADICIONALES */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

          {/* SECCIÓN RETIRO PREVIO */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 flex items-center gap-2 italic">
              <Trash2 size={14} className="text-fuchsia-500" /> Adicional Necesario
            </label>
            <button
              onClick={() => setConRetiro(!conRetiro)}
              className={`w-full p-5 rounded-[25px] border-2 transition-all duration-500 flex justify-between items-center group ${conRetiro
                  ? 'border-fuchsia-500 bg-fuchsia-500/5 shadow-lg shadow-fuchsia-500/10'
                  : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200'
                }`}
            >
              <div className="text-left pr-4">
                <p className={`text-sm font-bold transition-colors ${conRetiro ? 'text-fuchsia-600' : 'text-zinc-800 dark:text-zinc-100'}`}>
                  ¿Traés producto de otro salón?
                </p>
                <p className="text-[10px] text-zinc-400 italic font-light leading-tight mt-1">
                  Seleccioná esta opción si necesitás retiro previo.
                </p>
              </div>
              <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${conRetiro ? 'bg-fuchsia-500 border-fuchsia-500 scale-110' : 'border-zinc-200 dark:border-zinc-700'}`}>
                {conRetiro && <CheckCircle2 size={14} className="text-white" />}
              </div>
            </button>
          </div>

          {/* DATOS PERSONALES */}
          <div className="space-y-5">
            <label className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-400 flex items-center gap-2 italic">
              <User size={14} className="text-fuchsia-500" /> Datos de contacto
            </label>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={35}
                placeholder="Nombre y Apellido completo"
                className={`w-full p-5 bg-zinc-50 dark:bg-zinc-900 rounded-[22px] text-sm outline-none border transition-all ${errores.nombre ? 'border-red-500 ring-1 ring-red-500/20' : 'border-zinc-100 dark:border-zinc-800'
                  } focus:border-fuchsia-500`}
                value={seleccion.nombre}
                onChange={(e) => { setSeleccion({ ...seleccion, nombre: e.target.value }); setErrores({ ...errores, nombre: false }) }}
              />

              <input
                type="tel"
                maxLength={15}
                placeholder="WhatsApp (Ej: 261 555 6677)"
                className={`w-full p-5 bg-zinc-50 dark:bg-zinc-900 rounded-[22px] text-sm outline-none border transition-all ${errores.whatsapp ? 'border-red-500 ring-1 ring-red-500/20' : 'border-zinc-100 dark:border-zinc-800'
                  } focus:border-fuchsia-500`}
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
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-tight leading-none">{errores.msg}</p>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN DE PAGO */}
          <div className="bg-zinc-50 dark:bg-zinc-900/80 p-6 rounded-[30px] border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">Total Seña</span>
              <span className="text-2xl font-black text-fuchsia-600">${totalAPagarAhora.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-zinc-400 italic">
              <CheckCircle2 size={10} className="text-fuchsia-500" />
              <p>Turno: {seleccion.label}</p>
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
              className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.4em] text-zinc-400 hover:text-fuchsia-500 transition-colors font-black"
            >
              <ArrowLeft size={12} /> Volver a horarios
            </button>
          </div>
        </div>
      )}
    </div>
  )
}