'use client'
import { motion, Variants } from 'framer-motion'
import { CreditCard, MapPin, Clock, Instagram, ShieldCheck, UserMinus, AlertCircle } from 'lucide-react'

// Array de Pautas: Mismo contenido, estructura de card mejorada
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

// Variants para el brillo del botón de RRSS (Se mantiene)
const btnShineVariants: Variants = {
    animate: {
        left: '125%',
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5 // Pequeño retraso
        }
    }
}

export function Methodology() {
    return (
        <section id="methodology-section" className="py-24 md:py-32 px-6 max-w-7xl mx-auto border-t border-zinc-50 dark:border-zinc-900 overflow-hidden bg-zinc-50/50 dark:bg-[#0a0a0a]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
            >
                <div className="text-center mb-16 md:mb-20">
                    {/* TÍTULO CAMBIADO A POLÍTICAS */}
                    <h2 className="text-[clamp(1.5rem,6vw,3rem)] font-light tracking-tighter mb-4 text-zinc-900 dark:text-white">
                        Políticas Tekila
                    </h2>

                    {/* LÍNEA CON PARPADEO (Se mantiene) */}
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-[1px] bg-tekila-pink mx-auto mb-4"
                    />

                    <p className="text-[0.625rem] md:text-[0.6875rem] uppercase tracking-[0.4em] text-zinc-400 font-medium">Leé con atención antes de reservar</p>
                </div>

                {/* PAUTAS CON DISEÑO DE CARDS (Estilo Referencia) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 w-full mb-28 md:mb-36">
                    {PAUTAS.map(({ icon: Icon, title, text }, index) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group p-[1px] rounded-3xl overflow-hidden h-full shadow-sm"
                        >
                            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,#FF0080_220deg,#FF99CC_260deg,#FF0080_300deg,#FFFFFF_340deg,#000_360deg)] animate-[spin_8s_linear_infinite] opacity-30 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-700" />
                            <div className="relative bg-background p-7 rounded-[1.4375rem] flex gap-5 items-start h-full border border-zinc-100 dark:border-zinc-800">
                                <div className="w-11 h-11 rounded-full bg-background flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 md:group-hover:border-tekila-pink transition-all duration-500">
                                    <Icon className="text-tekila-pink md:text-tekila-gray md:group-hover:text-tekila-pink transition-colors" size={20} />
                                </div>
                                <div className="space-y-1.5 pt-1">
                                    <h4 className="text-[0.6875rem] font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">{title}</h4>
                                    <p className="text-[0.8125rem] md:text-[0.875rem] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ──────── CUADROS DE REDES SOCIALES DIVIDIDOS (Instagram y TikTok) ──────── */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 pb-16">

                    {/* LADO IZQUIERDO: INSTAGRAM */}
                    <div className="relative group p-[1px] rounded-[2.5rem] overflow-hidden flex-1 shadow-2xl">
                        {/* Animación del borde (Se mantiene) */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,#FF0080_220deg,#FF99CC_260deg,#FF0080_300deg,#FFFFFF_340deg,#000_360deg)] animate-[spin_8s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* FONDO INTERIOR MODIFICADO: Ultra-sutil y profundo --- */}
                        <div className="relative flex flex-col items-center gap-10 bg-background p-8 sm:p-12 rounded-[2.4375rem] h-full overflow-hidden border border-zinc-100 dark:border-zinc-800/50">

                            {/* Gradientes radiales estáticos: AJUSTADOS para ser MÍNIMOS --- */}
                            <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(circle_at_50%_50%,#FF0080_0%,#FF99CC_30%,transparent_70%)] blur-2xl z-0" />
                            {/* Glow extra para IG */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-tekila-pink/5 dark:bg-tekila-pink/10 blur-[5rem] rounded-full z-0" />

                            {/* Contenido (relative z-10 para estar sobre el fondo) */}
                            <div className="text-center relative z-10 space-y-3">
                                <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-light tracking-tight text-zinc-900 dark:text-white relative z-10">Manifestando tu próximo set🔥</h3>
                                <p className="text-[0.625rem] md:text-[0.6875rem] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em] font-medium max-w-sm mx-auto relative z-10">Cada set es un mood. Descubrí tu próximo diseño en nuestro IG.</p>
                            </div>

                            <motion.a
                                href="https://instagram.com/tekila.nails"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex items-center gap-3 px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[0.625rem] md:text-[0.6875rem] uppercase tracking-[0.4em] font-bold overflow-hidden group/btn shadow-xl transition-all z-10"
                            >
                                <motion.div variants={btnShineVariants} animate="animate" className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <Instagram size={18} />
                                <span>@tekila.nails</span>
                            </motion.a>
                        </div>
                    </div>

                    {/* LADO DERECHO: TIKTOK */}
                    <div className="relative group p-[1px] rounded-[2.5rem] overflow-hidden flex-1 shadow-2xl">
                        {/* Animación del borde */}
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_180deg,#FF99CC_220deg,#FF0080_260deg,#FF99CC_300deg,#FFFFFF_340deg,#000_360deg)] animate-[spin_8s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* FONDO INTERIOR MODIFICADO --- */}
                        <div className="relative flex flex-col items-center gap-10 bg-background p-8 sm:p-12 rounded-[2.4375rem] h-full overflow-hidden border border-zinc-100 dark:border-zinc-800/50">

                            {/* Gradientes radiales estáticos: AJUSTADOS para ser MÍNIMOS --- */}
                            <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(circle_at_50%_50%,#FF99CC_0%,#FF0080_30%,transparent_70%)] blur-2xl z-0" />
                            {/* Glow extra para TT */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-tekila-pink/5 dark:bg-tekila-pink/10 blur-[5rem] rounded-full z-0" />

                            {/* Contenido (relative z-10 para estar sobre el fondo) */}
                            <div className="text-center relative z-10 space-y-3">
                                <h3 className="text-[clamp(1.5rem,5vw,2.25rem)] font-light tracking-tight text-zinc-900 dark:text-white relative z-10">¿Team procesos?🎬</h3>
                                <p className="text-[0.625rem] md:text-[0.6875rem] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.3em] font-medium max-w-sm mx-auto relative z-10">Tutoriales rápidos y todo el vibe del nail art en TikTok.</p>
                            </div>

                            <motion.a
                                href="https://tiktok.com/@tekila.nails"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex items-center gap-3 px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[0.625rem] md:text-[0.6875rem] uppercase tracking-[0.4em] font-bold overflow-hidden group/btn shadow-xl transition-all z-10"
                            >
                                <motion.div variants={btnShineVariants} animate="animate" className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                {/* Logo de TikTok (SVG oficial) */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                                </svg>

                                <span>@tekila.nails</span>
                            </motion.a>
                        </div>
                    </div>
                </div>

            </motion.div>
        </section>
    )
}