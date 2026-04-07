'use client'
import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Camera, Calendar, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Servicio {
  id: string
  nombre: string
  precio: number
  descripcion: string
  foto_url: string
}

export function CarruselServicios({
  servicios,
  loading,
  onSelect
}: {
  servicios: Servicio[],
  loading: boolean,
  onSelect: (s: Servicio) => void
}) {
  // CONFIGURACIÓN PARA MÁXIMA ESTABILIDAD
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
    dragFree: false
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelectScroll = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelectScroll()
    emblaApi.on('select', onSelectScroll)
    emblaApi.on('reInit', onSelectScroll)
  }, [emblaApi, onSelectScroll])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  if (loading) {
    return (
      <div className="flex gap-6 overflow-hidden px-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-[0_0_80%] md:flex-[0_0_35%] animate-pulse">
            <div className="bg-zinc-100 dark:bg-zinc-900 aspect-[4/5] rounded-[2.5rem] mb-4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full py-4">
      <div className="overflow-hidden cursor-grab active:cursor-grabbing px-4" ref={emblaRef}>
        <div className="flex">
          {servicios.map((s, index) => {
            const isSelected = index === selectedIndex

            return (
              <div
                key={s.id}
                className={`flex-[0_0_85%] sm:flex-[0_0_55%] md:flex-[0_0_35%] min-w-0 px-3 transition-all duration-700
                  ${isSelected ? 'opacity-100 scale-100' : 'opacity-20 scale-95 blur-[1px]'}`}
              >
                {/* CARD REFINADA */}
                <div className="bg-white dark:bg-zinc-950 p-5 sm:p-6 md:p-8 rounded-[2.8125rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl h-full flex flex-col">

                  {/* IMAGEN */}
                  <div className="relative aspect-[1/1.15] mb-8 overflow-hidden rounded-[2.1875rem] bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800">
                    {s.foto_url ? (
                      <Image
                        src={s.foto_url}
                        alt={s.nombre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 85vw, 35vw"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-200">
                        <Camera size={40} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow px-1">
                    {/* TÍTULO Y PRECIO */}
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <h3 className="text-[clamp(1.25rem,4vw,1.875rem)] font-light italic tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                        {s.nombre}
                      </h3>
                      <div className="bg-tekila-pink px-3 py-1 rounded-full shrink-0 shadow-lg shadow-tekila-pink/20">
                        <span className="text-white font-bold text-base leading-none">${s.precio.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    <p className="text-zinc-500 dark:text-zinc-400 text-[0.8125rem] font-light leading-relaxed mb-10 whitespace-pre-wrap">
                      {s.descripcion}
                    </p>

                    <div className="mt-auto">
                      <button
                        onClick={() => isSelected && onSelect(s)}
                        className={`w-full py-5 rounded-[1.5625rem] text-[0.625rem] uppercase tracking-[0.5em] font-black flex items-center justify-center gap-3 transition-all ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black active:scale-95 hover:text-tekila-pink dark:hover:text-tekila-pink cursor-pointer' : 'bg-transparent text-transparent cursor-default select-none'}`}
                      >
                        <Calendar size={16} className={`${isSelected ? 'text-tekila-pink' : 'text-transparent'}`} />
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CONTROLES DE NAVEGACIÓN */}
      <div className="mt-16 flex flex-col items-center gap-10 pb-28 relative">
        {/* Indicadores de progreso */}
        <div className="flex gap-2">
          {servicios.map((_, i) => (
            <div
              key={i}
              className={`h-[2px] transition-all duration-500 rounded-full ${i === selectedIndex ? 'w-10 bg-tekila-pink' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* Botones con relleno y borde (Intuitivos) */}
        <div className="flex items-center gap-8">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`group flex items-center gap-4 transition-all px-6 py-3 rounded-full border-2 
              ${!canScrollPrev
                ? 'opacity-20 cursor-not-allowed border-zinc-200 dark:border-zinc-800'
                : 'opacity-100 border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black active:scale-95 shadow-lg'}`}
          >
            <ChevronLeft size={18} />
            <span className="text-[0.5625rem] uppercase tracking-[0.5em] font-bold">Volver</span>
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`group flex items-center gap-4 transition-all px-6 py-3 rounded-full border-2
              ${!canScrollNext
                ? 'opacity-20 cursor-not-allowed border-zinc-200 dark:border-zinc-800'
                : 'opacity-100 border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black active:scale-95 shadow-lg'}`}
          >
            <span className="text-[0.5625rem] uppercase tracking-[0.5em] font-bold">Siguiente</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* INDICADOR INFERIOR (Igual al Hero) */}
        <motion.div
          onClick={() => document.getElementById('methodology-section')?.scrollIntoView({ behavior: 'smooth' })}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer group z-20"
        >
          <span className="text-[0.5rem] uppercase tracking-[0.5em] text-zinc-400 group-hover:text-tekila-pink font-serif italic">
            Deslizar
          </span>
          <ChevronDown size={14} className="text-zinc-300 group-hover:text-tekila-pink" />
        </motion.div>
      </div>
    </div>
  )
}