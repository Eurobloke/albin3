import type { 
  ApiResponse, 
  Cliente, 
  Cotizacion, 
  Pago, 
  EventoCalendario, 
  FotoGaleria,
  ConfiguracionEmpresa,
  DashboardStats
} from './types'

// URL del Web App de Google Apps Script
// IMPORTANTE: Cambiar esta URL por la de tu implementación de GAS
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'

// En desarrollo puedes usar un proxy, en producción usa directamente GAS
const API_URL = import.meta.env.DEV ? '/api/gas' : GAS_WEB_APP_URL

// ============ CLIENTE HTTP ============

async function fetchApi<T>(
  action: string, 
  _method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    // En producción (GitHub Pages), hacer llamada directa a GAS con CORS
    const url = import.meta.env.DEV ? API_URL : `${API_URL}?action=${action}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...body }),
      mode: import.meta.env.DEV ? 'cors' : 'no-cors', // no-cors para GAS en producción
    })
    
    const data = await response.json()
    return data as ApiResponse<T>
  } catch (error) {
    console.error(`Error en API (${action}):`, error)
    return { success: false, error: 'Error de conexion con el servidor' }
  }
}

// ============ COTIZACIONES ============

export async function getCotizaciones(filtros?: {
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
  vendedor_id?: string
}): Promise<ApiResponse<Cotizacion[]>> {
  return fetchApi<Cotizacion[]>('getCotizaciones', 'POST', filtros)
}

export async function getCotizacion(id: string): Promise<ApiResponse<Cotizacion>> {
  return fetchApi<Cotizacion>('getCotizacion', 'POST', { id })
}

export async function guardarCotizacion(cotizacion: Partial<Cotizacion>): Promise<ApiResponse<Cotizacion>> {
  return fetchApi<Cotizacion>('guardarCotizacion', 'POST', cotizacion as Record<string, unknown>)
}

export async function eliminarCotizacion(id: string): Promise<ApiResponse<boolean>> {
  return fetchApi<boolean>('eliminarCotizacion', 'POST', { id })
}

export async function cambiarEstadoCotizacion(
  id: string, 
  estado: string
): Promise<ApiResponse<Cotizacion>> {
  return fetchApi<Cotizacion>('cambiarEstadoCotizacion', 'POST', { id, estado })
}

// ============ CLIENTES ============

export async function getClientes(): Promise<ApiResponse<Cliente[]>> {
  return fetchApi<Cliente[]>('getClientes')
}

export async function getCliente(id: string): Promise<ApiResponse<Cliente>> {
  return fetchApi<Cliente>('getCliente', 'POST', { id })
}

export async function guardarCliente(cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
  return fetchApi<Cliente>('guardarCliente', 'POST', cliente as Record<string, unknown>)
}

export async function buscarClientes(query: string): Promise<ApiResponse<Cliente[]>> {
  return fetchApi<Cliente[]>('buscarClientes', 'POST', { query })
}

// ============ PAGOS ============

export async function getPagos(cotizacionId?: string): Promise<ApiResponse<Pago[]>> {
  return fetchApi<Pago[]>('getPagos', 'POST', { cotizacion_id: cotizacionId })
}

export async function guardarPago(pago: Partial<Pago>): Promise<ApiResponse<Pago>> {
  return fetchApi<Pago>('guardarPago', 'POST', pago as Record<string, unknown>)
}

export async function getPagosPendientes(): Promise<ApiResponse<{
  cotizacion_id: string
  numero: string
  cliente: string
  total: number
  pagado: number
  pendiente: number
}[]>> {
  return fetchApi('getPagosPendientes')
}

// ============ CALENDARIO ============

export async function getEventosCalendario(
  fechaDesde: string, 
  fechaHasta: string
): Promise<ApiResponse<EventoCalendario[]>> {
  return fetchApi<EventoCalendario[]>('getEventos', 'POST', { 
    fecha_desde: fechaDesde, 
    fecha_hasta: fechaHasta 
  })
}

export async function guardarEvento(evento: Partial<EventoCalendario>): Promise<ApiResponse<EventoCalendario>> {
  return fetchApi<EventoCalendario>('guardarEvento', 'POST', evento as Record<string, unknown>)
}

export async function actualizarEstadoEvento(
  id: string, 
  estado: string
): Promise<ApiResponse<EventoCalendario>> {
  return fetchApi<EventoCalendario>('actualizarEstadoEvento', 'POST', { id, estado })
}

// ============ GALERIA ============

export async function getFotosGaleria(cotizacionId?: string): Promise<ApiResponse<FotoGaleria[]>> {
  return fetchApi<FotoGaleria[]>('getGaleria', 'POST', { cotizacion_id: cotizacionId })
}

export async function subirFoto(foto: {
  cotizacion_id?: string
  proyecto_nombre: string
  tipo_foto: string
  imagen_base64: string
  descripcion?: string
}): Promise<ApiResponse<FotoGaleria>> {
  return fetchApi<FotoGaleria>('subirFoto', 'POST', foto)
}

// ============ CONFIGURACION ============

export async function getConfiguracionEmpresa(): Promise<ApiResponse<ConfiguracionEmpresa>> {
  return fetchApi<ConfiguracionEmpresa>('getConfig')
}

export async function guardarConfiguracionEmpresa(
  config: Partial<ConfiguracionEmpresa>
): Promise<ApiResponse<ConfiguracionEmpresa>> {
  return fetchApi<ConfiguracionEmpresa>('guardarConfig', 'POST', config as Record<string, unknown>)
}

// ============ STATS ============

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return fetchApi<DashboardStats>('getStats')
}

// ============ PDF & EMAIL ============

export async function generarPDF(cotizacionId: string): Promise<ApiResponse<{ url: string }>> {
  return fetchApi<{ url: string }>('generarPDF', 'POST', { id: cotizacionId })
}

export async function enviarEmail(
  cotizacionId: string, 
  email: string, 
  mensaje?: string
): Promise<ApiResponse<boolean>> {
  return fetchApi<boolean>('enviarEmail', 'POST', { id: cotizacionId, email, mensaje })
}

export async function prepararWhatsApp(cotizacionId: string): Promise<ApiResponse<{ 
  telefono: string
  mensaje: string
  url: string
}>> {
  return fetchApi('enviarWhatsApp', 'POST', { id: cotizacionId })
}


