'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Instagram,
  MapPin,
  Clock,
  CreditCard,
  Camera
} from 'lucide-react'

// IMPORTACIONES
import { supabase } from '@/lib/supabase' 
import { OPCIONES_RETIRO } from '../lib/servicios'
import { PrimaryButton } from '@/components/Button'
import { BookingFlow } from '@/components/BookingFlow' // Importamos el nuevo flujo

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────
interface Servicio {
  id: string
  nombre: string
  precio: number
  descripcion: string
  foto_url: string
}

export default function Home() {
  // ESTADOS
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [selectedService, setSelectedService] = useState<Servicio | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [retiroSeleccionado, setRetiroSeleccionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. CARGA DE SERVICIOS DESDE DB
  useEffect(() => {
    async function getServicios() {
      const { data } = await supabase
        .from('servicios')
        .select('*')
        .order('id', { ascending: false })
      
      if (data) setServicios(data)
      setLoading(false)
    }
    getServicios()
  }, [])

  const { totalServicio, senaNeta, totalAPagarAhora } = useMemo(() => {
    if (!selectedService) {
      return { totalServicio: 0, senaNeta: 0, totalAPagarAhora: 0 }
    }

    const precioRetiro = retiroSeleccionado
      ? OPCIONES_RETIRO.find(r => r.id === retiroSeleccionado)?.precio || 0
      : 0

    const total = selectedService.precio + precioRetiro
    const sena = total / 2
    const final = Math.ceil(sena / (1 - 0.0773))

    return {
      totalServicio: total,
      senaNeta: sena,
      totalAPagarAhora: final,
    }
  }, [selectedService, retiroSeleccionado])

  return (
    <main className="bg-white dark:bg-zinc-950 min-h-screen w-full overflow-x-hidden text-black dark:text-zinc-100 selection:bg-fuchsia-100">

      {/* ─────────────── SECCIÓN 1: HERO ─────────────── */}
      <section className="h-[100svh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
          <span className="text-[9px] uppercase tracking-[0.6em] text-zinc-400 dark:text-zinc-500 block mb-6">Mendoza — 2026</span>
          <h1 className="text-6xl md:text-9xl font-light tracking-tighter mb-4 italic leading-none">Tekila Nails</h1>
          <p className="text-sm font-light tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase mt-4">Estética de Autor</p>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-20">
            <div className="w-[1px] h-12 bg-zinc-200 dark:bg-zinc-700 mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────── SECCIÓN 2: CARRUSEL ─────────────── */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-4 px-4">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 mb-2 font-bold italic">Selección Editorial</h2>
              <p className="text-3xl italic tracking-tighter font-light">Elegí tu próximo estilo</p>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700 self-center" />
              <span className="text-[9px] uppercase tracking-[0.3em] italic text-zinc-400 dark:text-zinc-500">Deslizá para explorar</span>
            </div>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 px-4 no-scrollbar pb-10">
            {loading ? (
              <div className="w-full text-center py-20 text-[10px] uppercase tracking-[0.3em] text-zinc-400 italic">Consultando Catálogo...</div>
            ) : (
              servicios.map(s => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="snap-center shrink-0 w-[82vw] md:w-[360px] bg-white dark:bg-zinc-950 p-4 shadow-sm border border-zinc-100 dark:border-zinc-800 group"
                >
                  <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {s.foto_url ? (
                      <Image
                        src={s.foto_url}
                        alt={s.nombre}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><Camera size={32} /></div>
                    )}
                  </div>

                  <div className="px-2">
                    <div className="flex justify-between items-baseline mb-3">
                      <h3 className="text-xl font-medium tracking-tight italic">{s.nombre}</h3>
                      <span className="text-sm font-light text-zinc-400 dark:text-zinc-500">${s.precio.toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] italic mb-8 h-10 line-clamp-2 leading-relaxed">{s.descripcion}</p>
                    <PrimaryButton
                      text="Seleccionar"
                      onClick={() => {
                        setSelectedService(s)
                        setShowModal(true)
                      }}
                    />
                  </div>
                </motion.div>
              ))
            )}
            <div className="shrink-0 w-4 md:w-20" />
          </div>
        </div>
      </section>

      {/* ─────────────── SECCIÓN 3: METODOLOGÍA ─────────────── */}
      <section className="py-32 px-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-light italic mb-16 tracking-tighter text-center underline underline-offset-8 decoration-zinc-100 dark:decoration-zinc-800">Metodología de trabajo</h2>
        <div className="grid grid-cols-1 gap-16 mb-24">
          {[
            { icon: CreditCard, title: 'Política de Señas', text: 'Para confirmar tu cita solicitamos una seña del 50%. Recordá que el sistema suma un pequeño costo por gastos de gestión de Mercado Pago.' },
            { icon: MapPin, title: 'Tu Turno', text: 'Atiendo en Maipú. La ubicación exacta se envía automáticamente vía WhatsApp una vez que la seña esté confirmada.' },
            { icon: Clock, title: 'Diseños', text: 'El valor del turno es por el servicio base. Cristales, dibujos o diseños complejos se cotizan en el salón según tu idea.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-8 group">
              <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 group-hover:bg-fuchsia-50 transition-colors">
                <Icon className="text-zinc-400 group-hover:text-fuchsia-500" size={20} />
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-3">{title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed italic">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="https://instagram.com/tekila.nails" target="_blank" className="group inline-flex flex-col items-center gap-4">
            <div className="w-16 h-16 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center group-hover:border-fuchsia-500 transition-all">
              <Instagram size={24} className="group-hover:text-fuchsia-500 transition-colors" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">@tekila.nails</span>
          </a>
        </div>
      </section>

      {/* ─────────────── MODAL CON RESERVA DINÁMICA ─────────────── */}
      <AnimatePresence>
        {showModal && selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-zinc-950 w-full max-w-lg p-10 relative overflow-y-auto max-h-[90vh] no-scrollbar">
              <button 
                onClick={() => { setShowModal(false); setRetiroSeleccionado(null); }} 
                className="absolute top-6 right-6 text-zinc-300 hover:text-black dark:hover:text-white z-10"
              >
                ✕
              </button>
              
              <div className="mb-10">
                <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 mb-2 block">Resumen de selección</span>
                <h2 className="text-3xl italic font-light tracking-tighter">{selectedService.nombre}</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-4 block text-zinc-400 dark:text-zinc-500">¿Retiro previo?</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setRetiroSeleccionado(null)} className={`p-4 text-[10px] uppercase tracking-widest border transition-all ${!retiroSeleccionado ? 'border-black bg-black text-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}>Uñas al natural</button>
                    {OPCIONES_RETIRO.map(r => (
                      <button key={r.id} onClick={() => setRetiroSeleccionado(r.id)} className={`p-4 text-[10px] uppercase tracking-widest border transition-all ${retiroSeleccionado === r.id ? 'border-black bg-black text-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}>{r.nombre} (+${r.precio})</button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-6 space-y-3">
                  <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    <span>Subtotal servicio</span>
                    <span>${totalServicio.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    <span className="font-bold uppercase text-[10px] tracking-widest">Seña + Gestión online:</span>
                    <span className="text-4xl font-light text-[#FF00FF]">${totalAPagarAhora.toLocaleString()}</span>
                  </div>
                </div>

                {/* COMPONENTE DE FLUJO DE RESERVA INTEGRADO */}
               <BookingFlow 
                  servicio={selectedService} 
                  totalAPagarAhora={totalAPagarAhora}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-20 text-center text-[9px] text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.6em] border-t border-zinc-50 dark:border-zinc-800">Maipú, Mendoza — Tekila Nails By Rocio Mena 2026</footer>
    </main>
  )
}