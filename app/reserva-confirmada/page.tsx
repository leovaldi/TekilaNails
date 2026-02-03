'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ReservaConfirmada() {
  const searchParams = useSearchParams()
  const externalReference = searchParams.get('external_reference') // El ID de la reserva
  const [status, setStatus] = useState('procesando')

  useEffect(() => {
    async function confirmarYAgendar() {
      if (!externalReference) return;

      // 1. Buscamos los datos de la reserva en Supabase
      const { data: reserva } = await supabase
        .from('reservas')
        .select('*, servicios(*), horarios_disponibles(*)')
        .eq('id', externalReference)
        .single()

      if (reserva) {
        // 2. Marcamos como pagado en Supabase
        await supabase
          .from('reservas')
          .update({ estado_pago: 'aprobado' })
          .eq('id', externalReference)

        // 3. Mandamos al Google Calendar
        await fetch('/api/calendar', {
          method: 'POST',
          body: JSON.stringify({
            nombreCliente: reserva.nombre_cliente,
            nombreServicio: reserva.servicios.nombre,
            diaHora: reserva.horarios_disponibles.dia_hora,
            whatsapp: reserva.whatsapp_cliente
          })
        })
        
        setStatus('listo')
      }
    }
    confirmarYAgendar()
  }, [externalReference])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        {status === 'procesando' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-fuchsia-500" size={48} />
            <p className="text-sm font-medium uppercase tracking-widest">Confirmando tu lugar...</p>
          </div>
        ) : (
          <>
            <CheckCircle size={80} className="text-fuchsia-500 mx-auto animate-bounce" />
            <h1 className="text-3xl font-bold">¡Todo listo!</h1>
            <p className="text-zinc-500">Tu turno ya fue agendado. Rocío te contactará por WhatsApp para los detalles finales.</p>
            <Link href="/" className="block w-full py-4 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-widest">
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  )
}