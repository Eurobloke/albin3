'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { 
  Cliente, 
  Cotizacion, 
  ElementoCotizacion, 
  ConfiguracionEmpresa,
  DashboardStats,
  Pago,
  EventoCalendario,
  FotoGaleria
} from './types'
import * as api from './api'

interface AppState {
  // Datos cargados
  clientes: Cliente[]
  cotizaciones: Cotizacion[]
  pagos: Pago[]
  eventos: EventoCalendario[]
  galeria: FotoGaleria[]
  stats: DashboardStats | null
  empresa: ConfiguracionEmpresa | null
  
  // Estado de UI
  sidebarOpen: boolean
  currentModule: string
  isLoading: boolean
  
  // Cotizacion en edicion
  cotizacionActual: Partial<Cotizacion> | null
}

interface AppContextType extends AppState {
  // Setters
  setClientes: (clientes: Cliente[]) => void
  setCotizaciones: (cotizaciones: Cotizacion[]) => void
  setStats: (stats: DashboardStats) => void
  setEmpresa: (empresa: ConfiguracionEmpresa) => void
  
  // UI
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentModule: (module: string) => void
  setIsLoading: (loading: boolean) => void
  
  // Cotizacion
  iniciarCotizacion: (cliente?: Cliente) => void
  actualizarCotizacion: (data: Partial<Cotizacion>) => void
  agregarElemento: (elemento: ElementoCotizacion) => void
  actualizarElemento: (index: number, elemento: ElementoCotizacion) => void
  eliminarElemento: (index: number) => void
  limpiarCotizacion: () => void
  
  // CRUD Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => Promise<void>
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
  
  // CRUD Cotizaciones
  saveCotizacion: (cotizacion: Partial<Cotizacion>) => Promise<void>
  deleteCotizacion: (id: string) => Promise<void>
  
  // CRUD Pagos
  addPago: (pago: Omit<Pago, 'id'>) => Promise<void>
  deletePago: (id: string) => Promise<void>
  
  // CRUD Eventos
  addEvento: (evento: Omit<EventoCalendario, 'id'>) => Promise<void>
  updateEvento: (id: string, evento: Partial<EventoCalendario>) => Promise<void>
  deleteEvento: (id: string) => Promise<void>
  
