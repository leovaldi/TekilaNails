'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita errores de hidratación
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-6 right-6 z-[60] p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-all duration-500"
    >
      {theme === 'dark' ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-zinc-600" />}
    </button>
  )
}