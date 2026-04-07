'use client'
import { motion } from "framer-motion";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
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

  // Estilos adaptados al nuevo diseño Deep Dark / Neon Pink
  const styles = {
    primary: disabled
      ? "bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 cursor-not-allowed shadow-none"
      : "bg-black text-white dark:bg-white dark:text-black hover:shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:text-[#FF0080] dark:hover:text-[#FF0080]",
    outline: "bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-[#FF0080] hover:text-[#FF0080]",
    secondary: "bg-transparent text-zinc-400 hover:text-[#FF0080] underline underline-offset-4"
  };

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full py-5 px-8 rounded-full 
        uppercase tracking-[0.4em] text-[0.5625rem] font-black 
        transition-all duration-500 
        ${styles[variant]}
      `}
    >
      {text}
    </motion.button>
  );
};