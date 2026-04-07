'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Loader2, CheckCircle2, AlertCircle, Save, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export function AdminAvatarUpload() {
    // --- ESTADOS ORIGINALES (BIO Y FOTO) ---
    const [uploading, setUploading] = useState(false)
    const [savingBio, setSavingBio] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [currentImage, setCurrentImage] = useState<string | null>(null)
    const [biografia, setBiografia] = useState('')

    // --- ESTADOS DE SEGURIDAD (MEJORADOS) ---
    const [showSecurity, setShowSecurity] = useState(false)
    const [passActual, setPassActual] = useState('')
    const [nuevaClave, setNuevaClave] = useState('')
    const [confirmarClave, setConfirmarClave] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [updatingPass, setUpdatingPass] = useState(false)
    const [passError, setPassError] = useState('')

    useEffect(() => {
        const fetchProfileData = async () => {
            const { data: imgData } = supabase.storage
                .from('fotos-servicios')
                .getPublicUrl('biografia/foto-perfil.jpg')

            if (imgData?.publicUrl) {
                setCurrentImage(`${imgData.publicUrl}?t=${new Date().getTime()}`)
            }

            const { data: bioData } = await supabase
                .from('perfil')
                .select('biografia')
                .eq('id', 1)
                .single()

            if (bioData) setBiografia(bioData.biografia)
        }
        fetchProfileData()
    }, [])

    // --- MANEJADORES ORIGINALES ---
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            setStatus('idle')
            if (!event.target.files || event.target.files.length === 0) return
            const file = event.target.files[0]
            const filePath = `biografia/foto-perfil.jpg`

            const { error } = await supabase.storage
                .from('fotos-servicios')
                .upload(filePath, file, { upsert: true, contentType: 'image/jpeg' })

            if (error) throw error
            setStatus('success')
            const { data } = supabase.storage.from('fotos-servicios').getPublicUrl(filePath)
            setCurrentImage(`${data.publicUrl}?t=${new Date().getTime()}`)
            setTimeout(() => setStatus('idle'), 3000)
        } catch (error) {
            setStatus('error')
        } finally {
            setUploading(false)
        }
    }

    const handleSaveBio = async () => {
        try {
            setSavingBio(true)
            const { error } = await supabase.from('perfil').update({ biografia }).eq('id', 1)
            if (error) throw error
            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
        } catch (error) {
            setStatus('error')
        } finally {
            setSavingBio(false)
        }
    }

    // --- NUEVA LÓGICA DE SEGURIDAD ENCRIPTADA ---
    const handleUpdatePassword = async () => {
        setPassError('')

        // 1. Validaciones de cliente
        if (nuevaClave !== confirmarClave) {
            setPassError('Las nuevas contraseñas no coinciden.')
            return
        }

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!passRegex.test(nuevaClave)) {
            setPassError('Mínimo 8 caracteres, una mayúscula y un número.')
            return
        }

        try {
            setUpdatingPass(true)

            // 2. Verificar contraseña actual (RPC)
            const { data: isValid, error: rpcError } = await supabase
                .rpc('verificar_admin_password', { password_intento: passActual })

            if (rpcError) throw rpcError;

            if (!isValid) {
                setPassError('La contraseña actual es incorrecta.')
                return
            }

            // 3. Actualizar a la nueva contraseña (RPC - genera nuevo hash)
            const { error: updateError } = await supabase
                .rpc('actualizar_admin_password', { nueva_password: nuevaClave })

            if (updateError) throw updateError

            setStatus('success')
            resetSecurityFields()
            setTimeout(() => setStatus('idle'), 3000)
        } catch (error) {
            console.error(error)
            setStatus('error')
        } finally {
            setUpdatingPass(false)
        }
    }

    const resetSecurityFields = () => {
        setShowSecurity(false)
        setPassActual('')
        setNuevaClave('')
        setConfirmarClave('')
        setPassError('')
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-500">
            <div className="flex flex-col items-center text-center gap-4">

                {/* Avatar Display */}
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${status === 'success' ? 'border-green-500' : status === 'error' ? 'border-red-500' : 'border-tekila-pink'}`}>
                    {currentImage && (
                        <Image src={currentImage} alt="Perfil" fill className={`object-cover transition-opacity duration-500 ${uploading ? 'opacity-30' : 'opacity-100'}`} />
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/20 ${uploading || status !== 'idle' ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                        {uploading ? <Loader2 className="w-8 h-8 animate-spin text-white" /> :
                            status === 'success' ? <CheckCircle2 className="w-8 h-8 text-green-400" /> :
                                <AlertCircle className="w-8 h-8 text-red-400" />}
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">Foto de Perfil</h3>
                </div>

                <label className={`relative overflow-hidden px-8 py-3 rounded-full text-[0.625rem] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${uploading ? 'bg-zinc-100 text-zinc-400' : 'bg-tekila-pink text-white hover:scale-105 active:scale-95 shadow-md shadow-tekila-pink/20'}`}>
                    {uploading ? 'Subiendo...' : 'Seleccionar Nueva Foto'}
                    <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>

                {/* Bio Section */}
                <div className="w-full space-y-2 mt-4">
                    <textarea
                        value={biografia}
                        onChange={(e) => setBiografia(e.target.value)}
                        placeholder="Escribe la biografía aquí..."
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl text-xs h-32 outline-none focus:border-tekila-pink transition-all resize-none text-zinc-700 dark:text-zinc-200"
                    />
                    <button
                        onClick={handleSaveBio}
                        disabled={savingBio}
                        className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl text-[0.625rem] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                        {savingBio ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar Biografía
                    </button>
                </div>

                {status === 'error' && !passError && (
                    <span className="text-[0.5625rem] text-red-500 font-bold uppercase animate-pulse">Error de conexión.</span>
                )}

                <hr className="w-full border-zinc-100 dark:border-zinc-800 my-2" />

                {/* SEGURIDAD DESPLEGABLE AL FINAL */}
                <div className="w-full">
                    {!showSecurity ? (
                        <button
                            onClick={() => setShowSecurity(true)}
                            className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-400 hover:text-tekila-pink flex items-center justify-center gap-2 w-full py-2 transition-colors"
                        >
                            <Lock size={12} /> Configuración de Acceso
                        </button>
                    ) : (
                        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <input
                                type="password"
                                value={passActual}
                                onChange={(e) => setPassActual(e.target.value)}
                                placeholder="Contraseña actual"
                                className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-tekila-pink"
                            />

                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={nuevaClave}
                                    onChange={(e) => setNuevaClave(e.target.value)}
                                    placeholder="Nueva contraseña"
                                    className="w-full p-3 pr-10 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-tekila-pink"
                                />
                                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            <input
                                type={showPass ? "text" : "password"}
                                value={confirmarClave}
                                onChange={(e) => setConfirmarClave(e.target.value)}
                                placeholder="Repetir nueva contraseña"
                                className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-xs outline-none focus:border-tekila-pink"
                            />

                            {passError && <p className="text-[0.5625rem] text-red-500 font-bold uppercase px-1">{passError}</p>}

                            <button
                                onClick={handleUpdatePassword}
                                disabled={updatingPass}
                                className="w-full py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-[0.5625rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                {updatingPass ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Actualizar Acceso
                            </button>
                            <button
                                onClick={resetSecurityFields}
                                className="text-[0.5625rem] font-bold uppercase text-zinc-400 w-full pt-1 hover:text-red-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}