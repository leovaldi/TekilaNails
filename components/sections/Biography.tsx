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
    const [biografia, setBiografia] = useState<string>('') // Estado para la biografía
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfileData() {
            try {
                // 1. Carga de imagen
                const { data: imgData } = supabase.storage
                    .from('fotos-servicios')
                    .getPublicUrl('biografia/foto-perfil.jpg')

                if (imgData?.publicUrl) {
                    setAvatarUrl(`${imgData.publicUrl}?t=${new Date().getTime()}`)
                }

                // 2. Carga de biografía desde la base de datos
                const { data: bioData } = await supabase
                    .from('perfil')
                    .select('biografia')
                    .eq('id', 1)
                    .single()

                if (bioData) {
                    setBiografia(bioData.biografia)
                }
            } catch (error) {
                console.error('Error cargando datos de perfil:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProfileData()
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
                            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full" />
                        ) : (
                            <Image
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
                    <h2 className="text-[clamp(1.5rem,6vw,3rem)] font-light font-serif italic text-foreground mb-6 leading-tight">
                        Rocío Mena, <span className="text-tekila-pink">Especialista en Nail Art</span>
                    </h2>

                    <div className="h-[0.125rem] w-[5rem] bg-tekila-pink mb-8 opacity-60"></div>

                    <p className="text-[0.875rem] md:text-base font-light tracking-wide text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl whitespace-pre-wrap">
                        {biografia}
                    </p>
                </div>
            </motion.div>
        </section>
    )
}