  // Refresh data
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const initialState: AppState = {
  clientes: [],
  cotizaciones: [],
  pagos: [],
  eventos: [],
  galeria: [],
  stats: null,
  empresa: null,
  sidebarOpen: false,
  currentModule: 'dashboard',
  isLoading: false,
  cotizacionActual: null
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  
  // Setters de datos
  const setClientes = useCallback((clientes: Cliente[]) => {
    setState(prev => ({ ...prev, clientes }))
  }, [])
  
  const setCotizaciones = useCallback((cotizaciones: Cotizacion[]) => {
    setState(prev => ({ ...prev, cotizaciones }))
  }, [])
  
  const setStats = useCallback((stats: DashboardStats) => {
    setState(prev => ({ ...prev, stats }))
  }, [])
  
  const setEmpresa = useCallback((empresa: ConfiguracionEmpresa) => {
    setState(prev => ({ ...prev, empresa }))
  }, [])
  
  // UI
  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }, [])
  
  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }))
  }, [])
  
  const setCurrentModule = useCallback((module: string) => {
    setState(prev => ({ ...prev, currentModule: module, sidebarOpen: false }))
  }, [])
  
  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])
  
  // Cotizacion
  const iniciarCotizacion = useCallback((cliente?: Cliente) => {
    const hoy = new Date()
    const validez = new Date(hoy)
    validez.setDate(validez.getDate() + 15)
    
    setState(prev => ({
      ...prev,
      cotizacionActual: {
        cliente: cliente || undefined,
        proyecto: '',
        elementos: [],
        instalacion_incluida: true,
        descuento_porcentaje: 0,
        validez_dias: 15,
        fecha: hoy.toISOString().split('T')[0],
        fecha_validez: validez.toISOString().split('T')[0]
      }
    }))
  }, [])
  
  const actualizarCotizacion = useCallback((data: Partial<Cotizacion>) => {
    setState(prev => ({
      ...prev,
      cotizacionActual: prev.cotizacionActual 
        ? { ...prev.cotizacionActual, ...data }
        : data
    }))
  }, [])
  
  const agregarElemento = useCallback((elemento: ElementoCotizacion) => {
    setState(prev => {
      if (!prev.cotizacionActual) return prev
      return {
        ...prev,
        cotizacionActual: {
          ...prev.cotizacionActual,
          elementos: [...(prev.cotizacionActual.elementos || []), elemento]
        }
      }
    })
  }, [])
  
  const actualizarElemento = useCallback((index: number, elemento: ElementoCotizacion) => {
    setState(prev => {
      if (!prev.cotizacionActual?.elementos) return prev
      const elementos = [...prev.cotizacionActual.elementos]
      elementos[index] = elemento
      return {
        ...prev,
        cotizacionActual: {
          ...prev.cotizacionActual,
          elementos
        }
      }
    })
  }, [])
  
  const eliminarElemento = useCallback((index: number) => {
    setState(prev => {
      if (!prev.cotizacionActual?.elementos) return prev
      const elementos = prev.cotizacionActual.elementos.filter((_, i) => i !== index)
      return {
        ...prev,
        cotizacionActual: {
          ...prev.cotizacionActual,
          elementos
        }
      }
    })
  }, [])
  
  const limpiarCotizacion = useCallback(() => {
    setState(prev => ({ ...prev, cotizacionActual: null }))
  }, [])
  
  // ============ CRUD CLIENTES ============
  
  const addCliente = useCallback(async (clienteData: Omit<Cliente, 'id' | 'createdAt'>) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.guardarCliente(clienteData)
    if (result.success && result.data) {
      setState(prev => ({
        ...prev,
        clientes: [...prev.clientes, result.data as Cliente],
        isLoading: false
      }))
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al guardar cliente')
    }
  }, [])
  
  const updateCliente = useCallback(async (id: string, clienteData: Partial<Cliente>) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.guardarCliente({ ...clienteData, id })
    if (result.success && result.data) {
      setState(prev => ({
        ...prev,
        clientes: prev.clientes.map(c => c.id === id ? { ...c, ...result.data } : c),
        isLoading: false
      }))
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al actualizar cliente')
    }
  }, [])
  
  const deleteCliente = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    // Nota: necesitas agregar eliminarCliente en api.ts si no existe
    setState(prev => ({
      ...prev,
      clientes: prev.clientes.filter(c => c.id !== id),
      isLoading: false
    }))
  }, [])
  
  // ============ CRUD COTIZACIONES ============
  
  const saveCotizacion = useCallback(async (cotizacionData: Partial<Cotizacion>) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.guardarCotizacion(cotizacionData)
    if (result.success && result.data) {
      setState(prev => {
        const exists = prev.cotizaciones.some(c => c.id === result.data?.id)
        return {
          ...prev,
          cotizaciones: exists
            ? prev.cotizaciones.map(c => c.id === result.data?.id ? result.data as Cotizacion : c)
            : [...prev.cotizaciones, result.data as Cotizacion],
          isLoading: false
        }
      })
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al guardar cotizacion')
    }
  }, [])
  
  const deleteCotizacion = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.eliminarCotizacion(id)
    if (result.success) {
      setState(prev => ({
        ...prev,
        cotizaciones: prev.cotizaciones.filter(c => c.id !== id),
        isLoading: false
      }))
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al eliminar cotizacion')
    }
  }, [])
  
  // ============ CRUD PAGOS ============
  
  const addPago = useCallback(async (pagoData: Omit<Pago, 'id'>) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.guardarPago(pagoData)
    if (result.success && result.data) {
      setState(prev => ({
        ...prev,
        pagos: [...prev.pagos, result.data as Pago],
        isLoading: false
      }))
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al registrar pago')
    }
  }, [])
  
  const deletePago = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    // Por ahora solo eliminamos localmente - agregar API call si es necesario
    setState(prev => ({
      ...prev,
      pagos: prev.pagos.filter(p => p.id !== id),
      isLoading: false
    }))
  }, [])
  
  // ============ CRUD EVENTOS ============
  
  const addEvento = useCallback(async (eventoData: Omit<EventoCalendario, 'id'>) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.guardarEvento(eventoData)
    if (result.success && result.data) {
      setState(prev => ({
        ...prev,
        eventos: [...prev.eventos, result.data as EventoCalendario],
        isLoading: false
      }))
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al crear evento')
    }
  }, [])
  
  const updateEvento = useCallback(async (id: string, eventoData: Partial<EventoCalendario>) => {
    setState(prev => ({ ...prev, isLoading: true }))
    const result = await api.actualizarEstadoEvento(id, eventoData.estado || '')
    if (result.success && result.data) {
      setState(prev => ({
        ...prev,
        eventos: prev.eventos.map(e => e.id === id ? { ...e, ...result.data } : e),
        isLoading: false
      }))
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
      throw new Error(result.error || 'Error al actualizar evento')
    }
  }, [])
  
  const deleteEvento = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    // Por ahora solo eliminamos localmente - agregar API call si es necesario
    setState(prev => ({
      ...prev,
      eventos: prev.eventos.filter(e => e.id !== id),
      isLoading: false
    }))
  }, [])
  
  // ============ REFRESH DATA ============
  
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const [clientesRes, cotizacionesRes, statsRes] = await Promise.all([
        api.getClientes(),
        api.getCotizaciones(),
        api.getDashboardStats()
      ])
      
      setState(prev => ({
        ...prev,
        clientes: clientesRes.success && clientesRes.data ? clientesRes.data : [],
        cotizaciones: cotizacionesRes.success && cotizacionesRes.data ? cotizacionesRes.data : [],
        stats: statsRes.success && statsRes.data ? statsRes.data : null,
        isLoading: false
      }))
    } catch (error) {
      console.error('Error refreshing data:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])
  
  // Cargar datos iniciales
  useEffect(() => {
    refreshData()
  }, [refreshData])
  
  return (
    <AppContext.Provider value={{
      ...state,
      setClientes,
      setCotizaciones,
      setStats,
      setEmpresa,
      toggleSidebar,
      setSidebarOpen,
      setCurrentModule,
      setIsLoading,
      iniciarCotizacion,
      actualizarCotizacion,
      agregarElemento,
      actualizarElemento,
      eliminarElemento,
      limpiarCotizacion,
      addCliente,
      updateCliente,
      deleteCliente,
      saveCotizacion,
      deleteCotizacion,
      addPago,
      deletePago,
      addEvento,
      updateEvento,
      deleteEvento,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}
