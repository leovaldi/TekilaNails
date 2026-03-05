'use client'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, Clock, Instagram, ShieldCheck, UserMinus, AlertCircle } from 'lucide-react'

const PAUTAS = [
    {
        icon: CreditCard,
        title: 'Reserva & Seña',
        text: 'Cita confirmada mediante seña del 50%. El sistema suma un pequeño costo por gestión de Mercado Pago.'
    },
    {
        icon: Clock,
        title: 'Tolerancia',
        text: 'Cuidamos tu tiempo y el de todas. La tolerancia máxima de espera es de 15 minutos, sin excepción.'
    },
    {
        icon: ShieldCheck,
        title: 'Higiene & Salud',
        text: 'Por seguridad, no trabajamos sobre uñas con hongos o lesiones. La salud de tus manos es prioridad.'
    },
    {
        icon: MapPin,
        title: 'Ubicación',
        text: 'Atención en Maipú. La dirección exacta se envía por WhatsApp automáticamente al confirmar la seña.'
    },
    {
        icon: UserMinus,
        title: 'Acompañantes',
        text: 'El salón es un espacio de relax exclusivo para la clienta. Por favor, asistí sin acompañantes.'
    },
    {
        icon: AlertCircle,
        title: 'Diseños',
        text: 'El valor es por el servicio base. Cristalería o diseños complejos se cotizan en el salón según tu idea.'
    },
]

export function Methodology() {
    return (
        <section className="py-32 px-8 max-w-5xl mx-auto border-t border-zinc-50 dark:border-zinc-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">
                        Compromiso Tekila
                    </h2>

                    {/* LÍNEA CON PARPADEO LENTO */}
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-[1px] bg-fuchsia-500 mx-auto mb-4"
                    />

                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-medium">Leé con atención antes de reservar</p>
                </div>

                {/* PAUTAS CON ANIMACIÓN EN CASCADA PARA MÓVILES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mb-32">
                    {PAUTAS.map(({ icon: Icon, title, text }, index) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex gap-6 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-all duration-500 border border-zinc-100 dark:border-zinc-800 group-hover:border-fuchsia-200">
                                <Icon className="text-zinc-400 group-hover:text-fuchsia-500 transition-colors" size={18} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">{title}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                                    {text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ──────── CUADRO DE INSTAGRAM ──────── */}
                <div className="relative group p-[1px] rounded-[40px] overflow-hidden">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,#4f46e5_220deg,#9333ea_260deg,#db2777_300deg,#f97316_340deg,#eab308_360deg)] animate-[spin_8s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative flex flex-col items-center gap-10 bg-white dark:bg-zinc-950 backdrop-blur-sm p-16 rounded-[39px] overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-500/10 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-fuchsia-500/5 blur-[120px] rounded-full" />

                        <div className="text-center relative z-10 space-y-3">
                            <h3 className="text-3xl md:text-4xl font-light tracking-tight">¿Buscás inspiración?</h3>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-medium max-w-sm mx-auto">Cada diseño es una pieza única. Explorá nuestro portfolio completo.</p>
                        </div>

                        <motion.a
                            href="https://instagram.com/tekila.nails"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex items-center gap-3 px-12 py-5 bg-black dark:bg-zinc-900 text-white rounded-full text-[10px] uppercase tracking-[0.4em] font-bold overflow-hidden group/btn"
                        >
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/btn:animate-[shine_1.5s_ease-in-out_infinite]" />

                            <Instagram size={18} className="text-white group-hover/btn:text-fuchsia-400 transition-colors" />
                            <span>@tekila.nails</span>
                        </motion.a>
                    </div>
                </div>
            </motion.div>

            <style jsx global>{`
                @keyframes shine {
                  100% {
                    left: 125%;
                  }
                }
            `}</style>
        </section>
    )
}