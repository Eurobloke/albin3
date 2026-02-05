import type { CalculoElemento, ConfiguracionPrecios, TipoCliente, TipoProducto } from './types'

export const CONFIGURACION_PRECIOS: ConfiguracionPrecios = {
  modo_calculo: 'metro_lineal',
  
  precios_metro_lineal: {
    perfiles: {
      'serie_300_marco': { precio: 380, descripcion: 'Marco Serie 300' },
      'serie_300_hoja': { precio: 320, descripcion: 'Hoja Serie 300' },
      'serie_400_marco': { precio: 450, descripcion: 'Marco Serie 400' },
      'serie_400_hoja': { precio: 380, descripcion: 'Hoja Serie 400' },
      'serie_600_marco': { precio: 580, descripcion: 'Marco Serie 600 Premium' },
      'serie_600_hoja': { precio: 520, descripcion: 'Hoja Serie 600 Premium' },
      'serie_450_marco': { precio: 520, descripcion: 'Marco Serie 450 Puertas' },
      'serie_450_hoja': { precio: 450, descripcion: 'Hoja Serie 450 Puertas' },
      'serie_700_marco': { precio: 680, descripcion: 'Marco Serie 700 Premium' },
      'serie_700_hoja': { precio: 620, descripcion: 'Hoja Serie 700 Premium' },
      'mampara_estandar': { precio: 420, descripcion: 'Perfil mampara estandar' },
      'mampara_premium': { precio: 580, descripcion: 'Perfil mampara premium' }
    },
    
    vidrios: {
      '4mm_transparente': { precio_m2: 450 },
      '6mm_transparente': { precio_m2: 650 },
      '6mm_templado': { precio_m2: 1100 },
      '8mm_templado': { precio_m2: 1400 },
      '6mm_bronce': { precio_m2: 750 },
      '8mm_reflectivo': { precio_m2: 1250 },
      '10mm_templado': { precio_m2: 1800 },
      '8mm_laminado': { precio_m2: 1600 },
      '6mm_templado_transparente': { precio_m2: 1100 },
      '6mm_templado_esmerilado': { precio_m2: 1200 }
    },
    
    accesorios: {
      'rodamiento_estandar': { precio: 85, unidad: 'unidad' },
      'rodamiento_reforzado': { precio: 135, unidad: 'unidad' },
      'rodamiento_heavy_duty': { precio: 185, unidad: 'unidad' },
      'rodamiento_inox': { precio: 220, unidad: 'unidad' },
      'cerradura_gancho': { precio: 120, unidad: 'unidad' },
      'cerradura_embutir': { precio: 450, unidad: 'unidad' },
      'felpa_metro': { precio: 35, unidad: 'metro' },
      'silicon_tubo': { precio: 180, unidad: 'tubo' },
      'silicon_transparente': { precio: 220, unidad: 'tubo' },
      'bisagra_estandar': { precio: 95, unidad: 'unidad' },
      'bisagra_heavy_duty': { precio: 180, unidad: 'unidad' },
      'bisagra_inox': { precio: 280, unidad: 'unidad' },
      'jalador_estandar': { precio: 85, unidad: 'unidad' },
      'jalador_cromado': { precio: 150, unidad: 'unidad' },
      'brazo_proyeccion': { precio: 320, unidad: 'unidad' },
      'cierra_puertas': { precio: 850, unidad: 'unidad' },
      'manija_llave': { precio: 380, unidad: 'unidad' },
      'sello_inferior': { precio: 45, unidad: 'metro' },
      'sello_lateral': { precio: 35, unidad: 'metro' },
      'tope_seguridad': { precio: 65, unidad: 'unidad' }
    }
  },
  
  precios_m2_completo: {
    'ventana_corrediza_serie300': { precio_m2: 4500, incluye: 'Perfiles, vidrio 6mm, accesorios estandar' },
    'ventana_corrediza_serie400': { precio_m2: 5800, incluye: 'Perfiles, vidrio 6mm templado, accesorios premium' },
    'ventana_corrediza_serie600': { precio_m2: 7200, incluye: 'Perfiles premium, vidrio 8mm reflectivo, accesorios premium' },
    'ventana_fija_serie400': { precio_m2: 4200, incluye: 'Perfiles, vidrio 6mm templado' },
    'puerta_corrediza_serie450': { precio_m2: 6800, incluye: 'Perfiles reforzados, vidrio 8mm templado' },
    'puerta_corrediza_serie600': { precio_m2: 8500, incluye: 'Perfiles premium, vidrio 10mm templado' },
    'mampara_bano_estandar': { precio_m2: 5500, incluye: 'Perfiles cromados, vidrio 6mm templado' },
    'mampara_bano_premium': { precio_m2: 7500, incluye: 'Perfiles inox, vidrio 8mm templado' }
  },
  
  margenes: {
    perfiles: 40,
    vidrios: 35,
    accesorios: 45,
    instalacion: 100
  },
  
  instalacion: {
    modo: 'm2',
    precio_m2: 800,
    minimo_cobro: 2500
  },
  
  itbis: {
    activo: true,
    porcentaje: 18,
    aplicar_sobre: 'subtotal'
  },
  
  descuentos: {
    volumen: [
      { desde_m2: 0, hasta_m2: 10, descuento: 0 },
      { desde_m2: 10, hasta_m2: 30, descuento: 3 },
      { desde_m2: 30, hasta_m2: 50, descuento: 5 },
      { desde_m2: 50, hasta_m2: 999, descuento: 8 }
    ],
    pronto_pago: { activo: true, porcentaje: 3, condicion: '100% anticipado' }
  },
  
  tipos_cliente: {
    retail: { multiplicador: 1.0, descuento_max: 10 },
    constructor: { multiplicador: 0.85, descuento_max: 15 },
    mayorista: { multiplicador: 0.75, descuento_max: 5 }
  }
}

