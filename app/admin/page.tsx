'use client'
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, X, ExternalLink, UserCircle } from 'lucide-react';
import Link from 'next/link';
import ReservasTab from './components/ReservasTab';
import ServiciosTab from './components/ServiciosTab';
import HorariosTab from './components/HorariosTab';
import { AdminAvatarUpload } from './components/AdminAvatarUpload';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  // Agregamos 'perfil' a las opciones de tab
  const [tab, setTab] = useState<'reservas' | 'servicios' | 'horarios' | 'perfil'>('reservas');
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados compartidos
  const [servicios, setServicios] = useState<any[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', descripcion: '' });
  const [nuevoHorario, setNuevoHorario] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [errores, setErrores] = useState({ nombre: false, precio: false });

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { setIsAuthenticated(false); setPassword(''); }, 15 * 60 * 1000);
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
    setLoading(true);
    if (tab === 'servicios') {
      const { data } = await supabase.from('servicios').select('*').order('id', { ascending: false });
      if (data) setServicios(data);
    } else if (tab === 'horarios') {
      const { data } = await supabase.from('horarios_disponibles').select('*').order('dia_hora', { ascending: true });
      if (data) setHorarios(data);
    } else if (tab === 'reservas') {
      const { data } = await supabase.from('reservas').select('*, servicios(*), horarios_disponibles(*)').eq('estado_pago', 'aprobado').order('created_at', { ascending: false });
      if (data) setReservas(data);
    }
    // 'perfil' no requiere fetch inicial ya que el componente maneja su propia carga
    setLoading(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Tekila2026")) {
      setIsAuthenticated(true); setLoginError(false);
    } else { setLoginError(true); }
  };

  async function guardarServicio() {
    const errN = !nuevoServicio.nombre.trim();
    const errP = !nuevoServicio.precio.trim();
    setErrores({ nombre: errN, precio: errP });
    if (errN || errP) return;

    setLoading(true);
    let foto_url = editId ? servicios.find((s: any) => s.id === editId)?.foto_url : "";
    if (foto) {
      const fileName = `${Math.random()}.${foto.name.split('.').pop()}`;
      const { data: uploadData } = await supabase.storage.from('fotos-servicios').upload(fileName, foto);
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('fotos-servicios').getPublicUrl(fileName);
        foto_url = urlData.publicUrl;
      }
    }
    const payload = { ...nuevoServicio, precio: parseInt(nuevoServicio.precio), foto_url };
    if (editId) await supabase.from('servicios').update(payload).eq('id', editId);
    else await supabase.from('servicios').insert([payload]);
    cancelarEdicion(); fetchData();
  }

  async function guardarHorario() {
    if (!nuevoHorario) return;
    const fechaISO = new Date(nuevoHorario).toISOString();
    if (editId) await supabase.from('horarios_disponibles').update({ dia_hora: fechaISO }).eq('id', editId);
    else await supabase.from('horarios_disponibles').insert([{ dia_hora: fechaISO, estado: 'disponible' }]);
    setEditId(null); setNuevoHorario(''); fetchData();
  }

  const prepararEdicion = (s: any) => {
    setEditId(s.id);
    setNuevoServicio({ nombre: s.nombre, precio: s.precio.toString(), descripcion: s.descripcion || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditId(null); setNuevoServicio({ nombre: '', precio: '', descripcion: '' }); setFoto(null); setErrores({ nombre: false, precio: false });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <form onSubmit={handleLogin} className="max-w-sm w-full space-y-8">
          <Lock className="text-tekila-pink mx-auto" size={32} />
          <h1 className="text-white text-3xl italic tracking-tighter">Acceso Privado</h1>
          <input type="password" placeholder="Contraseña Maestra" className={`w-full p-4 bg-zinc-900 border ${loginError ? 'border-red-500' : 'border-zinc-800'} text-white rounded-2xl outline-none text-center`} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-4 bg-white text-black rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:bg-tekila-pink hover:text-white transition-all">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white p-6 md:p-12">
      <header className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl italic tracking-tighter">Admin Tekila</h1>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full text-[9px] uppercase tracking-tighter hover:bg-tekila-pink hover:text-white transition-all group"
          >
            Ver Web
            <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full">
          {['reservas', 'servicios', 'horarios', 'perfil'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t as any); cancelarEdicion(); }}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${tab === t ? 'bg-white dark:bg-zinc-800 shadow-sm font-bold text-tekila-pink' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {tab === 'reservas' && <ReservasTab reservas={reservas} fetchData={fetchData} />}

        {tab === 'servicios' && (
          <ServiciosTab
            {...{ servicios, nuevoServicio, setNuevoServicio, errores, setErrores, loading, editId, guardarServicio, prepararEdicion, cancelarEdicion, setFoto, foto }}
            borrarServicio={async (id: any) => { if (confirm("¿Borrar?")) { await supabase.from('servicios').delete().eq('id', id); fetchData(); } }}
          />
        )}

        {tab === 'horarios' && (
          <HorariosTab
            {...{ horarios, nuevoHorario, setNuevoHorario, guardarHorario, editId, setEditId }}
            fetchData={fetchData}
            borrarHorario={async (id: any) => { if (confirm("¿Borrar?")) { await supabase.from('horarios_disponibles').delete().eq('id', id); fetchData(); } }}
          />
        )}

        {tab === 'perfil' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center gap-2 mb-8">
              <UserCircle className="text-tekila-pink opacity-20" size={48} />
              <h2 className="text-2xl italic tracking-tighter">Configuración de Perfil</h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em]">Actualizá tu foto de presentación</p>
            </div>

            <AdminAvatarUpload />

            <div className="mt-12 p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px] text-center">
              <p className="text-[11px] text-zinc-400 leading-relaxed uppercase tracking-widest max-w-xs mx-auto">
                La foto se actualizará automáticamente en la sección "Biografía" de la página principal.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}