'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit3, Clock, Calendar as CalIcon, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { PrimaryButton } from "@/components/Button";

export default function HorariosTab({ horarios, nuevoHorario, setNuevoHorario, guardarHorario, editId, setEditId, borrarHorario, fetchData }: any) {
  
  const [view, setView] = useState<'libres' | 'dados'>('libres');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filtros y Orden
  const ordenar = (lista: any[]) => [...lista].sort((a, b) => new Date(a.dia_hora).getTime() - new Date(b.dia_hora).getTime());
  const ahora = new Date();
  const libres = ordenar(horarios.filter((h: any) => h.estado === 'disponible' && new Date(h.dia_hora) >= ahora));
  const ocupados = ordenar(horarios.filter((h: any) => h.estado === 'reservado'));
  const pasados = ordenar(horarios.filter((h: any) => h.estado === 'disponible' && new Date(h.dia_hora) < ahora));

  // FUNCIÓN: Liberar Turno (Cancela reserva y vuelve a poner disponible)
  async function liberarTurno(horarioId: string) {
    if (!confirm("¿Estás segura? Se eliminará la reserva de la clienta y el turno volverá a estar disponible en la web.")) return;

    try {
      // 1. Eliminamos la reserva asociada a ese horario
      await supabase.from('reservas').delete().eq('horario_id', horarioId);
      // 2. Volvemos a poner el horario como disponible
      await supabase.from('horarios_disponibles').update({ estado: 'disponible' }).eq('id', horarioId);
      
      fetchData(); // Refrescamos la lista
    } catch (error) {
      console.error("Error al liberar:", error);
    }
  }

  // FUNCIÓN: Limpiar Base de Datos (Borra turnos pasados de hace más de 30 días)
  async function limpiarBaseDatos() {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    try {
      // Borramos horarios libres que ya pasaron hace más de un mes
      await supabase.from('horarios_disponibles')
        .delete()
        .eq('estado', 'disponible')
        .lt('dia_hora', fechaLimite.toISOString());
      
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      console.error("Error en limpieza:", error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* SECCIÓN CARGA */}
      <div className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <h2 className="text-[10px] uppercase tracking-widest text-fuchsia-500 mb-6 font-bold flex items-center gap-2">
          <Clock size={14} /> Gestión de Disponibilidad
        </h2>
        <div className="space-y-4">
          <input 
            type="datetime-local" 
            className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-sm border border-zinc-100 dark:border-zinc-700 outline-none text-black dark:text-white" 
            value={nuevoHorario} 
            onChange={e => setNuevoHorario(e.target.value)} 
          />
          <PrimaryButton text={editId ? "Actualizar" : "Publicar Turno"} onClick={guardarHorario} />
        </div>
      </div>

      {/* SELECTOR MÓVIL */}
      <div className="flex justify-center">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl w-full max-w-xs">
          <button onClick={() => setView('libres')} className={`flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${view === 'libres' ? 'bg-white dark:bg-zinc-800 text-fuchsia-500 shadow-sm' : 'text-zinc-400'}`}>Libres ({libres.length})</button>
          <button onClick={() => setView('dados')} className={`flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${view === 'dados' ? 'bg-white dark:bg-zinc-800 text-green-500 shadow-sm' : 'text-zinc-400'}`}>Dados ({ocupados.length})</button>
        </div>
      </div>

      {/* LISTAS */}
      <div className="space-y-4">
        {view === 'libres' ? (
          <div className="space-y-2">
            {libres.map((h: any) => (
              <div key={h.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl min-w-[55px]">
                    <p className="text-[10px] font-bold text-fuchsia-500">{new Date(h.dia_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[8px] text-zinc-400 uppercase">{new Date(h.dia_hora).toLocaleDateString('es-AR', { day:'2-digit', month:'short' })}</p>
                  </div>
                  <p className="text-xs font-medium capitalize">{new Date(h.dia_hora).toLocaleDateString('es-AR', { weekday: 'short' })}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditId(h.id); setNuevoHorario(h.dia_hora.slice(0, 16)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 text-zinc-400"><Edit3 size={16}/></button>
                  <button onClick={() => borrarHorario(h.id)} className="p-3 text-zinc-400"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {ocupados.map((h: any) => (
              <div key={h.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-transparent rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-white dark:bg-zinc-800 p-2 rounded-xl min-w-[55px]">
                    <p className="text-[10px] font-bold text-green-500">{new Date(h.dia_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[8px] text-zinc-400 uppercase font-black">{new Date(h.dia_hora).toLocaleDateString('es-AR', { day:'2-digit', month:'short' })}</p>
                  </div>
                  <p className="text-xs font-medium text-zinc-500 italic">Ocupado</p>
                </div>
                <button 
                  onClick={() => liberarTurno(h.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[9px] font-bold uppercase tracking-widest text-orange-500 hover:bg-orange-50 transition-all"
                >
                  <RotateCcw size={12} /> Liberar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN MANTENIMIENTO */}
      <div className="pt-12 mt-12 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-4 border border-dashed border-red-200 dark:border-red-900/30 rounded-2xl text-[9px] uppercase font-bold tracking-[0.2em] text-red-400 hover:bg-red-50 transition-all"
        >
          Mantenimiento de Base de Datos
        </button>
      </div>

      {/* MODAL DE ADVERTENCIA */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] p-8 space-y-6 shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold italic">¿Vaciar registros viejos?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Esta acción eliminará permanentemente todos los <span className="font-bold text-red-500 underline">turnos libres</span> que tengan más de 30 días de antigüedad. 
                <br/><br/>
                No afecta a las reservas confirmadas ni a los servicios. Se hace para mantener la app rápida.
              </p>
            </div>
            <div className="space-y-3">
              <button onClick={limpiarBaseDatos} className="w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] uppercase font-bold tracking-widest">Confirmar Limpieza</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-[10px] uppercase font-bold tracking-widest text-zinc-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}