// ============ CALCULAR PRECIO ELEMENTO ============

export interface PrecioElemento {
  subtotal_perfiles: number
  subtotal_vidrios: number
  subtotal_accesorios: number
  unitario: number
  total: number
  desglose: PrecioDesglose[]
}

export interface PrecioDesglose {
  concepto: string
  cantidad: number
  unidad: string
  precio_unitario: number
  subtotal: number
}

export function calcularPrecioElemento(
  tipo: TipoProducto,
  calculo: CalculoElemento,
  sistema: string,
  vidrioTipo: string,
  cantidad: number,
  tipoCliente: TipoCliente = 'retail',
  modoCalculo = CONFIGURACION_PRECIOS.modo_calculo
): PrecioElemento {
  const config = CONFIGURACION_PRECIOS
  const multiplicador = config.tipos_cliente[tipoCliente].multiplicador
  
  const desglose: PrecioDesglose[] = []
  
  // Calcular perfiles
  const sistemaKey = sistema.toLowerCase().replace(' ', '_')
  const precioMarco = config.precios_metro_lineal.perfiles[`${sistemaKey}_marco`]?.precio || 450
  const precioHoja = config.precios_metro_lineal.perfiles[`${sistemaKey}_hoja`]?.precio || 380
  
  // Metros de marco
  const metrosMarco = Object.values(calculo.marco).reduce((sum, p) => sum + (p.longitud * p.cantidad) / 100, 0)
  const subtotalMarco = metrosMarco * precioMarco * multiplicador
  
  desglose.push({
    concepto: `Perfiles marco ${sistema}`,
    cantidad: Number(metrosMarco.toFixed(2)),
    unidad: 'metros',
    precio_unitario: precioMarco,
    subtotal: subtotalMarco
  })
  
  // Metros de hoja
  let metrosHoja = 0
  if (calculo.hojasMoviles) {
    Object.values(calculo.hojasMoviles).forEach(hoja => {
      Object.values(hoja).forEach(pieza => {
        metrosHoja += (pieza.longitud * pieza.cantidad) / 100
      })
    })
  }
  
  if (metrosHoja > 0) {
    const subtotalHoja = metrosHoja * precioHoja * multiplicador
    desglose.push({
      concepto: `Perfiles hoja ${sistema}`,
      cantidad: Number(metrosHoja.toFixed(2)),
      unidad: 'metros',
      precio_unitario: precioHoja,
      subtotal: subtotalHoja
    })
  }
  
  const subtotalPerfiles = desglose.reduce((sum, d) => sum + d.subtotal, 0)
  
  // Calcular vidrios
  const vidrioKey = vidrioTipo.toLowerCase().replace(/ /g, '_')
  const precioVidrio = config.precios_metro_lineal.vidrios[vidrioKey]?.precio_m2 || 1100
  const subtotalVidrios = calculo.totalM2Vidrio * precioVidrio * multiplicador
  
  desglose.push({
    concepto: `Vidrio ${vidrioTipo}`,
    cantidad: Number(calculo.totalM2Vidrio.toFixed(2)),
    unidad: 'm2',
    precio_unitario: precioVidrio,
    subtotal: subtotalVidrios
  })
  
  // Calcular accesorios
  let subtotalAccesorios = 0
  Object.entries(calculo.accesorios).forEach(([key, acc]) => {
    const accesorioKey = key.replace(/_/g, '_')
    let precio = 0
    
    // Buscar precio aproximado
    if (key.includes('rodamiento')) {
      if (key.includes('heavy')) {
        precio = config.precios_metro_lineal.accesorios['rodamiento_heavy_duty']?.precio || 185
      } else if (key.includes('inox')) {
        precio = config.precios_metro_lineal.accesorios['rodamiento_inox']?.precio || 220
      } else {
        precio = config.precios_metro_lineal.accesorios['rodamiento_estandar']?.precio || 85
      }
    } else if (key.includes('cerradura')) {
      if (key.includes('embutir')) {
        precio = config.precios_metro_lineal.accesorios['cerradura_embutir']?.precio || 450
      } else {
        precio = config.precios_metro_lineal.accesorios['cerradura_gancho']?.precio || 120
      }
    } else if (key.includes('felpa')) {
      precio = config.precios_metro_lineal.accesorios['felpa_metro']?.precio || 35
    } else if (key.includes('silicon')) {
      precio = config.precios_metro_lineal.accesorios['silicon_tubo']?.precio || 180
    } else if (key.includes('jalador')) {
      precio = config.precios_metro_lineal.accesorios['jalador_cromado']?.precio || 150
    } else {
      precio = 50 // Precio por defecto
    }
    
    const subtotalAcc = acc.cantidad * precio * multiplicador
    subtotalAccesorios += subtotalAcc
    
    desglose.push({
      concepto: acc.descripcion || key,
      cantidad: acc.cantidad,
      unidad: acc.unidad || 'unidad',
      precio_unitario: precio,
      subtotal: subtotalAcc
    })
  })
  
  const unitario = subtotalPerfiles + subtotalVidrios + subtotalAccesorios
  
  return {
    subtotal_perfiles: subtotalPerfiles,
    subtotal_vidrios: subtotalVidrios,
    subtotal_accesorios: subtotalAccesorios,
    unitario,
    total: unitario * cantidad,
    desglose
  }
}

