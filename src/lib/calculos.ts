import type { CalculoElemento, ListaCorte, OptimizacionBarras, TipoProducto } from './types'

// ============ CALCULADORA VENTANA CORREDIZA 2 HOJAS ============

export function calcularVentanaCorrediza2H(
  anchoTotal: number, 
  altoTotal: number, 
  sistema = 'Serie 400'
): CalculoElemento {
  const AT = anchoTotal
  const ALT = altoTotal
  
  // MARCO EXTERIOR
  const marco = {
    superior: { longitud: AT, cantidad: 1, descripcion: 'Marco superior' },
    inferior: { longitud: AT, cantidad: 1, descripcion: 'Marco inferior con riel' },
    lateral_izq: { longitud: ALT - 5, cantidad: 1, descripcion: 'Jamba izquierda' },
    lateral_der: { longitud: ALT - 5, cantidad: 1, descripcion: 'Jamba derecha' }
  }
  
  // HOJAS MOVILES (2 hojas)
  const anchoHoja = (AT / 2) + 4 // +4cm solape central
  const altoHoja = ALT - 7.5 // Descuenta rieles y holguras
  
  const hojasMoviles = {
    hoja_1: {
      vertical_izq: { longitud: altoHoja, cantidad: 1 },
      vertical_der: { longitud: altoHoja, cantidad: 1 },
      horizontal_sup: { longitud: anchoHoja - 10, cantidad: 1 },
      horizontal_inf: { longitud: anchoHoja - 10, cantidad: 1 }
    },
    hoja_2: {
      vertical_izq: { longitud: altoHoja, cantidad: 1 },
      vertical_der: { longitud: altoHoja, cantidad: 1 },
      horizontal_sup: { longitud: anchoHoja - 10, cantidad: 1 },
      horizontal_inf: { longitud: anchoHoja - 10, cantidad: 1 }
    }
  }
  
  // VIDRIO (por hoja)
  const anchoVidrio = (anchoHoja - 10) - 1 // Holgura
  const altoVidrio = (altoHoja - 10) - 1
  const m2PorHoja = (anchoVidrio / 100) * (altoVidrio / 100)
  
  const vidrios = {
    hoja_1: { ancho: anchoVidrio, alto: altoVidrio, m2: m2PorHoja },
    hoja_2: { ancho: anchoVidrio, alto: altoVidrio, m2: m2PorHoja }
  }
  
  // FELPA (metros lineales)
  const perimetroHoja = 2 * (anchoHoja + altoHoja)
  const felpaTotal = (perimetroHoja * 2) / 100 // 2 hojas, convertir a metros
  
  // ACCESORIOS
  const accesorios = {
    rodamientos: { cantidad: 8, descripcion: '4 por hoja movil' },
    cerradura: { cantidad: 1, descripcion: 'Cerradura tipo gancho' },
    felpa: { cantidad: Math.ceil(felpaTotal), unidad: 'metros' },
    tornillos: { cantidad: 24, descripcion: 'Tornillos #8 x 3/4"' },
    silicon: { cantidad: 1, descripcion: 'Tubo de silicon' }
  }
  
  // LISTA DE CORTES (para taller)
  const listaCortes: ListaCorte[] = [
    { pieza: 'Marco superior', longitud: AT, cantidad: 1, perfil: `${sistema} - Marco` },
    { pieza: 'Marco inferior', longitud: AT, cantidad: 1, perfil: `${sistema} - Marco con riel` },
    { pieza: 'Jamba lateral', longitud: ALT - 5, cantidad: 2, perfil: `${sistema} - Marco` },
    { pieza: 'Vertical hoja', longitud: altoHoja, cantidad: 4, perfil: `${sistema} - Hoja vertical` },
    { pieza: 'Horizontal hoja', longitud: anchoHoja - 10, cantidad: 4, perfil: `${sistema} - Hoja horizontal` }
  ]
  
  // OPTIMIZACION DE BARRAS (6 metros = 600cm)
  const optimizacionBarras = optimizarCortes(listaCortes, 600)
  
  return {
    medidas: { ancho: AT, alto: ALT, m2: (AT * ALT) / 10000 },
    marco,
    hojasMoviles,
    vidrios,
    accesorios,
    listaCortes,
    optimizacionBarras,
    totalMetrosPerfil: calcularTotalMetros(listaCortes),
    totalM2Vidrio: m2PorHoja * 2
  }
}

