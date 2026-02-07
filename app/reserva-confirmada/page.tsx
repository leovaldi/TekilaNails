'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function ContenidoReserva() {
  const searchParams = useSearchParams()
  const externalReference = searchParams.get('external_reference') 
  const [status, setStatus] = useState('procesando')

  useEffect(() => {
    async function confirmarYAgendar() {
      if (!externalReference) return;

      try {
        // 1. Buscamos los datos de la reserva en Supabase
        const { data: reserva } = await supabase
          .from('reservas')
          .select('*, servicios(*), horarios_disponibles(*)')
          .eq('id', externalReference)
          .single()

        if (reserva && status === 'procesando') {
          // 2. Marcamos como pagado en Supabase
          await supabase
            .from('reservas')
            .update({ estado_pago: 'aprobado' })
            .eq('id', externalReference)

          // 3. Mandamos al Google Calendar
          const response = await fetch('/api/calendar', {
            method: 'POST',
            body: JSON.stringify({
              nombreCliente: reserva.nombre_cliente,
              nombreServicio: reserva.servicios.nombre,
              diaHora: reserva.horarios_disponibles.dia_hora,
              whatsapp: reserva.whatsapp_cliente,
              montoSena: reserva.monto_senia 
            })
          })

          const resultado = await response.json()

          // 4. Disparamos el WhatsApp a Rocío usando la variable de entorno
          if (resultado.success) {
            const nroRocio = process.env.NEXT_PUBLIC_WHATSAPP_ROCIO;
            
            if (nroRocio) {
              const fechaFormateada = new Date(reserva.horarios_disponibles.dia_hora).toLocaleDateString('es-AR');
              const horaFormateada = new Date(reserva.horarios_disponibles.dia_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

              const mensaje = `*Nuevo Turno - Tekila Nails*%0A%0A` +
                `*Cliente:* ${reserva.nombre_cliente}%0A` +
                `*Servicio:* ${reserva.servicios.nombre}%0A` +
                `*Día:* ${fechaFormateada} - ${horaFormateada} hs%0A` +
                `*WhatsApp:* ${reserva.whatsapp_cliente}%0A` +
                `*Seña:* $${reserva.monto_senia}%0A%0A` +
                `_Turno agendado en Calendar._`;

              window.open(`https://wa.me/${nroRocio}?text=${mensaje}`, '_blank');
            } else {
              console.warn("Advertencia: NEXT_PUBLIC_WHATSAPP_ROCIO no está configurado en el .env");
            }
          }
          
          setStatus('listo')
        }
      } catch (error) {
        console.error("Error al confirmar reserva:", error)
      }
    }
    confirmarYAgendar()
  }, [externalReference, status])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white dark:bg-zinc-950">
      <div className="max-w-md space-y-6">
        {status === 'procesando' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-fuchsia-500" size={48} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Verificando seña...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <CheckCircle size={60} className="text-fuchsia-500 mx-auto stroke-[1px]" />
            <div>
              <h1 className="text-4xl italic font-light tracking-tighter mb-4">¡Todo listo!</h1>
              <p className="text-sm text-zinc-500 italic leading-relaxed">
                Tu turno ya fue agendado. Rocío recibió una notificación y se contactará con vos a la brevedad para los detalles finales.
              </p>
            </div>
            <Link href="/" className="inline-block px-12 py-4 border border-black dark:border-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReservaConfirmada() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-fuchsia-500" size={48} />
      </div>
    }>
      <ContenidoReserva />
    </Suspense>
  )
}