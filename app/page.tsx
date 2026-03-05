'use client'

import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// IMPORTACIONES DE SECCIONES (Nuevos componentes)
import { Hero } from '@/components/sections/Hero'
import { Methodology } from '@/components/sections/Methodology'
import { Footer } from '@/components/sections/Footer'

// IMPORTACIONES DE LÓGICA Y UI
import { supabase } from '@/lib/supabase'
import { OPCIONES_RETIRO } from '../lib/servicios'
import { BookingFlow } from '@/components/BookingFlow'
import { CarruselServicios } from '@/components/CarruselServicios'

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
  // 1. ESTADOS DE LA APLICACIÓN
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [selectedService, setSelectedService] = useState<Servicio | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [retiroSeleccionado, setRetiroSeleccionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 2. CARGA DE SERVICIOS DESDE SUPABASE
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

  // 3. LÓGICA DE CÁLCULO DE SEÑA (Centralizada)
  const { totalServicio, totalAPagarAhora } = useMemo(() => {
    if (!selectedService) {
      return { totalServicio: 0, totalAPagarAhora: 0 }
    }

    const precioRetiro = retiroSeleccionado
      ? OPCIONES_RETIRO.find(r => r.id === retiroSeleccionado)?.precio || 0
      : 0

    const total = selectedService.precio + precioRetiro
    const sena = total / 2
    const final = Math.ceil(sena / (1 - 0.0773))

    return {
      totalServicio: total,
      totalAPagarAhora: final,
    }
  }, [selectedService, retiroSeleccionado])

  return (
    <main className="bg-white dark:bg-zinc-950 min-h-screen w-full overflow-x-hidden text-black dark:text-zinc-100 selection:bg-fuchsia-100">

      {/* SECCIÓN 1: HERO (Extraído) */}
      <Hero />

      {/* SECCIÓN 2: CARRUSEL (Mantenemos aquí por la carga de datos) */}
      <section id="servicios-section" className="py-24 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-4 px-4">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 mb-2 font-bold italic">Selección Editorial</h2>
              <p className="text-4xl italic tracking-tighter font-light">Elegí tu próximo estilo</p>
            </div>
          </div>

          <CarruselServicios
            servicios={servicios}
            loading={loading}
            onSelect={(s) => {
              setSelectedService(s)
              setShowModal(true)
            }}
          />
        </div>
      </section>

      {/* SECCIÓN 3: METODOLOGÍA (Extraído) */}
      <Methodology />

      {/* MODAL DE RESERVA (Lo mantenemos aquí para manejar los estados de retiro) */}
      <AnimatePresence>
        {showModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-zinc-950 w-full max-w-lg p-10 relative overflow-y-auto max-h-[90vh] no-scrollbar"
            >
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
                    <button
                      onClick={() => setRetiroSeleccionado(null)}
                      className={`p-4 text-[10px] uppercase tracking-widest border transition-all ${!retiroSeleccionado ? 'border-black bg-black text-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}
                    >
                      Uñas al natural
                    </button>
                    {OPCIONES_RETIRO.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setRetiroSeleccionado(r.id)}
                        className={`p-4 text-[10px] uppercase tracking-widest border transition-all ${retiroSeleccionado === r.id ? 'border-black bg-black text-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}
                      >
                        {r.nombre} (+${r.precio})
                      </button>
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
                    <span className="text-4xl font-light text-fuchsia-500">${totalAPagarAhora.toLocaleString()}</span>
                  </div>
                </div>

                <BookingFlow
                  servicio={selectedService}
                  totalAPagarAhora={totalAPagarAhora}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECCIÓN 4: FOOTER (Extraído) */}
      <Footer />

    </main>
  )
}