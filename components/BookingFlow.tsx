'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, User, Phone, AlertCircle } from 'lucide-react'
import { PrimaryButton } from './Button'

export function BookingFlow({ servicio, totalAPagarAhora }: { servicio: any, totalAPagarAhora: number }) {
  const [step, setStep] = useState(1)
  const [horarios, setHorarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [errores, setErrores] = useState({ nombre: false, whatsapp: false })
  
  const [seleccion, setSeleccion] = useState({
    horarioId: '',
    nombre: '',
    whatsapp: ''
  })

  useEffect(() => {
    async function cargarHorarios() {
      // --- CORRECCIÓN CRÍTICA: Filtramos por estado 'disponible' ---
      const { data } = await supabase
        .from('horarios_disponibles')
        .select('*')
        .eq('estado', 'disponible') // SOLO TRAE LOS QUE NO ESTÁN RESERVADOS
        .order('dia_hora', { ascending: true })
      
      if (data) {
        const ahora = new Date()
        const futuros = data.filter(h => new Date(h.dia_hora) > ahora)
        setHorarios(futuros)
      }
      setLoading(false)
    }
    cargarHorarios()
  }, [])

  const handleFinalizarReserva = async () => {
    const errorNombre = !seleccion.nombre.trim()
    const errorWA = !seleccion.whatsapp.trim()
    
    setErrores({ nombre: errorNombre, whatsapp: errorWA })

    if (errorNombre || errorWA) return

    setIsProcessing(true)
    try {
      // Insertamos la reserva vinculando el servicio y el horario
      const { data: reserva, error: resError } = await supabase
        .from('reservas')
        .insert([{
          servicio_id: servicio.id,
          horario_id: seleccion.horarioId,
          nombre_cliente: seleccion.nombre,
          whatsapp_cliente: seleccion.whatsapp,
          monto_senia: totalAPagarAhora,
          estado_pago: 'pendiente'
        }])
        .select()
        .single()

      if (resError) throw resError

      // Generamos el checkout de Mercado Pago (que ya configuramos con el recargo)
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
        alert("Hubo un error al generar el link de pago.")
      }

    } catch (error) {
      console.error(error)
      alert("Error al procesar la reserva.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return {
      dia: fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' }),
      hora: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
      {step === 1 && (
        <div className="space-y-6">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2 italic">
            <Calendar size={14} /> 1. Seleccioná tu turno
          </label>
          
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 no-scrollbar">
            {loading ? (
              <p className="text-[10px] uppercase animate-pulse py-4">Buscando disponibilidad...</p>
            ) : horarios.length > 0 ? (
              horarios.map((h) => {
                const f = formatearFecha(h.dia_hora)
                return (
                  <button
                    key={h.id}
                    onClick={() => setSeleccion({ ...seleccion, horarioId: h.id })}
                    className={`flex justify-between items-center p-4 border rounded-xl transition-all ${
                      seleccion.horarioId === h.id 
                      ? 'border-fuchsia-500 bg-fuchsia-50/50 dark:bg-fuchsia-500/10' 
                      : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-[11px] font-medium capitalize">{f.dia}</span>
                    <span className="text-sm font-bold">{f.hora} hs</span>
                  </button>
                )
              })
            ) : (
              <p className="text-[10px] uppercase text-zinc-400 py-4 italic text-center">No hay horarios disponibles por ahora.</p>
            )}
          </div>

          <PrimaryButton 
            text="Siguiente paso" 
            disabled={!seleccion.horarioId} 
            onClick={() => setStep(2)} 
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2 italic">
            <User size={14} /> 2. Datos de contacto
          </label>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <input 
                type="text" 
                placeholder="Nombre y Apellido"
                className={`w-full p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-sm outline-none border ${errores.nombre ? 'border-red-500' : 'border-transparent'} focus:border-fuchsia-500 text-black dark:text-white transition-all`}
                value={seleccion.nombre}
                onChange={(e) => {setSeleccion({...seleccion, nombre: e.target.value}); setErrores({...errores, nombre: false})}}
              />
              {errores.nombre && <p className="text-[9px] text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10}/> El nombre es obligatorio</p>}
            </div>

            <div className="space-y-1">
              <input 
                type="tel" 
                placeholder="WhatsApp (Ej: 2615556677)"
                className={`w-full p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-sm outline-none border ${errores.whatsapp ? 'border-red-500' : 'border-transparent'} focus:border-fuchsia-500 text-black dark:text-white transition-all`}
                value={seleccion.whatsapp}
                onChange={(e) => {setSeleccion({...seleccion, whatsapp: e.target.value}); setErrores({...errores, whatsapp: false})}}
              />
              {errores.whatsapp && <p className="text-[9px] text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10}/> Necesitamos tu contacto</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <PrimaryButton 
              text={isProcessing ? "Procesando..." : "Ir a pagar seña"} 
              disabled={isProcessing}
              onClick={handleFinalizarReserva}
            />
            <button onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black">Volver a horarios</button>
          </div>
        </div>
      )}
    </div>
  )
}