'use client'
import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronRight, Camera } from 'lucide-react'
import Image from 'next/image'
import { PrimaryButton } from './Button'

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  if (loading) {
    return (
      <div className="w-full text-center py-20 text-[10px] uppercase tracking-[0.3em] text-zinc-400 italic">
        Consultando Catálogo...
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* Contenedor Embla */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing px-4" ref={emblaRef}>
        <div className="flex">
          {servicios.map((s) => (
            <div 
              key={s.id} 
              className="flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-[0_0_40%] min-w-0 px-4"
            >
              <motion.div 
                initial={{ opacity: 0.5, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-950 p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  {s.foto_url ? (
                    <Image
                      src={s.foto_url}
                      alt={s.nombre}
                      fill
                      className="object-cover transition-transform duration-1000 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <Camera size={32} />
                    </div>
                  )}
                  {/* Overlay Gradiente Fijo (Para que el texto siempre sea legible en móvil) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                </div>

                <div className="px-2">
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="text-xl font-medium tracking-tight italic">{s.nombre}</h3>
                    <span className="text-sm font-light text-zinc-400 dark:text-zinc-500">${s.precio.toLocaleString()}</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] italic mb-8 h-10 line-clamp-2 leading-relaxed">
                    {s.descripcion}
                  </p>
                  <PrimaryButton
                    text="Seleccionar"
                    onClick={() => onSelect(s)}
                  />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de Deslizar Intuitivo */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <button 
          onClick={scrollNext}
          className="group flex items-center gap-3 text-zinc-400 hover:text-black dark:hover:text-white transition-all"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] font-bold italic">Deslizar para explorar</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronRight size={14} className="text-fuchsia-500" />
          </motion.div>
        </button>
        
        {/* Barra de progreso visual sutil */}
        <div className="w-24 h-[1px] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
            <motion.div 
                className="absolute inset-0 bg-fuchsia-500"
                animate={{ x: [-100, 100] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />
        </div>
      </div>
    </div>
  )
}