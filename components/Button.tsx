'use client'
import { motion } from "framer-motion";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean; // 1. Agregamos la propiedad aquí
}

export const PrimaryButton = ({ 
  text, 
  onClick, 
  variant = 'primary', 
  disabled = false // 2. Le damos un valor por defecto
}: ButtonProps) => {
  
  const styles = {
    primary: disabled 
      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" // Estilo cuando está desactivado
      : "bg-black text-white hover:bg-zinc-800",
    outline: "bg-transparent border border-black text-black hover:bg-black hover:text-white"
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.98 }} // Evitamos la animación si está desactivado
      onClick={disabled ? undefined : onClick} // Evitamos el click si está desactivado
      disabled={disabled} // 3. Pasamos el atributo nativo al botón
      className={`w-full py-4 px-8 uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-300 ${styles[variant]}`}
    >
      {text}
    </motion.button>
  );
};