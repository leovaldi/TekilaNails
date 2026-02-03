'use client'
import { motion } from "framer-motion";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
}

export const PrimaryButton = ({ text, onClick, variant = 'primary' }: ButtonProps) => {
  const styles = {
    primary: "bg-black text-white hover:bg-zinc-800",
    outline: "bg-transparent border border-black text-black hover:bg-black hover:text-white"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full py-4 px-8 uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-300 ${styles[variant]}`}
    >
      {text}
    </motion.button>
  );
};