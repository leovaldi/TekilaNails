'use client'
import { useState } from 'react';
import { Trash2, Camera, Edit3, AlertCircle, Scissors, PlusCircle, List } from 'lucide-react';
import { PrimaryButton } from "@/components/Button";

export default function ServiciosTab({ 
  servicios, nuevoServicio, setNuevoServicio, errores, setErrores, 
  loading, editId, guardarServicio, prepararEdicion, cancelarEdicion, 
  setFoto, foto, borrarServicio 
}: any) {

  // Estado para alternar vista en móvil
  const [mobileView, setMobileView] = useState<'lista' | 'formulario'>('lista');

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Función para manejar la edición y cambiar de vista automáticamente
  const handleEdit = (s: any) => {
    prepararEdicion(s);
    setMobileView('formulario');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* SELECTOR DE VISTA PARA MÓVIL */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl w-full max-w-xs">
          <button 
            onClick={() => setMobileView('lista')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${mobileView === 'lista' ? 'bg-white dark:bg-zinc-800 text-fuchsia-500 shadow-sm' : 'text-zinc-400'}`}
          >
            <List size={14} /> Lista ({servicios.length})
          </button>
          <button 
            onClick={() => setMobileView('formulario')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${mobileView === 'formulario' ? 'bg-white dark:bg-zinc-800 text-fuchsia-500 shadow-sm' : 'text-zinc-400'}`}
          >
            <PlusCircle size={14} /> {editId ? "Editar" : "Nuevo"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* FORMULARIO (Visible si es Desktop o si mobileView es 'formulario') */}
        <div className={`${mobileView === 'formulario' ? 'block' : 'hidden md:block'} space-y-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[32px] sticky top-8 h-fit border border-zinc-100 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300`}>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500 mb-2 flex items-center gap-2">
            <Scissors size={14}/> {editId ? "Modificar Servicio" : "Crear Nuevo Servicio"}
          </h2>
          
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-400 ml-1">Nombre</label>
            <input type="text" placeholder="Ej: Esculpidas" className={`w-full p-4 bg-white dark:bg-zinc-800 border ${errores.nombre ? 'border-red-500' : 'border-zinc-100 dark:border-zinc-700'} rounded-2xl text-sm outline-none focus:border-fuchsia-500`} value={nuevoServicio.nombre} onChange={e => {setNuevoServicio({...nuevoServicio, nombre: e.target.value}); setErrores({...errores, nombre: false})}} />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-400 ml-1">Precio</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input type="number" placeholder="0" className={`w-full p-4 pl-8 bg-white dark:bg-zinc-800 border ${errores.precio ? 'border-red-500' : 'border-zinc-100 dark:border-zinc-700'} rounded-2xl text-sm outline-none focus:border-fuchsia-500`} value={nuevoServicio.precio} onChange={e => {setNuevoServicio({...nuevoServicio, precio: e.target.value}); setErrores({...errores, precio: false})}} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-zinc-400 ml-1">Descripción</label>
            <textarea placeholder="¿Qué incluye?" className="w-full p-4 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm h-24 outline-none focus:border-fuchsia-500 resize-none" value={nuevoServicio.descripcion} onChange={e => setNuevoServicio({...nuevoServicio, descripcion: e.target.value})} />
          </div>

          <label className="flex items-center gap-2 text-[10px] uppercase font-bold cursor-pointer bg-zinc-200 dark:bg-zinc-800 p-4 rounded-2xl justify-center italic hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all">
            <Camera size={16} /> {foto ? "Imagen lista ✅" : "Subir Foto"}
            <input type="file" hidden onChange={e => setFoto(e.target.files?.[0] || null)} />
          </label>

          <PrimaryButton text={loading ? "Procesando..." : editId ? "Guardar Cambios" : "Publicar Servicio"} onClick={async () => { await guardarServicio(); if(!errores.nombre && !errores.precio) setMobileView('lista'); }} />
          
          <button onClick={() => { cancelarEdicion(); setMobileView('lista'); }} className="w-full text-[10px] uppercase font-bold text-zinc-400 pt-2 text-center">
            {editId ? "Cancelar" : "Ver Lista"}
          </button>
        </div>

        {/* LISTADO (Visible si es Desktop o si mobileView es 'lista') */}
        <div className={`${mobileView === 'lista' ? 'block' : 'hidden md:block'} space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 px-2 mb-4">Servicios Activos</h3>
          
          {servicios.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[24px] shadow-sm hover:border-fuchsia-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-50 dark:border-zinc-700">
                  {s.foto_url ? <img src={s.foto_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><Camera size={16} /></div>}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight leading-none mb-1">{s.nombre}</p>
                  <p className="text-xs text-fuchsia-500 font-bold">{formatMoney(s.precio)}</p>
                </div>
              </div>

              <div className="flex gap-1 pr-1">
                <button onClick={() => handleEdit(s)} className="p-3 text-zinc-400 hover:text-blue-500 rounded-xl transition-all"><Edit3 size={18}/></button>
                <button onClick={() => borrarServicio(s.id)} className="p-3 text-zinc-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
          
          {servicios.length === 0 && (
            <p className="text-center py-20 italic text-zinc-400 text-sm">No hay servicios creados.</p>
          )}
        </div>
      </div>
    </div>
  );
}