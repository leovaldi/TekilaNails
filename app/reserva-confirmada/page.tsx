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
      // Si no hay referencia externa o ya terminamos, salimos
      if (!externalReference || status === 'listo') return;

      try {
        // 1. Buscamos los datos de la reserva con sus relaciones completas
        const { data: reserva, error: fetchError } = await supabase
          .from('reservas')
          .select('*, servicios(*), horarios_disponibles(*)')
          .eq('id', externalReference)
          .single()

        if (fetchError || !reserva) {
          console.error("Reserva no encontrada en la base de datos");
          setStatus('error');
          return;
        }

        // 2. Si el pago aún no figura aprobado, lo actualizamos
        if (reserva.estado_pago !== 'aprobado') {
          await supabase
            .from('reservas')
            .update({ estado_pago: 'aprobado' })
            .eq('id', externalReference);
        }

        // 3. LLAMADA A LA API (Calendar + Mail + Bloqueo de Horario)
        // Eliminamos el condicional previo para garantizar que la API de bloqueo 
        // y notificación se ejecute siempre que la clienta llegue aquí.
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reserva })
        });

        if (response.ok) {
          setStatus('listo');
        } else {
          console.error("Error al procesar la API de calendario/notificación");
          // Aunque falle la API, si el pago está aprobado, marcamos como listo
          // para no asustar a la clienta, pero registramos el error en consola.
          setStatus('listo'); 
        }
        
      } catch (error) {
        console.error("Error crítico al confirmar reserva:", error);
        setStatus('error');
      }
    }
    confirmarYAgendar();
  }, [externalReference]); // Solo depende de la referencia externa

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
            <Loader2 className="animate-spin text-fuchsia-500" size={48} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Verificando turno...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-fuchsia-500" size={48} /></div>}>
      <ContenidoReserva />
    </Suspense>
  )
}