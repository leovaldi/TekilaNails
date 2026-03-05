'use client'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function Hero() {
    const scrollToServices = () => {
        // Buscamos el elemento por ID
        const element = document.getElementById('servicios-section');
        if (element) {
            // Calculamos la posición para que no quede pegado al borde superior
            const yOffset = -20;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
            console.warn("No se encontró la sección: servicios-section");
        }
    };

    return (
        <section className="h-[100svh] flex flex-col items-center justify-center px-6 text-center relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center"
            >
                <span className="text-[10px] uppercase tracking-[0.6em] text-zinc-400 dark:text-zinc-500 block mb-6 font-medium">
                    Rocio Mena
                </span>

                <h1 className="text-7xl md:text-9xl font-light tracking-tighter mb-4 italic leading-[0.9]">
                    Tekila Nails
                </h1>

                <p className="text-sm font-light tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase mb-12">
                    Estética de Autor
                </p>

                {/* BOTÓN CON BORDE ANIMADO FUCSIA */}
                <div className="relative group p-[1px] inline-flex items-center justify-center overflow-hidden rounded-full cursor-pointer" onClick={scrollToServices}>
                    {/* El borde animado */}
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#d946ef_360deg)] animate-[spin_3s_linear_infinite]" />

                    <button
                        className="relative px-8 py-4 bg-white dark:bg-zinc-950 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900"
                    >
                        Explorar Servicios
                    </button>
                </div>

                {/* INDICADOR INFERIOR */}
                <motion.div
                    onClick={scrollToServices}
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group z-20"
                >
                    <span className="text-[8px] uppercase tracking-[0.4em] text-zinc-400 group-hover:text-fuchsia-500 transition-colors">Deslizar</span>
                    <ChevronDown size={14} className="text-zinc-300 group-hover:text-fuchsia-500 transition-colors" />
                </motion.div>
            </motion.div>
        </section>
    )
}