'use client'
import { motion, Variants } from 'framer-motion'
import { ChevronDown, MapPin } from 'lucide-react'
import Image from 'next/image'

const sparkleVariants: Variants = {
    animate: {
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
};

export function Hero() {
    const scrollToNext = () => {
        document.getElementById('biography-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="min-h-[100svh] flex flex-col bg-background relative overflow-hidden transition-colors duration-500">
            {/* Fondo sutil de la paleta */}
            <div className="absolute inset-0 bg-gradient-to-b from-tekila-light/10 to-transparent dark:from-zinc-900/50 -z-10" />

            {/* --- TOP: Bienvenida --- */}
            <div className="pt-16 text-center">
                <span className="text-[0.625rem] md:text-[0.6875rem] font-serif italic text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.6em]">
                    Tu próximo set favorito empieza acá
                </span>
            </div>

            {/* --- MIDDLE: Logo --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="flex-grow flex flex-col items-center justify-center px-6"
            >
                <div className="relative w-full max-w-[clamp(15rem,80vw,20rem)] h-[clamp(9rem,45vw,11.875rem)] md:max-w-[43.75rem] md:h-[21.875rem]">

                    <Image
                        src="/logoB.png"
                        alt="Tekila Nails Logo"
                        fill
                        priority
                        className="object-contain dark:block hidden"
                    />
                    <Image
                        src="/logoN.png"
                        alt="Tekila Nails Logo"
                        fill
                        priority
                        className="object-contain dark:hidden block"
                    />
                </div>
            </motion.div>

            {/* --- BOTTOM: Ubicación y Acción --- */}
            <div className="w-full max-w-7xl mx-auto px-10 pb-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">

                {/* Ubicación (Lado izquierdo) */}
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2 text-tekila-gray">
                        <MapPin size={14} className="text-tekila-pink" />
                        <span className="text-[0.6875rem] uppercase tracking-[0.3em] font-serif italic text-foreground/80">
                            Maipú, Mendoza
                        </span>
                    </div>
                    <div className="h-[2px] w-16 bg-tekila-pink rounded-full opacity-40"></div>
                </div>

                {/* Deslizar (Centro) */}
                <motion.div
                    onClick={scrollToNext}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="hidden md:flex flex-col items-center gap-1 cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                >
                    <span className="text-[0.5rem] uppercase tracking-[0.4em] text-foreground/60">Deslizar</span>
                    <ChevronDown size={14} />
                </motion.div>

                {/* Botón (Lado derecho) */}
                <div className="relative group p-[1px] rounded-full overflow-hidden" onClick={scrollToNext}>
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#FF0080_360deg)] animate-[spin_4s_linear_infinite]" />
                    <button className="relative px-10 py-3 bg-background rounded-full text-[0.625rem] uppercase tracking-[0.4em] font-bold text-foreground group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 transition-colors">
                        Explorar
                    </button>
                </div>
            </div>
        </section>
    )
}