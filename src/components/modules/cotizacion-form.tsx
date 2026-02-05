'use client'

import { useState } from 'react'
import { useApp } from '@/lib/app-context'
import { PRODUCTOS, COLORES_PERFIL, getProductosPorCategoria, CATEGORIAS } from '@/lib/productos'
import { calcularElemento } from '@/lib/calculos'
import { calcularPrecioElemento, calcularTotalesCotizacion, formatearMonto } from '@/lib/precios'
import type { Cliente, ElementoCotizacion, TipoProducto } from '@/lib/types'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Package, 
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NuevaCotizacionModalProps {
  clientes: Cliente[]
  onClose: () => void
  onSave: () => void
}

export function NuevaCotizacionModal({ clientes, onClose, onSave }: NuevaCotizacionModalProps) {
  const { cotizacionActual, actualizarCotizacion, agregarElemento, eliminarElemento, limpiarCotizacion, saveCotizacion } = useApp()
  const [paso, setPaso] = useState(1)
  const [showElementoModal, setShowElementoModal] = useState(false)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  
  const pasos = [
    { numero: 1, titulo: 'Cliente', icon: User },
    { numero: 2, titulo: 'Elementos', icon: Package },
    { numero: 3, titulo: 'Revision', icon: CheckCircle }
  ]
  
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.telefono.includes(busquedaCliente)
  )
  
  const handleClose = () => {
    limpiarCotizacion()
    onClose()
  }
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  
  const handleGuardar = async () => {
    if (!cotizacionActual?.cliente) {
      setSaveError('Selecciona un cliente')
      return
    }
    if (!elementos.length) {
      setSaveError('Agrega al menos un elemento')
      return
    }
    
    setIsSaving(true)
    setSaveError('')
    
    try {
      // Preparar datos de la cotizacion
      const cotizacionData = {
        cliente_id: cotizacionActual.cliente?.id,
        proyecto: cotizacionActual.proyecto || '',
        fecha: new Date().toISOString().split('T')[0],
        fecha_validez: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        elementos: elementos.map(e => ({
          tipo: e.tipo,
          color: e.color,
          ancho: e.calculo.medidas.ancho,
          alto: e.calculo.medidas.alto,
          cantidad: e.cantidad,
          precio_unitario: e.precio_unitario,
          precio_total: e.precio_total,
          detalles: e.calculo
        })),
        subtotal_materiales: totales.subtotalMateriales,
        instalacion_incluida: cotizacionActual.instalacion_incluida ?? true,
        instalacion: totales.instalacion,
        subtotal_general: totales.subtotalGeneral,
        descuento_porcentaje: cotizacionActual.descuento_porcentaje ?? 0,
        descuento: totales.descuento,
        base_imponible: totales.baseImponible,
        itbis: totales.itbis,
        total: totales.total,
        total_m2: totales.totalM2,
        estado: 'borrador',
        validez_dias: 15
      }
      
      await saveCotizacion(cotizacionData)
      limpiarCotizacion()
      onSave()
    } catch {
      setSaveError('Error al guardar. Intente de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const elementos = cotizacionActual?.elementos || []
  const totales = calcularTotalesCotizacion(
    elementos.map(e => ({ precio_total: e.precio_total, m2: e.calculo.medidas.m2 * e.cantidad })),
    cotizacionActual?.instalacion_incluida ?? true,
    cotizacionActual?.descuento_porcentaje ?? 0
  )
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-[#0B0E14] sm:rounded-2xl overflow-hidden flex flex-col safe-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Nueva Cotizacion</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Stepper */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            {pasos.map((p, i) => {
              const Icon = p.icon
              const isActive = paso === p.numero
              const isComplete = paso > p.numero
              
              return (
                <div key={p.numero} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-2',
                    isActive ? 'text-orange-500' : isComplete ? 'text-green-500' : 'text-white/40'
                  )}>
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2',
                      isActive ? 'border-orange-500 bg-orange-500/20' : 
                      isComplete ? 'border-green-500 bg-green-500/20' : 
                      'border-white/20'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{p.titulo}</span>
                  </div>
                  {i < pasos.length - 1 && (
                    <div className={cn(
                      'w-12 sm:w-24 h-0.5 mx-2',
                      isComplete ? 'bg-green-500' : 'bg-white/20'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {paso === 1 && (
            <PasoCliente 
              clientes={clientesFiltrados}
              busqueda={busquedaCliente}
              setBusqueda={setBusquedaCliente}
              clienteSeleccionado={cotizacionActual?.cliente}
              onSelect={(cliente) => actualizarCotizacion({ cliente })}
              proyecto={cotizacionActual?.proyecto || ''}
              onProyectoChange={(proyecto) => actualizarCotizacion({ proyecto })}
            />
          )}
          
          {paso === 2 && (
            <PasoElementos
              elementos={elementos}
              onAgregar={() => setShowElementoModal(true)}
              onEliminar={eliminarElemento}
            />
          )}
          
          {paso === 3 && (
            <PasoRevision
              cotizacion={cotizacionActual}
              elementos={elementos}
              totales={totales}
              onCambiarInstalacion={(v) => actualizarCotizacion({ instalacion_incluida: v })}
              onCambiarDescuento={(v) => actualizarCotizacion({ descuento_porcentaje: v })}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          {paso > 1 ? (
            <button
              onClick={() => setPaso(p => p - 1)}
              className="flex items-center gap-1 px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
          ) : (
            <div />
          )}
          
          {paso < 3 ? (
            <button
              onClick={() => setPaso(p => p + 1)}
              disabled={paso === 1 && !cotizacionActual?.cliente}
              className="btn-gradient flex items-center gap-1 disabled:opacity-50"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
<div className="flex flex-col items-end gap-2">
    {saveError && (
      <p className="text-red-400 text-sm">{saveError}</p>
    )}
    <button
      onClick={handleGuardar}
      disabled={isSaving}
      className="btn-gradient disabled:opacity-50"
    >
      {isSaving ? 'Guardando...' : 'Guardar Cotizacion'}
    </button>
  </div>
          )}
        </div>
      </div>
      
      {/* Modal agregar elemento */}
      {showElementoModal && (
        <AgregarElementoModal
          onClose={() => setShowElementoModal(false)}
          onAgregar={(elemento) => {
            agregarElemento(elemento)
            setShowElementoModal(false)
          }}
        />
      )}
    </div>
  )
}

// ============ PASO 1: CLIENTE ============

interface PasoClienteProps {
  clientes: Cliente[]
  busqueda: string
  setBusqueda: (v: string) => void
  clienteSeleccionado?: Cliente
  onSelect: (cliente: Cliente) => void
  proyecto: string
  onProyectoChange: (v: string) => void
}

function PasoCliente({ clientes, busqueda, setBusqueda, clienteSeleccionado, onSelect, proyecto, onProyectoChange }: PasoClienteProps) {
  return (
    <div className="space-y-4">
      {/* Busqueda de cliente */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar cliente por nombre o telefono..."
          className="input-dark w-full pl-10"
        />
      </div>
      
      {/* Lista de clientes */}
      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {clientes.map(cliente => (
          <button
            key={cliente.id}
            onClick={() => onSelect(cliente)}
            className={cn(
              'w-full p-3 rounded-xl text-left transition-all',
              clienteSeleccionado?.id === cliente.id
                ? 'bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
            )}
          >
            <p className="font-medium text-white">{cliente.nombre}</p>
            <p className="text-sm text-white/50">{cliente.telefono}</p>
          </button>
        ))}
      </div>
      
      {/* Cliente seleccionado */}
      {clienteSeleccionado && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20">
          <p className="text-sm text-white/50 mb-1">Cliente seleccionado:</p>
          <p className="font-semibold text-white">{clienteSeleccionado.nombre}</p>
          <p className="text-sm text-white/70">{clienteSeleccionado.telefono}</p>
        </div>
      )}
      
      {/* Proyecto */}
      <div>
        <label className="block text-sm text-white/50 mb-2">Nombre del Proyecto</label>
        <input
          type="text"
          value={proyecto}
          onChange={e => onProyectoChange(e.target.value)}
          placeholder="Ej: Residencia Piantini, Apto 501..."
          className="input-dark w-full"
        />
      </div>
    </div>
  )
}

// ============ PASO 2: ELEMENTOS ============

interface PasoElementosProps {
  elementos: ElementoCotizacion[]
  onAgregar: () => void
  onEliminar: (index: number) => void
}

function PasoElementos({ elementos, onAgregar, onEliminar }: PasoElementosProps) {
  return (
    <div className="space-y-4">
      {elementos.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p className="text-white/50 mb-4">No hay elementos agregados</p>
          <p className="text-sm text-white/30">Comienza agregando ventanas, puertas o mamparas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {elementos.map((elem, index) => (
            <div 
              key={elem.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{elem.tipo_nombre}</p>
                  <p className="text-sm text-white/50">{elem.ubicacion}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                    <span>{elem.ancho}x{elem.alto}cm</span>
                    <span>x{elem.cantidad}</span>
                    <span>{elem.sistema}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">RD${formatearMonto(elem.precio_total)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <button className="p-1.5 text-white/40 hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEliminar(index)}
                      className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={onAgregar}
        className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Agregar Elemento
      </button>
    </div>
  )
}

// ============ PASO 3: REVISION ============

interface PasoRevisionProps {
  cotizacion: typeof import('@/lib/app-context').useApp extends () => infer R ? R['cotizacionActual'] : never
  elementos: ElementoCotizacion[]
  totales: ReturnType<typeof calcularTotalesCotizacion>
  onCambiarInstalacion: (v: boolean) => void
  onCambiarDescuento: (v: number) => void
}

function PasoRevision({ cotizacion, elementos, totales, onCambiarInstalacion, onCambiarDescuento }: PasoRevisionProps) {
  return (
    <div className="space-y-4">
      {/* Resumen cliente */}
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-sm text-white/50 mb-1">Cliente</p>
        <p className="font-medium text-white">{cotizacion?.cliente?.nombre}</p>
        <p className="text-sm text-white/70">{cotizacion?.proyecto}</p>
      </div>
      
      {/* Resumen elementos */}
      <div className="p-4 rounded-xl bg-white/5">
        <p className="text-sm text-white/50 mb-2">Elementos ({elementos.length})</p>
        <div className="space-y-2">
          {elementos.map((elem, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/70">
                {elem.cantidad}x {elem.tipo_nombre} - {elem.ubicacion}
              </span>
              <span className="text-white">RD${formatearMonto(elem.precio_total)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Opciones */}
      <div className="space-y-3">
        <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 cursor-pointer">
          <span className="text-white">Incluir instalacion</span>
          <input
            type="checkbox"
            checked={cotizacion?.instalacion_incluida ?? true}
            onChange={e => onCambiarInstalacion(e.target.checked)}
            className="w-5 h-5 rounded accent-orange-500"
          />
        </label>
        
        <div className="p-4 rounded-xl bg-white/5">
          <label className="block text-sm text-white/50 mb-2">Descuento adicional (%)</label>
          <input
            type="number"
            value={cotizacion?.descuento_porcentaje ?? 0}
            onChange={e => onCambiarDescuento(Number(e.target.value))}
            min={0}
            max={15}
            className="input-dark w-full"
          />
        </div>
      </div>
      
      {/* Totales */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Subtotal materiales</span>
          <span className="text-white">RD${formatearMonto(totales.subtotal_materiales)}</span>
        </div>
        {cotizacion?.instalacion_incluida && (
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Instalacion</span>
            <span className="text-white">RD${formatearMonto(totales.instalacion)}</span>
          </div>
        )}
        {totales.descuento > 0 && (
          <div className="flex justify-between text-sm text-red-400">
            <span>Descuento ({totales.descuento_porcentaje}%)</span>
            <span>-RD${formatearMonto(totales.descuento)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/70">ITBIS (18%)</span>
          <span className="text-white">RD${formatearMonto(totales.itbis)}</span>
        </div>
        <div className="pt-2 border-t border-white/20 flex justify-between">
          <span className="font-semibold text-white">TOTAL</span>
          <span className="text-xl font-bold gradient-text">RD${formatearMonto(totales.total)}</span>
        </div>
      </div>
    </div>
  )
}

// ============ MODAL AGREGAR ELEMENTO ============

interface AgregarElementoModalProps {
  onClose: () => void
  onAgregar: (elemento: ElementoCotizacion) => void
}

function AgregarElementoModal({ onClose, onAgregar }: AgregarElementoModalProps) {
  const [categoria, setCategoria] = useState('ventanas')
  const [tipo, setTipo] = useState<TipoProducto>('ventana_corrediza_2h')
  const [config, setConfig] = useState({
    ubicacion: '',
    ancho: 150,
    alto: 120,
    cantidad: 1,
    sistema: 'Serie 400',
    color_perfil: 'Blanco',
    vidrio_tipo: '6mm templado'
  })
  
  const producto = PRODUCTOS[tipo]
  const productos = getProductosPorCategoria(categoria)
  
  const calculo = calcularElemento(tipo, config.ancho, config.alto, config.sistema)
  const precio = calcularPrecioElemento(tipo, calculo, config.sistema, config.vidrio_tipo, config.cantidad)
  
  const handleAgregar = () => {
    if (!config.ubicacion) return
    
    const elemento: ElementoCotizacion = {
      id: Date.now().toString(),
      tipo,
      tipo_nombre: producto.nombre,
      ubicacion: config.ubicacion,
      ancho: config.ancho,
      alto: config.alto,
      cantidad: config.cantidad,
      sistema: config.sistema,
      color_perfil: config.color_perfil,
      vidrio_tipo: config.vidrio_tipo,
      calculo,
      precio_unitario: precio.unitario,
      precio_total: precio.total
    }
    
    onAgregar(elemento)
  }
  
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-[#0B0E14] sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Agregar Elemento</h3>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(CATEGORIAS).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  setCategoria(key)
                  const prods = getProductosPorCategoria(key)
                  if (prods.length > 0) setTipo(prods[0][0])
                }}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm whitespace-nowrap',
                  categoria === key 
                    ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white'
                    : 'bg-white/5 text-white/70'
                )}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
          
          {/* Tipo */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as TipoProducto)}
              className="input-dark w-full"
            >
              {productos.map(([key, prod]) => (
                <option key={key} value={key}>{prod.nombre}</option>
              ))}
            </select>
          </div>
          
          {/* Ubicacion */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Ubicacion *</label>
            <input
              type="text"
              value={config.ubicacion}
              onChange={e => setConfig(p => ({ ...p, ubicacion: e.target.value }))}
              placeholder="Ej: Sala principal, Habitacion 1..."
              className="input-dark w-full"
            />
          </div>
          
          {/* Medidas */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-2">Ancho (cm)</label>
              <input
                type="number"
                value={config.ancho}
                onChange={e => setConfig(p => ({ ...p, ancho: Number(e.target.value) }))}
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Alto (cm)</label>
              <input
                type="number"
                value={config.alto}
                onChange={e => setConfig(p => ({ ...p, alto: Number(e.target.value) }))}
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Cantidad</label>
              <input
                type="number"
                value={config.cantidad}
                onChange={e => setConfig(p => ({ ...p, cantidad: Number(e.target.value) }))}
                min={1}
                className="input-dark w-full"
              />
            </div>
          </div>
          
          {/* Sistema y vidrio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-2">Sistema</label>
              <select
                value={config.sistema}
                onChange={e => setConfig(p => ({ ...p, sistema: e.target.value }))}
                className="input-dark w-full"
              >
                {producto.sistemas.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {producto.vidrios.length > 0 && (
              <div>
                <label className="block text-sm text-white/50 mb-2">Vidrio</label>
                <select
                  value={config.vidrio_tipo}
                  onChange={e => setConfig(p => ({ ...p, vidrio_tipo: e.target.value }))}
                  className="input-dark w-full"
                >
                  {producto.vidrios.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Preview precio */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white/50">
                  {calculo.medidas.m2.toFixed(2)} m2 x {config.cantidad}
                </p>
                <p className="text-2xl font-bold gradient-text">
                  RD${formatearMonto(precio.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleAgregar}
            disabled={!config.ubicacion}
            className="btn-gradient w-full disabled:opacity-50"
          >
            Agregar Elemento
          </button>
        </div>
      </div>
    </div>
  )
}
