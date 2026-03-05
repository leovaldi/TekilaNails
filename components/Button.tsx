'use client'
import { motion } from "framer-motion";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  type?: 'button' | 'submit'; // Agregamos tipo por si se usa en formularios
}

export const PrimaryButton = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button'
}: ButtonProps) => {

  // Estilos adaptados al modo automático y estética de autor
  const styles = {
    primary: disabled
      ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed shadow-none"
      : "bg-foreground text-background hover:opacity-90 shadow-lg shadow-black/5 dark:shadow-white/5",
    outline: "bg-transparent border border-zinc-200 dark:border-zinc-800 text-foreground hover:bg-foreground hover:text-background"
  };

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full py-5 px-8 rounded-full 
        uppercase tracking-[0.4em] text-[9px] font-black 
        transition-all duration-500 
        ${styles[variant]}
      `}
    >
      {text}
    </motion.button>
  );
};