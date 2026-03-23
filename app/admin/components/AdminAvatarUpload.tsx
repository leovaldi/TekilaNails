'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export function AdminAvatarUpload() {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [currentImage, setCurrentImage] = useState<string | null>(null)

    // Cargamos la imagen actual al montar el componente
    useEffect(() => {
        const fetchImage = () => {
            const { data } = supabase.storage
                .from('fotos-servicios')
                .getPublicUrl('biografia/foto-perfil.jpg')

            if (data?.publicUrl) {
                setCurrentImage(`${data.publicUrl}?t=${new Date().getTime()}`)
            }
        }
        fetchImage()
    }, [])

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            setStatus('idle')

            if (!event.target.files || event.target.files.length === 0) return

            const file = event.target.files[0]
            const filePath = `biografia/foto-perfil.jpg`

            const { error } = await supabase.storage
                .from('fotos-servicios')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: 'image/jpeg'
                })

            if (error) throw error

            setStatus('success')

            // Actualizamos la vista previa local inmediatamente con un nuevo timestamp
            // Esto evita el reload y mantiene la sesión abierta
            const { data } = supabase.storage
                .from('fotos-servicios')
                .getPublicUrl(filePath)

            setCurrentImage(`${data.publicUrl}?t=${new Date().getTime()}`)

            // Limpiamos el mensaje de éxito después de 3 segundos
            setTimeout(() => setStatus('idle'), 3000)

        } catch (error) {
            console.error('Error:', error)
            setStatus('error')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-500">
            <div className="flex flex-col items-center text-center gap-4">

                {/* Círculo de Visualización / Estado */}
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${status === 'success' ? 'border-green-500' :
                    status === 'error' ? 'border-red-500' :
                        'border-tekila-pink'
                    }`}>
                    {/* Imagen de fondo (la actual) */}
                    {currentImage && (
                        <Image
                            src={currentImage}
                            alt="Perfil actual"
                            fill
                            className={`object-cover transition-opacity duration-500 ${uploading ? 'opacity-30' : 'opacity-100'}`}
                        />
                    )}

                    {/* Overlay de estados */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/20 ${uploading || status !== 'idle' ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                        ) : status === 'success' ? (
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        ) : null}
                    </div>

                    {/* Icono de cámara si no hay imagen o estamos en idle */}
                    {!currentImage && !uploading && status === 'idle' && (
                        <Camera className="w-8 h-8 text-tekila-pink" />
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
                        Foto de Perfil
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {status === 'success' ? '¡Imagen actualizada con éxito!' : 'Reemplazá la foto de la biografía'}
                    </p>
                </div>

                {/* Botón Real */}
                <label className={`
                    relative overflow-hidden px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer
                    ${uploading ? 'bg-zinc-100 text-zinc-400' : 'bg-tekila-pink text-white hover:scale-105 active:scale-95 shadow-md shadow-tekila-pink/20'}
                `}>
                    {uploading ? 'Subiendo...' : 'Seleccionar Nueva Foto'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>

                {status === 'error' && (
                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter animate-pulse">
                        Hubo un error al subir. Intentá de nuevo.
                    </span>
                )}
            </div>
        </div>
    )
}