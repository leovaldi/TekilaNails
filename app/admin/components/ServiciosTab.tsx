'use client'
import { useState } from 'react';
import { Trash2, Camera, Edit3, Scissors, PlusCircle, List, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { PrimaryButton } from "@/components/Button";
import { supabase } from '@/lib/supabase';

export default function ServiciosTab({
  servicios, nuevoServicio, setNuevoServicio, errores, setErrores,
  loading, editId, guardarServicio, prepararEdicion, cancelarEdicion,
  setFoto, foto, borrarServicio, fetchData
}: any) {

  const [mobileView, setMobileView] = useState<'lista' | 'formulario'>('lista');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- LÓGICA DE ORDEN REPARADA ---
  async function moverServicio(index: number, direccion: 'arriba' | 'abajo', e: React.MouseEvent) {
    e.stopPropagation();
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;

    // Evitar salir de los límites del array
    if (nuevoIndex < 0 || nuevoIndex >= servicios.length) return;

    const actual = servicios[index];
    const vecino = servicios[nuevoIndex];

    // IMPORTANTE: Usamos los IDs para asegurar un intercambio preciso
    // Si la columna 'orden' es nula o igual, forzamos el índice actual
    const ordenActual = actual.orden !== null ? actual.orden : index;
    const ordenVecino = vecino.orden !== null ? vecino.orden : nuevoIndex;

    // Ejecutamos ambas actualizaciones en paralelo para mayor velocidad
    const promisedUpdates = [
      supabase.from('servicios').update({ orden: ordenVecino }).eq('id', actual.id),
      supabase.from('servicios').update({ orden: ordenActual }).eq('id', vecino.id)
    ];

    try {
      await Promise.all(promisedUpdates);
      await fetchData(); // Refresca la lista con el nuevo orden de la BD
    } catch (error) {
      console.error("Error al mover:", error);
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* SELECTOR DE VISTA */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-full max-w-xs shadow-inner">
          <button onClick={() => setMobileView('lista')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${mobileView === 'lista' ? 'bg-white dark:bg-zinc-800 text-tekila-pink shadow-md' : 'text-zinc-400'}`}>
            <List size={14} /> Lista
          </button>
          <button onClick={() => setMobileView('formulario')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${mobileView === 'formulario' ? 'bg-white dark:bg-zinc-800 text-tekila-pink shadow-md' : 'text-zinc-400'}`}>
            <PlusCircle size={14} /> {editId ? "Editar" : "Nuevo"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* FORMULARIO */}
        <div className={`${mobileView === 'formulario' ? 'block' : 'hidden md:block'} space-y-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[32px] sticky top-8 h-fit border border-zinc-100 dark:border-zinc-800 shadow-sm`}>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-tekila-pink mb-2 flex items-center gap-2">
            <Scissors size={14} /> {editId ? "Modificar" : "Nuevo"} Servicio
          </h2>
          <div className="space-y-4">
            <input type="text" placeholder="Nombre" className="w-full p-4 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm outline-none" value={nuevoServicio.nombre} onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} />
            <input type="number" placeholder="Precio" className="w-full p-4 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm outline-none" value={nuevoServicio.precio} onChange={e => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })} />
            <textarea placeholder="Descripción" className="w-full p-4 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm h-24 outline-none resize-none" value={nuevoServicio.descripcion} onChange={e => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })} />
            <label className="flex items-center gap-2 text-[10px] uppercase font-bold cursor-pointer bg-zinc-200 dark:bg-zinc-800 p-4 rounded-2xl justify-center italic">
              <Camera size={16} /> {foto ? "Foto lista ✅" : "Subir Foto"}
              <input type="file" hidden onChange={e => setFoto(e.target.files?.[0] || null)} />
            </label>
            <PrimaryButton text={loading ? "Guardando..." : "Confirmar"} onClick={async () => { await guardarServicio(); setMobileView('lista'); }} />
            <button onClick={() => { cancelarEdicion(); setMobileView('lista'); }} className="w-full text-[10px] uppercase font-bold text-zinc-400 text-center">Cancelar</button>
          </div>
        </div>

        {/* LISTADO TIPO ACORDEÓN */}
        <div className={`${mobileView === 'lista' ? 'block' : 'hidden md:block'} space-y-2`}>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 px-2 mb-4 text-center md:text-left">Orden de los servicios</h3>

          {servicios.map((s: any, index: number) => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id}
                onClick={() => toggleExpand(s.id)}
                className={`overflow-hidden bg-white dark:bg-zinc-900 border transition-all duration-300 cursor-pointer ${isExpanded ? 'rounded-[32px] border-tekila-pink shadow-lg' : 'rounded-[22px] border-zinc-100 dark:border-zinc-800 shadow-sm'}`}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {/* Controles de orden */}
                    <div className="flex flex-col border-r border-zinc-100 dark:border-zinc-800 pr-2 mr-1">
                      <button
                        disabled={index === 0}
                        onClick={(e) => moverServicio(index, 'arriba', e)}
                        className={`p-1 transition-colors ${index === 0 ? 'text-zinc-100 dark:text-zinc-800' : 'text-zinc-300 hover:text-tekila-pink'}`}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        disabled={index === servicios.length - 1}
                        onClick={(e) => moverServicio(index, 'abajo', e)}
                        className={`p-1 transition-colors ${index === servicios.length - 1 ? 'text-zinc-100 dark:text-zinc-800' : 'text-zinc-300 hover:text-tekila-pink'}`}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-50 dark:border-zinc-800">
                      {s.foto_url ? <img src={s.foto_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300"><Camera size={14} /></div>}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate max-w-[140px]">{s.nombre}</p>
                      <p className="text-[10px] text-tekila-pink font-bold">{formatMoney(s.precio)}</p>
                    </div>
                  </div>

                  <ChevronRight size={18} className={`text-zinc-300 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-tekila-pink' : ''}`} />
                </div>

                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="p-5 pt-2 border-t border-zinc-50 dark:border-zinc-800 mt-2 bg-zinc-50/50 dark:bg-zinc-950/30">
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
                        {s.descripcion || 'Sin descripción detallada.'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); prepararEdicion(s); setMobileView('formulario'); }}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-tekila-pink transition-all shadow-sm"
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); borrarServicio(s.id); }}
                          className="px-5 flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}