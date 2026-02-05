'use client'

import { useAuth } from '@/lib/auth-context'
import { useApp } from '@/lib/app-context'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Calendar, 
  CreditCard, 
  ImageIcon, 
  Settings, 
  LogOut,
  X,
  Calculator
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'vendedor', 'tecnico'] },
  { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText, roles: ['admin', 'vendedor'] },
  { id: 'calculadora', label: 'Calculadora', icon: Calculator, roles: ['admin', 'vendedor', 'tecnico'] },
  { id: 'clientes', label: 'Clientes', icon: Users, roles: ['admin', 'vendedor'] },
  { id: 'calendario', label: 'Calendario', icon: Calendar, roles: ['admin', 'vendedor', 'tecnico'] },
  { id: 'pagos', label: 'Pagos', icon: CreditCard, roles: ['admin'] },
  { id: 'galeria', label: 'Galeria', icon: ImageIcon, roles: ['admin', 'vendedor', 'tecnico'] },
  { id: 'configuracion', label: 'Configuracion', icon: Settings, roles: ['admin'] }
]

export function Sidebar() {
  const { user: usuario, logout, hasRole } = useAuth()
  const { sidebarOpen, setSidebarOpen, currentModule, setCurrentModule } = useApp()
  
  const filteredMenu = menuItems.filter(item => 
    hasRole(item.roles as ('admin' | 'vendedor' | 'tecnico')[])
  )
  
  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-72 z-50 transition-transform duration-300 lg:translate-x-0',
        'bg-[#0B0E14]/95 backdrop-blur-xl border-r border-white/10',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="font-bold text-white">AluminioRD</h1>
                <p className="text-xs text-white/50">Pro Edition</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User info */}
          {usuario && (
            <div className="p-4 mx-4 mt-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {usuario.nombre.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{usuario.nombre}</p>
                  <p className="text-xs text-white/50 capitalize">{usuario.rol}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Menu */}
          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {filteredMenu.map(item => {
                const Icon = item.icon
                const isActive = currentModule === item.id
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentModule(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        'text-left touch-target',
                        isActive 
                          ? 'bg-gradient-to-r from-orange-500/20 to-blue-500/20 text-white border border-orange-500/30' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-orange-500' : ''
                      )} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors touch-target"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