// ============ CALCULADORA VENTANA FIJA ============

export function calcularVentanaFija(
  anchoTotal: number,
  altoTotal: number,
  sistema = 'Serie 400'
): CalculoElemento {
  const AT = anchoTotal
  const ALT = altoTotal
  
  const marco = {
    superior: { longitud: AT, cantidad: 1, descripcion: 'Marco superior' },
    inferior: { longitud: AT, cantidad: 1, descripcion: 'Marco inferior' },
    lateral_izq: { longitud: ALT - 5, cantidad: 1, descripcion: 'Marco lateral izquierdo' },
    lateral_der: { longitud: ALT - 5, cantidad: 1, descripcion: 'Marco lateral derecho' }
  }
  
  const anchoVidrio = AT - 6
  const altoVidrio = ALT - 6
  const m2Vidrio = (anchoVidrio / 100) * (altoVidrio / 100)
  
  const vidrios = {
    vidrio_principal: { ancho: anchoVidrio, alto: altoVidrio, m2: m2Vidrio }
  }
  
  const accesorios = {
    silicon_estructural: { cantidad: 2, descripcion: 'Tubos de silicon estructural' },
    tacos_apoyo: { cantidad: 4, descripcion: 'Tacos de apoyo para vidrio' },
    tornillos: { cantidad: 16, descripcion: 'Tornillos #8 x 3/4"' }
  }
  
  const listaCortes: ListaCorte[] = [
    { pieza: 'Marco superior', longitud: AT, cantidad: 1, perfil: `${sistema} - Marco` },
    { pieza: 'Marco inferior', longitud: AT, cantidad: 1, perfil: `${sistema} - Marco` },
    { pieza: 'Marco lateral', longitud: ALT - 5, cantidad: 2, perfil: `${sistema} - Marco` }
  ]
  
  const optimizacionBarras = optimizarCortes(listaCortes, 600)
  
  return {
    medidas: { ancho: AT, alto: ALT, m2: (AT * ALT) / 10000 },
    marco,
    vidrios,
    accesorios,
    listaCortes,
    optimizacionBarras,
    totalMetrosPerfil: calcularTotalMetros(listaCortes),
    totalM2Vidrio: m2Vidrio
  }
}

// ============ CALCULADORA PUERTA CORREDIZA 2 HOJAS ============

