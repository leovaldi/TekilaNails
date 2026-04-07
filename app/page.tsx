'use client'

import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// IMPORTACIONES DE SECCIONES
import { Hero } from '@/components/sections/Hero'
import { Biography } from '@/components/sections/Biography' // Nueva sección
import { Methodology } from '@/components/sections/Methodology'
import { Footer } from '@/components/sections/Footer'

// IMPORTACIONES DE LÓGICA Y UI
import { supabase } from '@/lib/supabase'
import { OPCIONES_RETIRO } from '../lib/servicios'
import { BookingFlow } from '@/components/BookingFlow'
import { CarruselServicios } from '@/components/CarruselServicios'

interface Servicio {
  id: string
  nombre: string
  precio: number
  descripcion: string
  foto_url: string
}

export default function Home() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [selectedService, setSelectedService] = useState<Servicio | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [retiroSeleccionado, setRetiroSeleccionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carga de datos
  useEffect(() => {
    async function getServicios() {
      const { data } = await supabase
        .from('servicios')
        .select('*')
        .order('orden', { ascending: true, nullsFirst: false })

      if (data) setServicios(data)
      setLoading(false)
    }
    getServicios()
  }, [])

  // Lógica de Precios
  const { totalServicio, totalAPagarAhora } = useMemo(() => {
    if (!selectedService) return { totalServicio: 0, totalAPagarAhora: 0 }

    const precioRetiro = retiroSeleccionado
      ? OPCIONES_RETIRO.find(r => r.id === retiroSeleccionado)?.precio || 0
      : 0

    const total = selectedService.precio + precioRetiro
    const sena = total / 2
    const final = Math.ceil(sena / (1 - 0.0773)) // Comisión Mercado Pago

    return { totalServicio: total, totalAPagarAhora: final }
  }, [selectedService, retiroSeleccionado])

  return (
    <main className="bg-background min-h-screen w-full overflow-x-hidden text-foreground selection:bg-tekila-light/30 selection:text-tekila-pink transition-colors duration-500">

      {/* 1. PRESENTACIÓN DE MARCA */}
      <Hero />

      {/* 2. BIOGRAFÍA (Liberamos el Hero de carga visual) */}
      <Biography />

      {/* 3. CATÁLOGO DE SERVICIOS */}
      <section id="servicios-section" className="py-24 md:py-32 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <h2 className="text-[0.625rem] uppercase tracking-[0.5em] text-tekila-pink font-bold italic">
              Selecciona tu Servicio
            </h2>
            <p className="text-[clamp(1.5rem,6vw,3rem)] italic tracking-tighter font-light">
              Elegí tu próximo estilo
            </p>
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

      {/* 4. POLÍTICAS Y REDES */}
      <Methodology />

      {/* MODAL DE RESERVA (Refinado para la paleta) */}
      <AnimatePresence>
        {showModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-tekila-dark/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background w-full max-w-lg p-6 md:p-10 relative overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800"
            >
              <button
                onClick={() => { setShowModal(false); setRetiroSeleccionado(null); }}
                className="absolute top-6 right-6 md:top-8 md:right-8 text-zinc-400 hover:text-tekila-pink transition-colors"
              >
                ✕
              </button>

              <div className="mb-10">
                <span className="text-[0.5625rem] uppercase tracking-[0.4em] text-tekila-pink mb-2 block">
                  Confirmar cita
                </span>
                <h2 className="text-[clamp(1.5rem,5vw,2rem)] italic font-light tracking-tighter">{selectedService.nombre}</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[0.625rem] uppercase tracking-widest font-bold mb-4 block text-zinc-400">
                    ¿Tenés esmalte previo?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setRetiroSeleccionado(null)}
                      className={`p-4 text-[0.625rem] uppercase tracking-widest border transition-all rounded-xl ${!retiroSeleccionado ? 'border-tekila-pink bg-tekila-pink text-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}
                    >
                      Uñas al natural
                    </button>
                    {OPCIONES_RETIRO.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setRetiroSeleccionado(r.id)}
                        className={`p-4 text-[0.625rem] uppercase tracking-widest border transition-all rounded-xl ${retiroSeleccionado === r.id ? 'border-tekila-pink bg-tekila-pink text-white' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}
                      >
                        {r.nombre} (+${r.precio})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 space-y-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between text-[0.625rem] text-zinc-400 uppercase tracking-widest">
                    <span>Subtotal servicio</span>
                    <span>${totalServicio.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold uppercase text-[0.625rem] tracking-widest">Seña + Gestión:</span>
                    <span className="text-[clamp(1.875rem,5vw,2.25rem)] font-light text-tekila-pink">${totalAPagarAhora.toLocaleString()}</span>
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

      <Footer />
    </main>
  )
}