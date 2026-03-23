'use client'
import { ArrowUp } from 'lucide-react'

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-white dark:bg-zinc-950 pt-32 pb-12 border-t border-zinc-50 dark:border-zinc-900 transition-colors duration-500">
            <div className="max-w-5xl mx-auto px-8">

                {/* Bloque Superior: Marca y Navegación */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-24">

                    <div className="text-center md:text-left order-2 md:order-1">
                        <h3 className="text-2xl font-light italic tracking-tighter text-zinc-900 dark:text-white mb-2">
                            Tekila Nails
                        </h3>
                        <p className="text-[9px] text-zinc-400 font-light italic">
                            Atención exclusiva con cita previa
                        </p>
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="group flex flex-col items-center gap-4 order-1 md:order-2"
                    >
                        <div className="w-12 h-12 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:border-tekila-pink transition-all duration-500">
                            <ArrowUp size={16} className="text-zinc-300 group-hover:text-tekila-pink transition-colors" />
                        </div>
                        <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-400 group-hover:text-tekila-pink dark:group-hover:text-tekila-pink transition-colors">Volver</span>
                    </button>

                    <div className="text-center md:text-right order-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                            Maipú, Mendoza
                        </p>
                    </div>
                </div>

                {/* Línea Final: Copyright */}
                <div className="flex flex-col items-center pt-8 border-t border-zinc-50 dark:border-zinc-900">
                    <p className="text-[8px] text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.6em] text-center leading-loose">
                        © 2026 Tekila Nails <span className="mx-2">/</span> Rocío Mena
                    </p>
                </div>
            </div>
        </footer>
    )
}