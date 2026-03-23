'use client'
import { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const sparkleVariants: Variants = {
    animate: {
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6],
        transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
    }
};

export function Biography() {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfileImage() {
            try {
                // 1. Obtenemos la URL pública del archivo fijo en la carpeta biografia
                const { data } = supabase.storage
                    .from('fotos-servicios')
                    .getPublicUrl('biografia/foto-perfil.jpg')

                if (data?.publicUrl) {
                    // 2. Aplicamos el Cache Buster (?t=...) para que el navegador 
                    // siempre descargue la versión más reciente si fue reemplazada
                    setAvatarUrl(`${data.publicUrl}?t=${new Date().getTime()}`)
                }
            } catch (error) {
                console.error('Error cargando imagen de perfil:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProfileImage()
    }, [])

    return (
        <section id="biography-section" className="py-24 md:py-32 px-6 bg-zinc-50/50 dark:bg-[#0a0a0a] border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20"
            >
                {/* Foto con Sparkles */}
                <div className="relative shrink-0">
                    <motion.div variants={sparkleVariants} animate="animate" className="absolute -top-4 -left-4 text-tekila-light text-xl z-10">✦</motion.div>
                    <motion.div variants={sparkleVariants} animate="animate" transition={{ delay: 0.7 }} className="absolute -bottom-2 -right-2 text-tekila-light/50 z-10">✦</motion.div>

                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-tekila-light/30 p-1.5 shadow-2xl bg-white dark:bg-zinc-900 relative">
                        {loading ? (
                            // Skeleton mientras carga la URL
                            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full" />
                        ) : (
                            <Image
                                // Si no hay avatarUrl por algún error, volvemos al logo por defecto
                                src={avatarUrl || "/logo.png"}
                                alt="Rocío Mena"
                                fill
                                className="object-cover rounded-full"
                                sizes="(max-width: 768px) 128px, 192px"
                                priority
                            />
                        )}
                    </div>
                </div>

                {/* Texto */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-light font-serif italic text-foreground mb-6 leading-tight">
                        Rocío Mena, <span className="text-tekila-pink">Especialista en Nail Art</span>
                    </h2>

                    <div className="h-[2px] w-20 bg-tekila-pink mb-8 opacity-60"></div>

                    <p className="text-[14px] md:text-base font-light tracking-wide text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                        Soy Rocío Mena, tengo 22 años y me dedico con pasión al arte de las uñas. Me capacité durante un año en la Academia Amelie y continué mi formación con un perfeccionamiento de seis meses junto a Agustina Becerra. Me encanta este mundo porque me permite ser creativa, cuidar los detalles y hacer que cada persona se sienta linda y segura con sus manos.
                    </p>
                </div>
            </motion.div>
        </section>
    )
}