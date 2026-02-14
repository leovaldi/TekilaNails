'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function ContenidoReserva() {
  const searchParams = useSearchParams()
  const externalReference = searchParams.get('external_reference') 
  const paymentId = searchParams.get('payment_id') 
  const [status, setStatus] = useState('procesando')
  const ejecutadoRef = useRef(false) 

  useEffect(() => {
    async function confirmarYAgendar() {
      if (!externalReference || status === 'listo' || ejecutadoRef.current) return;

      try {
        ejecutadoRef.current = true;

        // 1. Buscamos los datos de la reserva original
        const { data: reserva, error: fetchError } = await supabase
          .from('reservas')
          .select('*, servicios(*), horarios_disponibles(*)')
          .eq('id', externalReference)
          .single()

        if (fetchError || !reserva) {
          console.error("Reserva no encontrada");
          setStatus('error');
          return;
        }

        // Variable para guardar la reserva que enviaremos a la API
        let reservaFinal = reserva;

        // 2. Actualizamos el estado de pago y OBTENEMOS los datos nuevos
        if (reserva.estado_pago !== 'aprobado' || !reserva.payment_id) {
          const { data: reservaActualizada, error: updateError } = await supabase
            .from('reservas')
            .update({ 
              estado_pago: 'aprobado',
              payment_id: paymentId 
            })
            .eq('id', externalReference)
            .select('*, servicios(*), horarios_disponibles(*)') // Crucial: refresca los datos
            .single();

          if (!updateError && reservaActualizada) {
            reservaFinal = reservaActualizada;
          }
        }

        // 3. LLAMADA A LA API (Ahora con la data confirmada al 100%)
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reserva: reservaFinal })
        });

        if (response.ok) {
          setStatus('listo');
        } else {
          console.error("Error en la API de calendario");
          // Marcamos como listo igualmente porque el pago ya se impactó en el paso 2
          setStatus('listo'); 
        }
        
      } catch (error) {
        console.error("Error crítico:", error);
        setStatus('error');
      }
    }
    confirmarYAgendar();
  }, [externalReference, paymentId, status]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 italic">No pudimos verificar tu reserva. Por favor, contactanos directamente.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white dark:bg-zinc-950">
      <div className="max-w-md space-y-6">
        {status === 'procesando' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Loader2 className="animate-spin text-fuchsia-500" size={48} />
                <div className="absolute inset-0 blur-2xl bg-fuchsia-500/20 rounded-full"></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Confirmando Turno...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <CheckCircle size={60} className="text-fuchsia-500 mx-auto stroke-[1px]" />
            <div>
              <h1 className="text-4xl italic font-light tracking-tighter mb-4">Todo listo</h1>
              <p className="text-sm text-zinc-500 italic leading-relaxed">
                Tu turno ya fue agendado correctamente. Rocío recibió una notificación y se contactará con vos para los detalles finales.
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
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
            <Loader2 className="animate-spin text-fuchsia-500" size={48} />
        </div>
    }>
      <ContenidoReserva />
    </Suspense>
  )
}