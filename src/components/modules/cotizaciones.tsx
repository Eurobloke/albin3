'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { getCotizaciones, getClientes } from '@/lib/api'
import { formatearMonto } from '@/lib/precios'
import type { Cotizacion, Cliente, EstadoCotizacion } from '@/lib/types'
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  MessageCircle, 
  Download, 
  Copy,
  MoreVertical,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NuevaCotizacionModal } from './cotizacion-form'

const estadoConfig: Record<EstadoCotizacion, { color: string; label: string; badgeClass: string }> = {
  borrador: { color: '#9ca3af', label: 'Borrador', badgeClass: 'badge-pendiente' },
  enviada: { color: '#3b82f6', label: 'Enviada', badgeClass: 'badge-enviada' },
  vista: { color: '#8b5cf6', label: 'Vista', badgeClass: 'badge-produccion' },
  aprobada: { color: '#10b981', label: 'Aprobada', badgeClass: 'badge-aprobada' },
  rechazada: { color: '#ef4444', label: 'Rechazada', badgeClass: 'badge-vencida' },
  negociando: { color: '#f59e0b', label: 'Negociando', badgeClass: 'badge-pendiente' },
  produccion: { color: '#8b5cf6', label: 'Produccion', badgeClass: 'badge-produccion' },
  instalacion: { color: '#06b6d4', label: 'Instalacion', badgeClass: 'badge-enviada' },
  completada: { color: '#10b981', label: 'Completada', badgeClass: 'badge-aprobada' },
  vencida: { color: '#ef4444', label: 'Vencida', badgeClass: 'badge-vencida' },
  cancelada: { color: '#6b7280', label: 'Cancelada', badgeClass: 'badge-vencida' }
}

const estadoFiltros: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'enviada', label: 'Enviadas' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'produccion', label: 'En Produccion' },
  { value: 'vencida', label: 'Vencidas' }
]

export function CotizacionesModule() {
  const { cotizacionActual, iniciarCotizacion } = useApp()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todas')
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  useEffect(() => {
    loadData()
  }, [])
  
  useEffect(() => {
    if (cotizacionActual) {
      setShowModal(true)
    }
  }, [cotizacionActual])
  
  const loadData = async () => {
    setIsLoading(true)
    const [cotRes, cliRes] = await Promise.all([
      getCotizaciones(),
      getClientes()
    ])
    
    if (cotRes.success && cotRes.data) {
      setCotizaciones(cotRes.data)
    }
    if (cliRes.success && cliRes.data) {
      setClientes(cliRes.data)
    }
    setIsLoading(false)
  }
  
  const cotizacionesFiltradas = cotizaciones.filter(cot => {
    // Filtro de estado
    if (estadoFiltro !== 'todas' && cot.estado !== estadoFiltro) return false
    
    // Filtro de busqueda
    if (busqueda) {
      const query = busqueda.toLowerCase()
      return (
        cot.numero.toLowerCase().includes(query) ||
        cot.cliente.nombre.toLowerCase().includes(query) ||
        cot.proyecto.toLowerCase().includes(query)
      )
    }
    
    return true
  })
  
  const handleNuevaCotizacion = () => {
    iniciarCotizacion()
    setShowModal(true)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Header con busqueda y filtros */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por numero, cliente o proyecto..."
              className="input-dark w-full pl-10"
            />
          </div>
          
          {/* Filtros (desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            {estadoFiltros.map(filtro => (
              <button
                key={filtro.value}
                onClick={() => setEstadoFiltro(filtro.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-all',
                  estadoFiltro === filtro.value
                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                )}
              >
                {filtro.label}
              </button>
            ))}
          </div>
          
          {/* Boton filtros (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-3 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
          
          {/* Boton nueva cotizacion */}
          <button
            onClick={handleNuevaCotizacion}
            className="btn-gradient flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nueva Cotizacion</span>
          </button>
        </div>
        
        {/* Filtros mobile expandido */}
        {showFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {estadoFiltros.map(filtro => (
                <button
                  key={filtro.value}
                  onClick={() => {
                    setEstadoFiltro(filtro.value)
                    setShowFilters(false)
                  }}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm transition-all',
                    estadoFiltro === filtro.value
                      ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white'
                      : 'bg-white/5 text-white/70'
                  )}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Conteo de resultados */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-white/50">
          {cotizacionesFiltradas.length} cotizacion{cotizacionesFiltradas.length !== 1 ? 'es' : ''}
        </p>
      </div>
      
      {/* Lista de cotizaciones */}
      {cotizacionesFiltradas.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-white/50 mb-4">No se encontraron cotizaciones</p>
          <button 
            onClick={handleNuevaCotizacion}
            className="text-orange-500 hover:text-orange-400"
          >
            Crear nueva cotizacion
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cotizacionesFiltradas.map(cot => (
            <CotizacionCard key={cot.id} cotizacion={cot} />
          ))}
        </div>
      )}
      
      {/* Modal Nueva/Editar Cotizacion */}
      {showModal && (
        <NuevaCotizacionModal 
          clientes={clientes}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// ============ COTIZACION CARD ============

interface CotizacionCardProps {
  cotizacion: Cotizacion
}

function CotizacionCard({ cotizacion }: CotizacionCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const config = estadoConfig[cotizacion.estado]
  
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
  
  return (
    <div className={cn(
      'glass-card hover:border-orange-500/30 transition-all cursor-pointer',
      cotizacion.estado === 'aprobada' && 'card-aprobada',
      cotizacion.estado === 'enviada' && 'card-enviada',
      cotizacion.estado === 'produccion' && 'card-produccion',
      cotizacion.estado === 'vencida' && 'card-vencida'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{cotizacion.numero}</span>
            <span className={cn('badge text-xs', config.badgeClass)}>{config.label}</span>
          </div>
          <p className="text-sm text-white/50">{formatFecha(cotizacion.fecha)}</p>
        </div>
        
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-1 w-48 py-2 rounded-xl bg-[#151a2d] border border-white/10 shadow-xl z-20">
                <button className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/5 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Enviar por Email
                </button>
                <button className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/5 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Enviar WhatsApp
                </button>
                <button className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/5 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Descargar PDF
                </button>
                <button className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/5 flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Duplicar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Cliente y proyecto */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="font-medium text-white">{cotizacion.cliente.nombre}</p>
        <p className="text-sm text-white/50 truncate">{cotizacion.proyecto}</p>
      </div>
      
      {/* Info adicional */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-white/50">
          <span>{cotizacion.elementos.length} elementos</span>
          <span>{cotizacion.totalM2.toFixed(1)} m2</span>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">RD${formatearMonto(cotizacion.total)}</p>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            onClick={e => e.stopPropagation()}
            className="p-2 text-white/40 hover:text-blue-400 transition-colors"
            title="Enviar Email"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button 
            onClick={e => e.stopPropagation()}
            className="p-2 text-white/40 hover:text-green-400 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={e => e.stopPropagation()}
            className="p-2 text-white/40 hover:text-orange-400 transition-colors"
            title="PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <button className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400">
          Ver detalle <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