export function calcularPuertaCorrediza2H(
  anchoTotal: number,
  altoTotal: number,
  sistema = 'Serie 600'
): CalculoElemento {
  const AT = anchoTotal
  const ALT = altoTotal
  
  const marco = {
    superior: { longitud: AT, cantidad: 1, descripcion: 'Marco superior reforzado' },
    inferior: { longitud: AT, cantidad: 1, descripcion: 'Marco inferior con riel heavy duty' },
    lateral_izq: { longitud: ALT - 6, cantidad: 1, descripcion: 'Jamba izquierda' },
    lateral_der: { longitud: ALT - 6, cantidad: 1, descripcion: 'Jamba derecha' }
  }
  
  const anchoHoja = (AT / 2) + 5
  const altoHoja = ALT - 9
  
  const hojasMoviles = {
    hoja_1: {
      vertical_izq: { longitud: altoHoja, cantidad: 1 },
      vertical_der: { longitud: altoHoja, cantidad: 1 },
      horizontal_sup: { longitud: anchoHoja - 12, cantidad: 1 },
      horizontal_inf: { longitud: anchoHoja - 12, cantidad: 1 }
    },
    hoja_2: {
      vertical_izq: { longitud: altoHoja, cantidad: 1 },
      vertical_der: { longitud: altoHoja, cantidad: 1 },
      horizontal_sup: { longitud: anchoHoja - 12, cantidad: 1 },
      horizontal_inf: { longitud: anchoHoja - 12, cantidad: 1 }
    }
  }
  
  const anchoVidrio = (anchoHoja - 12) - 1
  const altoVidrio = (altoHoja - 12) - 1
  const m2PorHoja = (anchoVidrio / 100) * (altoVidrio / 100)
  
  const vidrios = {
    hoja_1: { ancho: anchoVidrio, alto: altoVidrio, m2: m2PorHoja },
    hoja_2: { ancho: anchoVidrio, alto: altoVidrio, m2: m2PorHoja }
  }
  
  const perimetroHoja = 2 * (anchoHoja + altoHoja)
  const felpaTotal = (perimetroHoja * 2) / 100
  
  const accesorios = {
    rodamientos_heavy: { cantidad: 8, descripcion: 'Rodamientos heavy duty' },
    cerradura_embutir: { cantidad: 1, descripcion: 'Cerradura embutir con llave' },
    jaladores: { cantidad: 4, descripcion: 'Jaladores de puerta' },
    felpa: { cantidad: Math.ceil(felpaTotal), unidad: 'metros' },
    tope_inferior: { cantidad: 2, descripcion: 'Topes de seguridad' },
    tornillos: { cantidad: 32, descripcion: 'Tornillos #10 x 1"' },
    silicon: { cantidad: 2, descripcion: 'Tubos de silicon' }
  }
  
  const listaCortes: ListaCorte[] = [
    { pieza: 'Marco superior', longitud: AT, cantidad: 1, perfil: `${sistema} - Marco reforzado` },
    { pieza: 'Marco inferior', longitud: AT, cantidad: 1, perfil: `${sistema} - Marco con riel HD` },
    { pieza: 'Jamba lateral', longitud: ALT - 6, cantidad: 2, perfil: `${sistema} - Marco reforzado` },
    { pieza: 'Vertical hoja', longitud: altoHoja, cantidad: 4, perfil: `${sistema} - Hoja vertical` },
    { pieza: 'Horizontal hoja', longitud: anchoHoja - 12, cantidad: 4, perfil: `${sistema} - Hoja horizontal` }
  ]
  
  const optimizacionBarras = optimizarCortes(listaCortes, 600)
  
  return {
    medidas: { ancho: AT, alto: ALT, m2: (AT * ALT) / 10000 },
    marco,
    hojasMoviles,
    vidrios,
    accesorios,
    listaCortes,
    optimizacionBarras,
    totalMetrosPerfil: calcularTotalMetros(listaCortes),
    totalM2Vidrio: m2PorHoja * 2
  }
}

// ============ CALCULADORA MAMPARA BANO ============

export function calcularMamparaBano(
  anchoTotal: number,
  altoTotal: number,
  sistema = 'Estandar cromado'
): CalculoElemento {
  const AT = anchoTotal
  const ALT = altoTotal
  
  const marco = {
    riel_superior: { longitud: AT, cantidad: 1, descripcion: 'Riel superior cromado' },
    riel_inferior: { longitud: AT, cantidad: 1, descripcion: 'Riel inferior con drenaje' },
    perfil_pared_izq: { longitud: ALT - 3, cantidad: 1, descripcion: 'Perfil de pared' },
    perfil_pared_der: { longitud: ALT - 3, cantidad: 1, descripcion: 'Perfil de pared' }
  }
  
  const anchoHoja = (AT / 2) + 3
  const altoHoja = ALT - 5
  
  const hojasMoviles = {
    hoja_fija: {
      vertical_izq: { longitud: altoHoja, cantidad: 1 },
      vertical_der: { longitud: altoHoja, cantidad: 1 }
    },
    hoja_movil: {
      vertical_izq: { longitud: altoHoja, cantidad: 1 },
      vertical_der: { longitud: altoHoja, cantidad: 1 }
    }
  }
  
  const anchoVidrio = anchoHoja - 4
  const altoVidrio = altoHoja - 2
  const m2PorHoja = (anchoVidrio / 100) * (altoVidrio / 100)
  
  const vidrios = {
    hoja_fija: { ancho: anchoVidrio, alto: altoVidrio, m2: m2PorHoja },
    hoja_movil: { ancho: anchoVidrio, alto: altoVidrio, m2: m2PorHoja }
  }
  
  const accesorios = {
    rodamientos_inox: { cantidad: 4, descripcion: 'Rodamientos inoxidables' },
    jalador: { cantidad: 1, descripcion: 'Jalador cromado' },
    sello_inferior: { cantidad: Math.ceil(AT / 100), unidad: 'metros' },
    sello_lateral: { cantidad: Math.ceil((ALT * 2) / 100), unidad: 'metros' },
    tornillos_inox: { cantidad: 16, descripcion: 'Tornillos inoxidables' },
    silicon_transparente: { cantidad: 1, descripcion: 'Silicon transparente antimoho' }
  }
  
  const listaCortes: ListaCorte[] = [
    { pieza: 'Riel superior', longitud: AT, cantidad: 1, perfil: `${sistema} - Riel` },
    { pieza: 'Riel inferior', longitud: AT, cantidad: 1, perfil: `${sistema} - Riel drenaje` },
    { pieza: 'Perfil pared', longitud: ALT - 3, cantidad: 2, perfil: `${sistema} - Perfil U` },
    { pieza: 'Perfil vertical hoja', longitud: altoHoja, cantidad: 4, perfil: `${sistema} - Perfil H` }
  ]
  
  const optimizacionBarras = optimizarCortes(listaCortes, 600)
  
  return {
    medidas: { ancho: AT, alto: ALT, m2: (AT * ALT) / 10000 },
    marco,
    hojasMoviles,
    vidrios,
    accesorios,
    listaCortes,
    optimizacionBarras,
    totalMetrosPerfil: calcularTotalMetros(listaCortes),
    totalM2Vidrio: m2PorHoja * 2
  }
}

