'use client'
import { Scissors, Calendar as CalendarIcon } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa'; // Importamos el logo oficial

export default function ReservasTab({ reservas }: { reservas: any[] }) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  // Orden cronológico: Primero por día, luego por hora
  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const fechaA = new Date(a.horarios_disponibles?.dia_hora).getTime();
    const fechaB = new Date(b.horarios_disponibles?.dia_hora).getTime();
    return fechaA - fechaB;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500 mb-6 flex items-center gap-2">
        <CalendarIcon size={14}/> Próximos Turnos Confirmados
      </h2>
      
      {reservasOrdenadas.length === 0 ? (
        <p className="text-center py-10 italic text-zinc-400">No hay reservas confirmadas aún.</p>
      ) : (
        <div className="grid gap-4">
          {reservasOrdenadas.map((r) => {
            const fecha = new Date(r.horarios_disponibles?.dia_hora);
            const numWhatsApp = r.whatsapp_cliente.replace(/\D/g,'');
            const mensajeWA = `Hola ${r.nombre_cliente}! Confirmamos tu turno para el día ${fecha.toLocaleDateString('es-AR')} a las ${fecha.toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})}hs.`;

            return (
              <div key={r.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-md transition-all">
                
                <div className="flex items-center gap-6 w-full">
                  {/* Fecha Estilo Calendario */}
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-2xl text-center min-w-[90px] border border-zinc-100 dark:border-zinc-700">
                    <p className="text-[9px] uppercase font-bold text-zinc-400">
                      {fecha.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')}
                    </p>
                    <p className="text-2xl font-light italic leading-none my-1">{fecha.getDate()}</p>
                    <p className="text-[10px] font-bold text-fuchsia-500">
                      {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                    </p>
                  </div>

                  {/* Detalles de la Clienta */}
                  <div className="space-y-1">
                    <p className="text-lg font-medium tracking-tight leading-tight">{r.nombre_cliente}</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Scissors size={10} className="text-fuchsia-500" /> {r.servicios?.nombre}
                      </p>
                      <p className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-tighter">
                        SEÑA: {formatMoney(r.monto_senia)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón Contactar con Logo Librería */}
                <a 
                  href={`https://wa.me/549${numWhatsApp}?text=${encodeURIComponent(mensajeWA)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:border-fuchsia-500 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-500/10 transition-all group/btn"
                >
                  <FaWhatsapp size={18} className="text-[#25D366]" />
                  <span className="group-hover/btn:text-fuchsia-500 transition-colors">Contactar!</span>
                </a>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}