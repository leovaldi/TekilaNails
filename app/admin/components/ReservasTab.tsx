'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Scissors, Calendar as CalendarIcon, ChevronDown, ChevronUp, CheckSquare, Square, UserCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function ReservasTab({ reservas, fetchData }: { reservas: any[], fetchData: () => void }) {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const toggleDay = (day: string) => {
    setExpandedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const agruparPorDia = (lista: any[]) => {
    const grupos: { [key: string]: any[] } = {};
    lista.forEach(r => {
      const fecha = r.horarios_disponibles?.dia_hora.split('T')[0];
      if (fecha) {
        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(r);
      }
    });
    return grupos;
  };

  const reservasAgrupadas = agruparPorDia(reservas);

  // FUNCIÓN: Asistió / Eliminar con ALERTA DE SEGURIDAD
  async function eliminarReservas(ids: string[]) {
    // 1. Definimos el mensaje según si es uno o varios
    const mensaje = ids.length === 1
      ? "¿Confirmás que la clienta asistió? Se eliminará la reserva del panel."
      : `¿Estás segura de marcar asistencia para ${ids.length} clientas? Se eliminarán de la lista permanentemente.`;

    // 2. Alerta de confirmación para evitar errores al tocar cerca de WhatsApp
    if (!window.confirm(mensaje)) return;

    try {
      const { data: res } = await supabase
        .from('reservas')
        .select('horario_id')
        .in('id', ids);

      const horarioIds = res?.map(r => r.horario_id).filter(Boolean);

      // Borramos las reservas
      await supabase.from('reservas').delete().in('id', ids);

      // Borramos los horarios para limpiar la base de datos
      if (horarioIds && horarioIds.length > 0) {
        await supabase.from('horarios_disponibles').delete().in('id', horarioIds);
      }

      setSeleccionados([]);
      fetchData();
    } catch (error) {
      console.error("Error al procesar asistencia:", error);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500 flex items-center gap-2">
          <CalendarIcon size={14} /> Hoja de Ruta / Reservas
        </h2>

        {seleccionados.length > 0 && (
          <button
            onClick={() => eliminarReservas(seleccionados)}
            className="px-4 py-2 bg-fuchsia-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-in fade-in zoom-in duration-200 shadow-lg shadow-fuchsia-500/20"
          >
            <UserCheck size={14} /> Confirmar Selección ({seleccionados.length})
          </button>
        )}
      </div>

      {Object.keys(reservasAgrupadas).length === 0 ? (
        <p className="text-center py-10 italic text-zinc-400">No hay reservas pendientes.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(reservasAgrupadas).sort().map(([dia, lista]) => (
            <div key={dia} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm transition-all">

              <button
                onClick={() => toggleDay(dia)}
                className="w-full px-6 py-5 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-fuchsia-50 dark:bg-fuchsia-500/10 rounded-xl flex items-center justify-center text-fuchsia-500 font-bold italic">
                    {dia.split('-')[2]}
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">
                      {new Date(dia + "T12:00:00").toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400">{lista.length} Clientas</p>
                  </div>
                </div>
                {expandedDays.includes(dia) ? <ChevronUp size={20} className="text-zinc-300" /> : <ChevronDown size={20} className="text-zinc-300" />}
              </button>

              {expandedDays.includes(dia) && (
                <div className="px-6 pb-6 pt-2 space-y-4 divide-y divide-zinc-50 dark:divide-zinc-800">
                  {lista.map((r) => {
                    const fecha = new Date(r.horarios_disponibles?.dia_hora);
                    const hora24 = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const numWhatsApp = r.whatsapp_cliente.replace(/\D/g, '');
                    const mensajeWA = `Hola ${r.nombre_cliente}! Te escribo de Tekila Nails por tu turno de hoy a las ${hora24}hs.`;

                    return (
                      <div key={r.id} className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">

                        <div className="flex items-center gap-4 w-full">
                          <button
                            onClick={() => {
                              if (seleccionados.includes(r.id)) setSeleccionados(seleccionados.filter(id => id !== r.id));
                              else setSeleccionados([...seleccionados, r.id]);
                            }}
                            className="text-zinc-200 hover:text-fuchsia-500 transition-colors"
                          >
                            {seleccionados.includes(r.id) ? <CheckSquare size={20} className="text-fuchsia-500" /> : <Square size={20} />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{hora24}hs</span>
                              <p className="text-sm font-bold tracking-tight">{r.nombre_cliente}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-zinc-400">
                              <span className="text-[9px] uppercase flex items-center gap-1 font-medium">
                                <Scissors size={10} /> {r.servicios?.nombre}
                              </span>
                              <span className="text-[9px] font-bold text-green-500">
                                SEÑA: {formatMoney(r.monto_senia)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <a
                            href={`https://wa.me/549${numWhatsApp}?text=${encodeURIComponent(mensajeWA)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-2xl hover:scale-110 transition-all border border-green-100 dark:border-green-500/20"
                          >
                            <FaWhatsapp size={20} />
                          </a>
                          <button
                            onClick={() => eliminarReservas([r.id])}
                            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-fuchsia-500 transition-all"
                          >
                            <UserCheck size={14} /> Asistió
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}