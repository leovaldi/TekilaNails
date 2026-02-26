'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit3, Clock, Calendar as CalIcon, ChevronDown, ChevronUp, Plus, X, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { PrimaryButton } from "@/components/Button";

export default function HorariosTab({ horarios, nuevoHorario, setNuevoHorario, guardarHorario, editId, setEditId, borrarHorario, fetchData }: any) {
  const [view, setView] = useState<'libres' | 'dados'>('libres');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [horasSeleccionadas, setHorasSeleccionadas] = useState<string[]>([]);
  const [nuevaHora, setNuevaHora] = useState("");
  const [nuevoDia, setNuevoDia] = useState("");
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  // Nuevo estado para selección múltiple
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setExpandedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const agruparPorDia = (lista: any[]) => {
    const grupos: { [key: string]: any[] } = {};
    lista.forEach(h => {
      const fecha = h.dia_hora.split('T')[0];
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(h);
    });
    Object.keys(grupos).forEach(dia => {
      grupos[dia].sort((a, b) => new Date(a.dia_hora).getTime() - new Date(b.dia_hora).getTime());
    });
    return grupos;
  };

  const ahora = new Date();
  const libres = agruparPorDia(horarios.filter((h: any) => h.estado === 'disponible' && new Date(h.dia_hora) >= ahora));
  const ocupados = agruparPorDia(horarios.filter((h: any) => h.estado === 'reservado'));

  async function liberarTurno(horarioId: string) {
    if (!confirm("¿Liberar turno? Se borrará la reserva y el horario volverá a estar disponible en la web.")) return;
    try {
      await supabase.from('reservas').delete().eq('horario_id', horarioId);
      await supabase.from('horarios_disponibles').update({ estado: 'disponible' }).eq('id', horarioId);
      fetchData();
    } catch (e) { console.error(e); }
  }

  // Función para borrar varios a la vez
  async function borrarSeleccionados() {
    if (!confirm(`¿Borrar los ${seleccionados.length} turnos seleccionados?`)) return;
    try {
      await supabase.from('horarios_disponibles').delete().in('id', seleccionados);
      setSeleccionados([]);
      fetchData();
    } catch (e) { console.error(e); }
  }

  async function manejarGuardado() {
    if (editId) {
      await guardarHorario();
    } else {
      const inserts: any[] = [];
      diasSeleccionados.forEach(dia => {
        horasSeleccionadas.forEach(hora => {
          inserts.push({ dia_hora: new Date(`${dia}T${hora}:00`).toISOString(), estado: 'disponible' });
        });
      });
      await supabase.from('horarios_disponibles').insert(inserts);
      setDiasSeleccionados([]);
      setHorasSeleccionadas([]);
    }
    fetchData();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-black dark:text-white">

      {/* PANEL DE CARGA / EDICIÓN */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 rounded-[32px] shadow-sm">
        <h2 className="text-[10px] uppercase tracking-widest text-fuchsia-500 mb-6 font-bold flex items-center gap-2">
          <Clock size={14} /> {editId ? "Editando Horario" : "Generador de Agenda"}
        </h2>

        {editId ? (
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[9px] uppercase font-black text-zinc-400">Nuevo Día y Hora</label>
              <input type="datetime-local" className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-sm border border-zinc-100 dark:border-zinc-700 outline-none"
                value={nuevoHorario} onChange={e => setNuevoHorario(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <PrimaryButton text="Actualizar" onClick={manejarGuardado} />
              <button onClick={() => { setEditId(null); setNuevoHorario(""); }} className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-[10px] uppercase font-bold">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[9px] uppercase font-black text-zinc-400">1. Elegir Días</label>
              <div className="flex gap-2">
                <input type="date" className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm border border-zinc-100 dark:border-zinc-700 outline-none"
                  value={nuevoDia} onChange={e => setNuevoDia(e.target.value)} />
                <button onClick={() => { if (nuevoDia && !diasSeleccionados.includes(nuevoDia)) setDiasSeleccionados([...diasSeleccionados, nuevoDia]); setNuevoDia(""); }}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-fuchsia-500 transition-all"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {diasSeleccionados.map(d => (
                  <span key={d} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-bold flex items-center gap-2">
                    {d.split('-').reverse().slice(0, 2).join('/')}
                    <X size={12} className="cursor-pointer text-red-400" onClick={() => setDiasSeleccionados(diasSeleccionados.filter(x => x !== d))} />
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] uppercase font-black text-zinc-400">2. Elegir Horarios (24hs)</label>
              <div className="flex gap-2">
                <input type="time" className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm border border-zinc-100 dark:border-zinc-700 outline-none"
                  value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} />
                <button onClick={() => { if (nuevaHora && !horasSeleccionadas.includes(nuevaHora)) setHorasSeleccionadas([...horasSeleccionadas, nuevaHora]); setNuevaHora(""); }}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-fuchsia-500 transition-all"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {horasSeleccionadas.map(h => (
                  <span key={h} className="px-3 py-1 bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 rounded-full text-[10px] font-bold flex items-center gap-2">
                    {h}hs
                    <X size={12} className="cursor-pointer" onClick={() => setHorasSeleccionadas(horasSeleccionadas.filter(x => x !== h))} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {!editId && (
          <div className="mt-8 pt-6 border-t border-zinc-50 dark:border-zinc-800">
            <PrimaryButton
              text={`Generar ${diasSeleccionados.length * horasSeleccionadas.length} Turnos`}
              onClick={manejarGuardado}
              disabled={diasSeleccionados.length === 0 || horasSeleccionadas.length === 0}
            />
          </div>
        )}
      </div>

      {/* SELECTOR DE VISTA */}
      <div className="flex justify-center">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl w-full max-w-xs">
          <button onClick={() => setView('libres')} className={`flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${view === 'libres' ? 'bg-white dark:bg-zinc-800 text-fuchsia-500 shadow-sm' : 'text-zinc-400'}`}>Libres</button>
          <button onClick={() => setView('dados')} className={`flex-1 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${view === 'dados' ? 'bg-white dark:bg-zinc-800 text-green-500 shadow-sm' : 'text-zinc-400'}`}>Dados</button>
        </div>
      </div>

      {/* LISTA DE DÍAS */}
      <div className="space-y-3">
        {Object.entries(view === 'libres' ? libres : ocupados).sort().map(([dia, lista]) => (
          <div key={dia} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all">
            <button onClick={() => toggleDay(dia)} className="w-full px-6 py-5 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400"><CalIcon size={18} /></div>
                <div>
                  <p className="text-sm font-bold capitalize">{new Date(dia + "T12:00:00").toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400">{lista.length} Turnos</p>
                </div>
              </div>
              {expandedDays.includes(dia) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedDays.includes(dia) && (
              <div className="px-6 pb-4 pt-2 divide-y divide-zinc-50 dark:divide-zinc-800">

                {/* BOTÓN BORRADO MASIVO */}
                {view === 'libres' && seleccionados.length > 0 && (
                  <div className="py-3 flex justify-end">
                    <button onClick={borrarSeleccionados} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                      Borrar {seleccionados.length} seleccionados
                    </button>
                  </div>
                )}

                {lista.map((h: any) => (
                  <div key={h.id} className="py-3 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      {view === 'libres' && (
                        <button
                          onClick={() => {
                            if (seleccionados.includes(h.id)) setSeleccionados(seleccionados.filter(id => id !== h.id));
                            else setSeleccionados([...seleccionados, h.id]);
                          }}
                          className="text-zinc-300 hover:text-fuchsia-500 transition-colors"
                        >
                          {seleccionados.includes(h.id) ? <CheckSquare size={18} className="text-fuchsia-500" /> : <Square size={18} />}
                        </button>
                      )}
                      <span className="text-sm font-bold">{new Date(h.dia_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}hs</span>
                    </div>

                    <div className="flex gap-2">
                      {view === 'libres' ? (
                        <>
                          <button onClick={() => { setEditId(h.id); setNuevoHorario(h.dia_hora.slice(0, 16)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-zinc-300 hover:text-fuchsia-500"><Edit3 size={16} /></button>
                          <button onClick={() => borrarHorario(h.id)} className="p-2 text-zinc-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => liberarTurno(h.id)} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold uppercase rounded-lg text-orange-500 flex items-center gap-2"><RotateCcw size={12} /> Liberar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}