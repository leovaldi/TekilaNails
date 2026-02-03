'use client'
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Camera, Edit3, X, Lock } from 'lucide-react';
import { PrimaryButton } from "@/components/Button";

export default function AdminPage() {
  // --- SEGURIDAD Y SESIÓN ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- ESTADOS DE GESTIÓN ---
  const [tab, setTab] = useState<'servicios' | 'horarios'>('servicios');
  const [servicios, setServicios] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', descripcion: '' });
  const [nuevoHorario, setNuevoHorario] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsAuthenticated(false);
      setPassword('');
    }, 15 * 60 * 1000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      fetchData();
      resetTimer();
    }
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [tab, isAuthenticated]);

  async function fetchData() {
    if (tab === 'servicios') {
      const { data } = await supabase.from('servicios').select('*').order('id', { ascending: false });
      if (data) setServicios(data);
    } else {
      const { data } = await supabase.from('horarios_disponibles').select('*').order('dia_hora', { ascending: true });
      if (data) setHorarios(data);
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const masterKey = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Tekila2026";
    if (password === masterKey) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  async function guardarServicio() {
    if (!nuevoServicio.nombre || !nuevoServicio.precio) return alert("Completar datos");
    setLoading(true);
    try {
      let foto_url = editId ? servicios.find((s:any) => s.id === editId)?.foto_url : "";
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fotos-servicios')
          .upload(fileName, foto);
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('fotos-servicios').getPublicUrl(fileName);
          foto_url = urlData.publicUrl;
        }
      }
      const payload = { ...nuevoServicio, precio: parseInt(nuevoServicio.precio), foto_url };
      if (editId) { await supabase.from('servicios').update(payload).eq('id', editId); } 
      else { await supabase.from('servicios').insert([payload]); }
      cancelarEdicion();
      fetchData();
    } finally { setLoading(false); }
  }

  const prepararEdicion = (s: any) => {
    setEditId(s.id);
    setNuevoServicio({ nombre: s.nombre, precio: s.precio.toString(), descripcion: s.descripcion || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setNuevoServicio({ nombre: '', precio: '', descripcion: '' });
    setFoto(null);
  };

  async function guardarHorario() {
    if (!nuevoHorario) return;
    if (editId) { await supabase.from('horarios_disponibles').update({ dia_hora: nuevoHorario }).eq('id', editId); } 
    else { await supabase.from('horarios_disponibles').insert([{ dia_hora: nuevoHorario }]); }
    setEditId(null);
    setNuevoHorario('');
    fetchData();
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-sm w-full space-y-8 text-center">
          <div className="space-y-2">
            <Lock className="text-fuchsia-500 mx-auto" size={32} />
            <h1 className="text-white text-3xl italic tracking-tighter">Acceso Privado</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Gestión Tekila</p>
          </div>
          <div className="space-y-4">
            <input type="password" placeholder="Contraseña Maestra" className={`w-full p-4 bg-zinc-900 border ${loginError ? 'border-red-500' : 'border-zinc-800'} text-white rounded-2xl outline-none focus:border-fuchsia-500 text-center`} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all">Entrar</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white p-6 md:p-12">
      <header className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl italic tracking-tighter">Admin Tekila</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400">Gestión de Contenido</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full text-[10px] uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">Ver Web <X className="rotate-45" size={12} /></a>
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full">
            {['servicios', 'horarios'].map((t) => (
              <button key={t} onClick={() => { setTab(t as any); cancelarEdicion(); }} className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${tab === t ? 'bg-white dark:bg-zinc-800 shadow-sm font-bold' : 'text-zinc-400'}`}>{t}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {tab === 'servicios' ? (
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl sticky top-8 h-fit">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500">{editId ? "Editando" : "Nuevo"}</h2>
              <input type="text" placeholder="Nombre" className="w-full p-3 bg-white dark:bg-zinc-800 rounded-lg text-sm outline-none" value={nuevoServicio.nombre} onChange={e => setNuevoServicio({...nuevoServicio, nombre: e.target.value})} />
              <input type="number" placeholder="Precio" className="w-full p-3 bg-white dark:bg-zinc-800 rounded-lg text-sm outline-none" value={nuevoServicio.precio} onChange={e => setNuevoServicio({...nuevoServicio, precio: e.target.value})} />
              <textarea placeholder="Descripción" className="w-full p-3 bg-white dark:bg-zinc-800 rounded-lg text-sm h-20 outline-none" value={nuevoServicio.descripcion} onChange={e => setNuevoServicio({...nuevoServicio, descripcion: e.target.value})} />
              <label className="flex items-center gap-2 text-[10px] uppercase font-bold cursor-pointer bg-zinc-200 dark:bg-zinc-800 p-3 rounded-lg justify-center italic text-black dark:text-white">
                <Camera size={14} /> {foto ? "Imagen lista" : "Subir Foto"}
                <input type="file" hidden onChange={e => setFoto(e.target.files?.[0] || null)} />
              </label>
              <PrimaryButton text={loading ? "..." : editId ? "Actualizar" : "Publicar"} onClick={guardarServicio} />
              {editId && <button onClick={cancelarEdicion} className="w-full text-[10px] uppercase text-zinc-400 pt-2 text-center">Cancelar</button>}
            </div>

            <div className="space-y-3">
              {servicios.map((s: any) => (
                <div key={s.id} className="group flex items-start justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-50">
                      {s.foto_url ? <img src={s.foto_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><Camera size={16} /></div>}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{s.nombre}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight mb-1">{s.descripcion}</p>
                      <p className="text-[11px] text-fuchsia-500 font-medium">${s.precio}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button onClick={() => prepararEdicion(s)} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white"><Edit3 size={16}/></button>
                    <button onClick={async () => { if(confirm("¿Borrar?")) { await supabase.from('servicios').delete().eq('id', s.id); fetchData(); } }} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-zinc-950 text-white p-8 rounded-3xl mb-8 border border-zinc-800">
                <h2 className="text-[10px] uppercase tracking-widest text-fuchsia-400 mb-6 font-bold">Agenda</h2>
                <div className="space-y-4">
                    <input type="datetime-local" className="w-full p-4 bg-zinc-900 rounded-xl text-sm border border-zinc-800 outline-none text-white" value={nuevoHorario} onChange={e => setNuevoHorario(e.target.value)} />
                    <PrimaryButton text={editId ? "Actualizar" : "Añadir"} onClick={guardarHorario} />
                </div>
            </div>
            <div className="space-y-2">
              {horarios.map((h: any) => (
                <div key={h.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex justify-between items-center border border-transparent">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase">{new Date(h.dia_hora).toLocaleDateString('es-AR', { weekday: 'long' })}</span>
                    <span className="text-sm font-medium">{new Date(h.dia_hora).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} hs</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditId(h.id); setNuevoHorario(h.dia_hora.slice(0, 16)); }} className="p-2 text-zinc-400 hover:text-black"><Edit3 size={14}/></button>
                    <button onClick={async () => { await supabase.from('horarios_disponibles').delete().eq('id', h.id); fetchData(); }} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}