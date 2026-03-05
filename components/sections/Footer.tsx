'use client'
import { ArrowUp } from 'lucide-react'

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-white dark:bg-zinc-950 pt-24 pb-12 border-t border-zinc-50 dark:border-zinc-900 transition-colors duration-500">
            <div className="max-w-5xl mx-auto px-8">

                <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-light italic tracking-tighter mb-2">Tekila Nails</h3>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400">Estética de Autor</p>
                    </div>

                    <button onClick={scrollToTop} className="group flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:border-fuchsia-500 transition-all">
                            <ArrowUp size={14} className="text-zinc-300 group-hover:text-fuchsia-500" />
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-400">Inicio</span>
                    </button>

                    <div className="text-center md:text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Maipú, Mendoza</p>
                        <p className="text-[9px] text-zinc-400 font-light italic">Atención únicamente con cita previa</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-50 dark:border-zinc-900 gap-4">
                    <p className="text-[8px] text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.5em]">
                        © 2026 Tekila Nails by Rocío Mena
                    </p>
                    <p className="text-[8px] text-zinc-300 dark:text-zinc-500 uppercase tracking-[0.5em]">
                        Mendoza, Argentina
                    </p>
                </div>
            </div>
        </footer>
    )
}