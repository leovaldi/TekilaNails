'use client'
import { useState } from 'react';
import { X, MessageCircle, AlertTriangle, User, ClipboardList } from 'lucide-react';

export default function SupportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        errorTipo: 'Problema con el horario',
        descripcion: ''
    });

    if (!isOpen) return null;

    const handleSend = () => {
        const WHATSAPP_NUMBER = "5492615909849"; // Reemplazar con el número de Rocío

        // Estructura limpia: Rocío ya tiene el número al recibir el chat
        const message = `🚨 *REPORTE DE ERROR - TEKILA NAILS*

👤 *Cliente:* ${form.nombre} ${form.apellido}
⚠️ *Inconveniente:* ${form.errorTipo}
📝 *Detalle:* ${form.descripcion || 'Sin detalle adicional'}

---
_Mensaje generado automáticamente por el sistema de soporte_`;

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl relative">

                <button onClick={onClose} className="absolute right-6 top-6 text-zinc-400 hover:text-tekila-pink transition-colors">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-2 mb-8">
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-full">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    <h2 className="text-xl italic tracking-tighter">Asistencia Técnica</h2>
                    <p className="text-[0.625rem] text-zinc-400 uppercase tracking-widest font-bold">Reportar error en la web</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                            <input
                                placeholder="Nombre"
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[0.75rem] outline-none focus:border-tekila-pink transition-all"
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                            />
                        </div>
                        <input
                            placeholder="Apellido"
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[0.75rem] outline-none focus:border-tekila-pink transition-all"
                            onChange={e => setForm({ ...form, apellido: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[0.75rem] outline-none focus:border-tekila-pink cursor-pointer appearance-none"
                            onChange={e => setForm({ ...form, errorTipo: e.target.value })}
                        >
                            <option>Problema con el horario</option>
                            <option>Error en el pago (Mercado Pago)</option>
                            <option>La web se queda tildada</option>
                            <option>Otro motivo</option>
                        </select>
                    </div>

                    <textarea
                        placeholder="¿Qué pasó? (Ej: No me deja elegir el jueves)"
                        rows={3}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[0.75rem] outline-none focus:border-tekila-pink transition-all resize-none"
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!form.nombre || !form.apellido}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase text-[0.625rem] tracking-[0.2em] hover:bg-tekila-pink hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                        <MessageCircle size={14} />
                        Abrir WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}