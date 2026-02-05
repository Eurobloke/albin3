// ============ TIPOS BASE ============

export type EstadoCotizacion = 
  | 'borrador' 
  | 'enviada' 
  | 'vista' 
  | 'aprobada' 
  | 'rechazada' 
  | 'negociando' 
  | 'produccion' 
  | 'instalacion' 
  | 'completada' 
  | 'vencida' 
  | 'cancelada'

export type TipoCliente = 'retail' | 'constructor' | 'mayorista'

export type RolUsuario = 'admin' | 'vendedor' | 'tecnico'

export type TipoPago = 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta'
export type MetodoPago = TipoPago

export type TipoEvento = 'medicion' | 'instalacion' | 'entrega' | 'seguimiento' | 'revision' | 'otro'

// Alias for backwards compatibility
export type Evento = EventoCalendario

// ============ USUARIO ============

export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono: string
  rol: RolUsuario
  activo: boolean
  pin_hash?: string
  created_at: string
}

// ============ CLIENTE ============

export interface Cliente {
  id: string
  tipo_persona: 'fisica' | 'juridica'
  nombre: string
  cedula?: string
  rnc?: string
  telefono: string
  telefono_alt?: string
  email?: string
  direccion: string
  sector?: string
  ciudad: string
  referido_por?: string
  notas?: string
  tipo_cliente: TipoCliente
  total_facturado: number
  created_at: string
  updated_at: string
}

// ============ PRODUCTOS ============

export type TipoProducto = 
  | 'ventana_corrediza_2h'
  | 'ventana_proyectante'
  | 'ventana_fija'
  | 'ventana_celosia'
  | 'puerta_corrediza_2h'
  | 'puerta_abatible'
  | 'puerta_plegable'
  | 'mampara_corrediza'
  | 'mampara_batiente'
  | 'mampara_walk_in'
  | 'division_oficina'
  | 'celosia_aluminio'

export interface ProductoConfig {
  nombre: string
  categoria: 'ventanas' | 'puertas' | 'mamparas' | 'otros'
  sistemas: string[]
  vidrios: string[]
  accesorios_obligatorios: string[]
  accesorios_opcionales?: string[]
}

// ============ ELEMENTO COTIZACION ============

export interface ElementoCotizacion {
  id: string
  tipo: TipoProducto
  tipo_nombre: string
  ubicacion: string
  ancho: number // cm
  alto: number // cm
  cantidad: number
  sistema: string
  color_perfil: string
  vidrio_tipo: string
  vidrio_color?: string
  accesorios_extra?: string[]
  calculo: CalculoElemento
  precio_unitario: number
  precio_total: number
  notas?: string
}

export interface CalculoElemento {
  medidas: {
    ancho: number
    alto: number
    m2: number
  }
  marco: Record<string, PiezaCorte>
  hojasMoviles?: Record<string, Record<string, PiezaCorte>>
  vidrios: Record<string, { ancho: number; alto: number; m2: number }>
  accesorios: Record<string, { cantidad: number; unidad?: string; descripcion?: string }>
  listaCortes: ListaCorte[]
  optimizacionBarras: OptimizacionBarras
  totalMetrosPerfil: number
  totalM2Vidrio: number
}

export interface PiezaCorte {
  longitud: number
  cantidad: number
  descripcion?: string
}

export interface ListaCorte {
  pieza: string
  longitud: number
  cantidad: number
  perfil: string
}

export interface OptimizacionBarras {
  barras: BarraOptimizada[]
  totalBarras: number
  totalDesperdicio: string
  desperdicioPromedio: string
  eficiencia: string
}

export interface BarraOptimizada {
  numero: number
  piezas: ListaCorte[]
  desperdicio: number
}

// ============ COTIZACION ============

export interface Cotizacion {
  id: string
  numero: string
  fecha: string
  fecha_validez: string
  cliente: Cliente
  proyecto: string
  elementos: ElementoCotizacion[]
  subtotal_materiales: number
  instalacion_incluida: boolean
  instalacion: number
  subtotal_general: number
  descuento_porcentaje: number
  descuento: number
  base_imponible: number
  itbis: number
  total: number
  totalM2: number
  estado: EstadoCotizacion
  vendedor_id: string
  vendedor: string
  notas_cliente?: string
  notas_internas?: string
  forma_pago?: string
  tiempo_entrega?: string
  validez_dias: number
  created_at: string
  updated_at: string
}

