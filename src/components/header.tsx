'use client'

import { useApp } from '@/lib/app-context'
import { Menu, Bell, Search } from 'lucide-react'

const moduleNames: Record<string, string> = {
  dashboard: 'Dashboard',
  cotizaciones: 'Cotizaciones',
  calculadora: 'Calculadora Rapida',
  clientes: 'Clientes',
  calendario: 'Calendario',
  pagos: 'Pagos',
  galeria: 'Galeria',
  configuracion: 'Configuracion'
}

export function Header() {
  const { toggleSidebar, currentModule } = useApp()
  
  return (
    <header className="sticky top-0 z-30 safe-top">
      <div className="px-4 py-3 flex items-center justify-between bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/10">
        {/* Menu button (mobile) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white transition-colors touch-target"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Title */}
        <div className="lg:ml-0">
          <h1 className="text-lg font-semibold text-white">
            {moduleNames[currentModule] || 'Dashboard'}
          </h1>
        </div>
        
        {/* Spacer for centering on mobile */}
        <div className="flex-1 lg:hidden" />
        
        {/* Search (desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar cotizaciones, clientes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search button (mobile) */}
          <button 
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors touch-target"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <button 
            className="relative p-2 text-white/70 hover:text-white transition-colors touch-target"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
          </button>
        </div>
      </div>
    </header>
  )
}
