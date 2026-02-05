'use client'

import { useState, useEffect } from 'react'
import { PRODUCTOS, COLORES_PERFIL, getProductosPorCategoria, CATEGORIAS } from '@/lib/productos'
import { calcularElemento } from '@/lib/calculos'
import { calcularPrecioElemento, formatearMonto } from '@/lib/precios'
import type { TipoProducto, CalculoElemento } from '@/lib/types'
import { 
  Ruler, 
  Package, 
  Scissors, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalculadoraModule() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>('ventanas')
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoProducto>('ventana_corrediza_2h')
  const [config, setConfig] = useState({
    ancho: 150,
    alto: 120,
    cantidad: 1,
    sistema: 'Serie 400',
    color_perfil: 'Blanco',
    vidrio_tipo: '6mm templado'
  })
  
  const [calculo, setCalculo] = useState<CalculoElemento | null>(null)
  const [precio, setPrecio] = useState<ReturnType<typeof calcularPrecioElemento> | null>(null)
  const [showDesglose, setShowDesglose] = useState(false)
  const [showCortes, setShowCortes] = useState(false)
  
  const productoActual = PRODUCTOS[tipoSeleccionado]
  const productosPorCategoria = getProductosPorCategoria(categoriaActiva)
  
  // Recalcular cuando cambian las medidas
  useEffect(() => {
    const nuevoCalculo = calcularElemento(
      tipoSeleccionado, 
      config.ancho, 
      config.alto, 
      config.sistema
    )
    setCalculo(nuevoCalculo)
    
    const nuevoPrecio = calcularPrecioElemento(
      tipoSeleccionado,
      nuevoCalculo,
      config.sistema,
      config.vidrio_tipo,
      config.cantidad
    )
    setPrecio(nuevoPrecio)
  }, [tipoSeleccionado, config])
  
  const handleCantidadChange = (delta: number) => {
    setConfig(prev => ({
      ...prev,
      cantidad: Math.max(1, Math.min(20, prev.cantidad + delta))
    }))
  }
  
  return (
    <div className="space-y-6">
      {/* Selector de Categoria */}
      <div className="glass-card p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {Object.entries(CATEGORIAS).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => {
                setCategoriaActiva(key)
                const productos = getProductosPorCategoria(key)
                if (productos.length > 0) {
                  setTipoSeleccionado(productos[0][0])
                }
              }}
              className={cn(
                'px-4 py-2 rounded-lg whitespace-nowrap transition-all touch-target',
                categoriaActiva === key
                  ? 'bg-gradient-to-r from-orange-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              )}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selector de Producto */}
      <div className="glass-card p-4">
        <label className="block text-sm text-white/50 mb-2">Tipo de Producto</label>
        <select
          value={tipoSeleccionado}
          onChange={e => setTipoSeleccionado(e.target.value as TipoProducto)}
          className="input-dark w-full"
        >
          {productosPorCategoria.map(([key, producto]) => (
            <option key={key} value={key}>{producto.nombre}</option>
          ))}
        </select>
      </div>
      
      {/* Configuracion */}
      <div className="glass-card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-orange-500" />
          Medidas y Configuracion
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ancho */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Ancho (cm)</label>
            <input
              type="number"
              value={config.ancho}
              onChange={e => setConfig(prev => ({ ...prev, ancho: Number(e.target.value) }))}
              min={40}
              max={600}
              step={5}
              className="input-dark w-full"
            />
          </div>
          
          {/* Alto */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Alto (cm)</label>
            <input
              type="number"
              value={config.alto}
              onChange={e => setConfig(prev => ({ ...prev, alto: Number(e.target.value) }))}
              min={40}
              max={300}
              step={5}
              className="input-dark w-full"
            />
          </div>
          
          {/* Cantidad */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Cantidad</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCantidadChange(-1)}
                className="p-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors touch-target"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={config.cantidad}
                onChange={e => setConfig(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
                min={1}
                max={20}
                className="input-dark w-full text-center"
              />
              <button
                onClick={() => handleCantidadChange(1)}
                className="p-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors touch-target"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Sistema */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Sistema</label>
            <select
              value={config.sistema}
              onChange={e => setConfig(prev => ({ ...prev, sistema: e.target.value }))}
              className="input-dark w-full"
            >
              {productoActual.sistemas.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          {/* Color */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Color Perfil</label>
            <select
              value={config.color_perfil}
              onChange={e => setConfig(prev => ({ ...prev, color_perfil: e.target.value }))}
              className="input-dark w-full"
            >
              {COLORES_PERFIL.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          {/* Vidrio */}
          {productoActual.vidrios.length > 0 && (
            <div>
              <label className="block text-sm text-white/50 mb-2">Vidrio</label>
              <select
                value={config.vidrio_tipo}
                onChange={e => setConfig(prev => ({ ...prev, vidrio_tipo: e.target.value }))}
                className="input-dark w-full"
              >
                {productoActual.vidrios.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Medidas resumen */}
        {calculo && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20">
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">
                  {config.ancho} x {config.alto} cm
                </p>
                <p className="text-sm text-white/50">Medidas</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {calculo.medidas.m2.toFixed(2)} m2
                </p>
                <p className="text-sm text-white/50">Por unidad</p>
              </div>
              {config.cantidad > 1 && (
                <>
                  <div className="w-px h-10 bg-white/20" />
                  <div>
                    <p className="text-2xl font-bold text-blue-500">
                      {(calculo.medidas.m2 * config.cantidad).toFixed(2)} m2
                    </p>
                    <p className="text-sm text-white/50">Total ({config.cantidad} uds)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Resultado del Calculo */}
      {calculo && precio && (
        <>
          {/* Materiales */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Materiales Requeridos
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-white">{calculo.totalMetrosPerfil.toFixed(1)}</p>
                <p className="text-sm text-white/50">Metros de perfil</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-white">{calculo.totalM2Vidrio.toFixed(2)}</p>
                <p className="text-sm text-white/50">M2 de vidrio</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-white">{calculo.accesorios.rodamientos?.cantidad || 0}</p>
                <p className="text-sm text-white/50">Rodamientos</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-white">{calculo.accesorios.felpa?.cantidad || 0}</p>
                <p className="text-sm text-white/50">Metros felpa</p>
              </div>
            </div>
            
            {/* Lista de accesorios */}
            <div className="space-y-2">
              {Object.entries(calculo.accesorios).map(([key, acc]) => (
                <div key={key} className="flex justify-between text-sm py-1 border-b border-white/5">
                  <span className="text-white/70">{acc.descripcion || key}</span>
                  <span className="text-white">{acc.cantidad} {acc.unidad || 'uds'}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Optimizacion de Cortes */}
          <div className="glass-card">
            <button
              onClick={() => setShowCortes(!showCortes)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-purple-500" />
                Optimizacion de Cortes
              </h2>
              {showCortes ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
            </button>
            
            {showCortes && (
              <div className="mt-4 space-y-4">
                {/* Stats de optimizacion */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-xl font-bold text-white">{calculo.optimizacionBarras.totalBarras}</p>
                    <p className="text-xs text-white/50">Barras (6m)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-xl font-bold text-white">{calculo.optimizacionBarras.totalDesperdicio}cm</p>
                    <p className="text-xs text-white/50">Desperdicio</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-xl font-bold text-green-400">{calculo.optimizacionBarras.eficiencia}</p>
                    <p className="text-xs text-white/50">Eficiencia</p>
                  </div>
                </div>
                
                {/* Lista de cortes */}
                <div className="space-y-3">
                  {calculo.listaCortes.map((corte, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{corte.pieza}</p>
                          <p className="text-sm text-white/50">{corte.perfil}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-500">{corte.longitud} cm</p>
                          <p className="text-sm text-white/50">x{corte.cantidad}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Visualizacion de barras */}
                <div className="space-y-2">
                  <p className="text-sm text-white/50">Distribucion en barras:</p>
                  {calculo.optimizacionBarras.barras.map((barra, i) => (
                    <div key={i} className="relative h-8 bg-white/10 rounded overflow-hidden">
                      <div className="absolute inset-y-0 left-0 flex">
                        {barra.piezas.map((pieza, j) => (
                          <div
                            key={j}
                            className="h-full bg-gradient-to-r from-orange-500 to-blue-500 border-r border-white/20 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(pieza.longitud / 600) * 100}%` }}
                          >
                            {pieza.longitud}
                          </div>
                        ))}
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/50">
                        Barra {barra.numero} - Sobrante: {barra.desperdicio.toFixed(0)}cm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Precio */}
          <div className="glass-card">
            <button
              onClick={() => setShowDesglose(!showDesglose)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Precio Estimado
              </h2>
              {showDesglose ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
            </button>
            
            {/* Total destacado */}
            <div className="mt-4 p-6 rounded-xl bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30 text-center">
              <p className="text-sm text-white/50 mb-1">Precio Total</p>
              <p className="text-4xl font-bold gradient-text">
                RD${formatearMonto(precio.total)}
              </p>
              {config.cantidad > 1 && (
                <p className="text-sm text-white/50 mt-2">
                  {config.cantidad} unidades x RD${formatearMonto(precio.unitario)} c/u
                </p>
              )}
            </div>
            
            {/* Resumen rapido */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold text-white">RD${formatearMontoCorto(precio.subtotal_perfiles)}</p>
                <p className="text-xs text-white/50">Perfiles</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold text-white">RD${formatearMontoCorto(precio.subtotal_vidrios)}</p>
                <p className="text-xs text-white/50">Vidrios</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold text-white">RD${formatearMontoCorto(precio.subtotal_accesorios)}</p>
                <p className="text-xs text-white/50">Accesorios</p>
              </div>
            </div>
            
            {/* Desglose completo */}
            {showDesglose && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-white/50 mb-2">Desglose detallado:</p>
                {precio.desglose.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5">
                    <div>
                      <span className="text-white">{item.concepto}</span>
                      <span className="text-white/50 ml-2">
                        ({item.cantidad} {item.unidad} x RD${formatearMonto(item.precio_unitario)})
                      </span>
                    </div>
                    <span className="text-white font-medium">RD${formatearMonto(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function formatearMontoCorto(monto: number): string {
  if (monto >= 1000) {
    return `${(monto / 1000).toFixed(1)}K`
  }
  return monto.toFixed(0)
}
