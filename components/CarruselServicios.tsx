'use client'
import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Camera, Calendar } from 'lucide-react'
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
  // CONFIGURACIÓN LINEAL PARA MÁXIMA ESTABILIDAD
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, // Eliminamos el loop infinito para evitar el bug
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
            <div className="bg-zinc-100 dark:bg-zinc-900 aspect-[4/5] rounded-[40px] mb-4" />
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
                <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[45px] border border-zinc-100 dark:border-zinc-800 shadow-2xl h-full flex flex-col">

                  {/* IMAGEN */}
                  <div className="relative aspect-[1/1.15] mb-8 overflow-hidden rounded-[35px] bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800">
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
                      <h3 className="text-2xl md:text-3xl font-light italic tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                        {s.nombre}
                      </h3>
                      <div className="bg-fuchsia-500 px-3 py-1 rounded-full shrink-0 shadow-lg shadow-fuchsia-500/20">
                        <span className="text-white font-bold text-base leading-none">${s.precio.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    <p className="text-zinc-500 dark:text-zinc-400 text-[13px] font-light leading-relaxed mb-10 whitespace-pre-wrap">
                      {s.descripcion}
                    </p>

                    <div className="mt-auto">
                      <button
                        onClick={() => onSelect(s)}
                        className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[25px] text-[10px] uppercase tracking-[0.5em] font-black flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <Calendar size={16} className="text-fuchsia-500" />
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
      <div className="mt-16 flex flex-col items-center gap-10">
        {/* Indicadores de progreso */}
        <div className="flex gap-2">
          {servicios.map((_, i) => (
            <div
              key={i}
              className={`h-[2px] transition-all duration-500 rounded-full ${i === selectedIndex ? 'w-10 bg-fuchsia-500' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`}
            />
          ))}
        </div>

        {/* Botones con estado visual deshabilitado */}
        <div className="flex items-center gap-8">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`group flex items-center gap-4 transition-all ${!canScrollPrev ? 'opacity-10 cursor-not-allowed' : 'opacity-100'}`}
          >
            <div className="w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:border-fuchsia-500">
              <ChevronLeft size={18} className="text-zinc-400 group-hover:text-fuchsia-500" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.5em] text-zinc-400 font-bold">Volver</span>
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`group flex items-center gap-4 transition-all ${!canScrollNext ? 'opacity-10 cursor-not-allowed' : 'opacity-100'}`}
          >
            <span className="text-[9px] uppercase tracking-[0.5em] text-zinc-400 font-bold">Siguiente</span>
            <div className="w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:border-fuchsia-500">
              <ChevronRight size={18} className="text-zinc-400 group-hover:text-fuchsia-500" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}