// ============ FUNCION GENERICA DE CALCULO ============

export function calcularElemento(
  tipo: TipoProducto,
  ancho: number,
  alto: number,
  sistema: string
): CalculoElemento {
  switch (tipo) {
    case 'ventana_corrediza_2h':
      return calcularVentanaCorrediza2H(ancho, alto, sistema)
    case 'ventana_fija':
      return calcularVentanaFija(ancho, alto, sistema)
    case 'puerta_corrediza_2h':
      return calcularPuertaCorrediza2H(ancho, alto, sistema)
    case 'mampara_corrediza':
      return calcularMamparaBano(ancho, alto, sistema)
    default:
      // Para otros tipos, usar calculo generico basado en ventana fija
      return calcularVentanaFija(ancho, alto, sistema)
  }
}

// ============ OPTIMIZACION DE CORTES ============

export function optimizarCortes(listaPiezas: ListaCorte[], longitudBarra = 600): OptimizacionBarras {
  // Expandir piezas por cantidad
  const piezasExpandidas = listaPiezas.flatMap(p => 
    Array(p.cantidad).fill(null).map(() => ({ ...p, cantidad: 1 }))
  )
  
  // Ordenar de mayor a menor
  const piezasOrdenadas = [...piezasExpandidas].sort((a, b) => b.longitud - a.longitud)
  
  const barras: { numero: number; piezas: ListaCorte[]; desperdicio: number }[] = []
  let barraActual = { numero: 1, piezas: [] as ListaCorte[], desperdicio: longitudBarra }
  
  for (const pieza of piezasOrdenadas) {
    if (pieza.longitud <= barraActual.desperdicio) {
      barraActual.piezas.push(pieza)
      barraActual.desperdicio -= pieza.longitud
    } else {
      if (barraActual.piezas.length > 0) {
        barras.push(barraActual)
      }
      barraActual = {
        numero: barras.length + 1,
        piezas: [pieza],
        desperdicio: longitudBarra - pieza.longitud
      }
    }
  }
  
  if (barraActual.piezas.length > 0) {
    barras.push(barraActual)
  }
  
  const totalDesperdicio = barras.reduce((sum, b) => sum + b.desperdicio, 0)
  const desperdicioPromedio = barras.length > 0 ? totalDesperdicio / barras.length : 0
  const eficiencia = barras.length > 0 
    ? ((1 - totalDesperdicio / (barras.length * longitudBarra)) * 100)
    : 0
  
  return {
    barras,
    totalBarras: barras.length,
    totalDesperdicio: totalDesperdicio.toFixed(1),
    desperdicioPromedio: desperdicioPromedio.toFixed(1),
    eficiencia: eficiencia.toFixed(1) + '%'
  }
}

// ============ HELPERS ============

function calcularTotalMetros(listaCortes: ListaCorte[]): number {
  return listaCortes.reduce((total, corte) => {
    return total + (corte.longitud * corte.cantidad) / 100
  }, 0)
}
