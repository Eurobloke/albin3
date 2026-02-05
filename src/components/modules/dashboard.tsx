'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/app-context'
import { getDashboardStats, getCotizaciones } from '@/lib/api'
import { formatearMonto, formatearMontoCorto } from '@/lib/precios'
import type { Cotizacion, DashboardStats } from '@/lib/types'
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Ruler,
  ArrowRight,
  Plus,
  Mail,
  MessageCircle,
  Download,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'

const estadoConfig: Record<string, { color: string; label: string; badgeClass: string }> = {
  borrador: { color: '#9ca3af', label: 'Borrador', badgeClass: 'badge-pendiente' },
  enviada: { color: '#3b82f6', label: 'Enviada', badgeClass: 'badge-enviada' },
  vista: { color: '#8b5cf6', label: 'Vista', badgeClass: 'badge-produccion' },
  aprobada: { color: '#10b981', label: 'Aprobada', badgeClass: 'badge-aprobada' },
  rechazada: { color: '#ef4444', label: 'Rechazada', badgeClass: 'badge-vencida' },
  negociando: { color: '#f59e0b', label: 'Negociando', badgeClass: 'badge-pendiente' },
  produccion: { color: '#8b5cf6', label: 'En Produccion', badgeClass: 'badge-produccion' },
  instalacion: { color: '#06b6d4', label: 'Instalacion', badgeClass: 'badge-enviada' },
  completada: { color: '#10b981', label: 'Completada', badgeClass: 'badge-aprobada' },
  vencida: { color: '#ef4444', label: 'Vencida', badgeClass: 'badge-vencida' },
  cancelada: { color: '#6b7280', label: 'Cancelada', badgeClass: 'badge-vencida' }
}

export function DashboardModule() {
  const { setCurrentModule, iniciarCotizacion } = useApp()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const [statsRes, cotRes] = await Promise.all([
        getDashboardStats(),
        getCotizaciones()
      ])
      
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      }
      if (cotRes.success && cotRes.data) {
        setCotizaciones(cotRes.data)
      }
      setIsLoading(false)
    }
    
    loadData()
  }, [])
  
  const handleNuevaCotizacion = () => {
    iniciarCotizacion()
    setCurrentModule('cotizaciones')
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Mes"
          value={`RD$${formatearMontoCorto(stats?.total_mes || 0)}`}
          cambio={stats?.total_mes_cambio || 0}
          icon={DollarSign}
          color="orange"
        />
        <StatCard
          label="Cotizaciones"
          value={stats?.cotizaciones_activas.toString() || '0'}
          cambio={stats?.cotizaciones_cambio || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Conversion"
          value={`${stats?.tasa_conversion || 0}%`}
          cambio={stats?.conversion_cambio || 0}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          label="M2 Vendidos"
          value={stats?.m2_vendidos.toFixed(1) || '0'}
          cambio={stats?.m2_cambio || 0}
          icon={Ruler}
          color="green"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Acciones Rapidas</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleNuevaCotizacion}
            className="btn-gradient flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Cotizacion</span>
          </button>
          <button
            onClick={() => setCurrentModule('calculadora')}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Ruler className="w-5 h-5 text-blue-400" />
            <span>Calculadora</span>
          </button>
          <button
            onClick={() => setCurrentModule('clientes')}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Ver Clientes</span>
          </button>
          <button
            onClick={() => setCurrentModule('calendario')}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Calendario</span>
          </button>
        </div>
      </div>
      
      {/* Recent Cotizaciones */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Cotizaciones Recientes</h2>
          <button 
            onClick={() => setCurrentModule('cotizaciones')}
            className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {cotizaciones.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="text-white/50">No hay cotizaciones recientes</p>
            <button 
              onClick={handleNuevaCotizacion}
              className="mt-4 text-orange-500 hover:text-orange-400"
            >
              Crear primera cotizacion
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cotizaciones.slice(0, 5).map(cot => (
              <CotizacionCard key={cot.id} cotizacion={cot} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============ STAT CARD ============

interface StatCardProps {
  label: string
  value: string
  cambio: number
  icon: React.ElementType
  color: 'orange' | 'blue' | 'purple' | 'green'
}

const colorClasses = {
  orange: 'from-orange-500/20 to-orange-500/5 text-orange-500',
  blue: 'from-blue-500/20 to-blue-500/5 text-blue-500',
  purple: 'from-purple-500/20 to-purple-500/5 text-purple-500',
  green: 'from-green-500/20 to-green-500/5 text-green-500'
}

function StatCard({ label, value, cambio, icon: Icon, color }: StatCardProps) {
  const isPositive = cambio >= 0
  
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
          colorClasses[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? '+' : ''}{cambio}%</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </div>
  )
}

// ============ COTIZACION CARD ============

interface CotizacionCardProps {
  cotizacion: Cotizacion
}

function CotizacionCard({ cotizacion }: CotizacionCardProps) {
  const config = estadoConfig[cotizacion.estado] || estadoConfig.borrador
  
  return (
    <div className={cn(
      'p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all cursor-pointer',
      cotizacion.estado === 'aprobada' && 'card-aprobada',
      cotizacion.estado === 'enviada' && 'card-enviada',
      cotizacion.estado === 'produccion' && 'card-produccion',
      cotizacion.estado === 'vencida' && 'card-vencida'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{cotizacion.numero}</span>
            <span className={cn('badge', config.badgeClass)}>{config.label}</span>
          </div>
          <p className="text-white/70 truncate">{cotizacion.cliente.nombre}</p>
          <p className="text-sm text-white/50 truncate">{cotizacion.proyecto}</p>
        </div>
        
        <div className="text-right shrink-0">
          <p className="font-bold text-white">RD${formatearMonto(cotizacion.total)}</p>
          <p className="text-sm text-white/50">{cotizacion.totalM2.toFixed(1)} m2</p>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
        <button 
          className="p-2 text-white/50 hover:text-blue-400 transition-colors"
          title="Enviar por Email"
        >
          <Mail className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-white/50 hover:text-green-400 transition-colors"
          title="Enviar por WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-white/50 hover:text-orange-400 transition-colors"
          title="Descargar PDF"
        >
          <Download className="w-4 h-4" />
        </button>
        <button 
          className="p-2 text-white/50 hover:text-purple-400 transition-colors"
          title="Duplicar"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