// ============ PAGO ============

export interface Pago {
  id: string
  cotizacion_id: string
  cotizacionId?: string // alias
  numero_cotizacion: string
  cliente_nombre: string
  fecha: string
  monto: number
  tipo_pago: TipoPago
  metodo: MetodoPago // alias
  referencia?: string
  notas?: string
  registrado_por: string
  created_at: string
}

export interface PlanPago {
  cotizacion_id: string
  cuotas: CuotaPago[]
}

export interface CuotaPago {
  numero: number
  fecha_vencimiento: string
  monto: number
  pagado: boolean
  fecha_pago?: string
  pago_id?: string
}

// ============ CALENDARIO ============

export interface EventoCalendario {
  id: string
  cotizacion_id?: string
  cotizacionId?: string // alias
  numero_cotizacion?: string
  cliente_nombre?: string
  cliente_telefono?: string
  titulo: string
  direccion?: string
  tipo: TipoEvento
  fecha: string
  hora?: string
  hora_inicio?: string
  hora_fin?: string
  tecnicos_asignados?: string[]
  estado?: 'pendiente' | 'en_camino' | 'en_proceso' | 'completado' | 'cancelado'
  notas?: string
  checklist?: ChecklistItem[]
  fotos?: string[]
  created_at?: string
}

export interface ChecklistItem {
  id: string
  descripcion: string
  completado: boolean
}

// ============ GALERIA ============

export interface FotoGaleria {
  id: string
  cotizacion_id?: string
  proyecto_nombre: string
  tipo_foto: 'antes' | 'durante' | 'despues' | 'detalle'
  url: string
  thumbnail_url?: string
  descripcion?: string
  fecha: string
  ubicacion?: string
  publicar_portfolio: boolean
  created_at: string
}

// ============ PRECIOS ============

export type ModoCalculo = 'metro_lineal' | 'm2_completo' | 'mixto'

export interface ConfiguracionPrecios {
  modo_calculo: ModoCalculo
  precios_metro_lineal: {
    perfiles: Record<string, { precio: number; descripcion: string }>
    vidrios: Record<string, { precio_m2: number }>
    accesorios: Record<string, { precio: number; unidad: string }>
  }
  precios_m2_completo: Record<string, { precio_m2: number; incluye: string }>
  margenes: {
    perfiles: number
    vidrios: number
    accesorios: number
    instalacion: number
  }
  instalacion: {
    modo: 'm2' | 'pieza' | 'fijo'
    precio_m2: number
    minimo_cobro: number
  }
  itbis: {
    activo: boolean
    porcentaje: number
    aplicar_sobre: 'subtotal' | 'total'
  }
  descuentos: {
    volumen: { desde_m2: number; hasta_m2: number; descuento: number }[]
    pronto_pago: { activo: boolean; porcentaje: number; condicion: string }
  }
  tipos_cliente: Record<TipoCliente, { multiplicador: number; descuento_max: number }>
}

// ============ EMPRESA ============

export interface ConfiguracionEmpresa {
  nombre_comercial: string
  razon_social: string
  rnc: string
  direccion: string
  ciudad: string
  telefono: string
  telefono_alt?: string
  email: string
  website?: string
  logo_url?: string
  logo_base64?: string
  colores: {
    primario: string
    secundario: string
  }
  terminos_condiciones: string[]
  condiciones_comerciales: {
    forma_pago: string
    tiempo_entrega: string
    tiempo_instalacion: string
    garantia: string
    validez_dias: number
  }
}

// ============ STATS ============

export interface DashboardStats {
  total_mes: number
  total_mes_cambio: number
  cotizaciones_activas: number
  cotizaciones_cambio: number
  tasa_conversion: number
  conversion_cambio: number
  m2_vendidos: number
  m2_cambio: number
}

// ============ API ============

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginResponse {
  success: boolean
  usuario?: Usuario
  token?: string
  error?: string
}
