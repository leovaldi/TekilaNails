'use client'
import { motion } from "framer-motion";

const images = ["/trabajo1.png", "/trabajo2.png", "/trabajo3.png"]; // Sube tus fotos a /public

export const Gallery = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10 px-6">
    {images.map((img, i) => (
      <motion.div 
        key={i}
        whileHover={{ scale: 1.02 }}
        className="aspect-[3/4] bg-zinc-100 overflow-hidden relative"
      >
        {/* Aquí iría el componente Image de Next.js */}
        <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-zinc-400">
          Trabajo Real @Tekila.nails
        </div>
      </motion.div>
    ))}
  </div>
);