// ============ CALCULAR TOTALES COTIZACION ============

export interface TotalesCotizacion {
  subtotal_materiales: number
  instalacion: number
  subtotal_general: number
  descuento_volumen: number
  descuento_porcentaje: number
  descuento: number
  base_imponible: number
  itbis: number
  total: number
  totalM2: number
}

export function calcularTotalesCotizacion(
  elementosTotales: { precio_total: number; m2: number }[],
  incluyeInstalacion: boolean,
  descuentoManual: number,
  tipoCliente: TipoCliente = 'retail'
): TotalesCotizacion {
  const config = CONFIGURACION_PRECIOS
  
  const subtotalMateriales = elementosTotales.reduce((sum, e) => sum + e.precio_total, 0)
  const totalM2 = elementosTotales.reduce((sum, e) => sum + e.m2, 0)
  
  // Instalacion
  let instalacion = 0
  if (incluyeInstalacion) {
    if (config.instalacion.modo === 'm2') {
      instalacion = Math.max(totalM2 * config.instalacion.precio_m2, config.instalacion.minimo_cobro)
    } else {
      instalacion = config.instalacion.minimo_cobro
    }
  }
  
  const subtotalGeneral = subtotalMateriales + instalacion
  
  // Descuento por volumen
  const descuentoVolumen = config.descuentos.volumen.find(
    d => totalM2 >= d.desde_m2 && totalM2 < d.hasta_m2
  )?.descuento || 0
  
  // Descuento total (volumen + manual, limitado por tipo cliente)
  const descuentoMax = config.tipos_cliente[tipoCliente].descuento_max
  const descuentoPorcentaje = Math.min(descuentoVolumen + descuentoManual, descuentoMax)
  const descuento = subtotalGeneral * (descuentoPorcentaje / 100)
  
  const baseImponible = subtotalGeneral - descuento
  
  // ITBIS
  const itbis = config.itbis.activo ? baseImponible * (config.itbis.porcentaje / 100) : 0
  
  const total = baseImponible + itbis
  
  return {
    subtotal_materiales: subtotalMateriales,
    instalacion,
    subtotal_general: subtotalGeneral,
    descuento_volumen: descuentoVolumen,
    descuento_porcentaje: descuentoPorcentaje,
    descuento,
    base_imponible: baseImponible,
    itbis,
    total,
    totalM2
  }
}

// ============ FORMATEO ============

export function formatearMonto(monto: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto)
}

export function formatearMontoCorto(monto: number): string {
  if (monto >= 1000000) {
    return `${(monto / 1000000).toFixed(1)}M`
  }
  if (monto >= 1000) {
    return `${(monto / 1000).toFixed(0)}K`
  }
  return monto.toFixed(0)
}
