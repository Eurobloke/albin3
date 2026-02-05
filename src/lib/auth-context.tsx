'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Usuario, RolUsuario } from './types'

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType {
  user: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (pin: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasRole: (roles: RolUsuario[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'aluminiord_session'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 horas en ms

interface StoredSession {
  usuario: Usuario
  expiry: number
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    usuario: null,
    isAuthenticated: false,
    isLoading: true
  })
  
  // Verificar sesion al cargar
  useEffect(() => {
    const checkSession = () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY)
        if (stored) {
          const session: StoredSession = JSON.parse(stored)
          if (session.expiry > Date.now()) {
            setState({
              usuario: session.usuario,
              isAuthenticated: true,
              isLoading: false
            })
            return
          }
          // Sesion expirada
          localStorage.removeItem(SESSION_KEY)
        }
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
      setState(prev => ({ ...prev, isLoading: false }))
    }
    
    checkSession()
  }, [])
  
  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Hash del PIN usando SHA-256
      const encoder = new TextEncoder()
      const data = encoder.encode(pin)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      // Llamada via proxy local (evita CORS)
      const response = await fetch('/api/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'login', pin_hash: pinHash })
      })
      
      const result = await response.json()
      
      if (result.success && result.usuario) {
        const session: StoredSession = {
          usuario: result.usuario,
          expiry: Date.now() + SESSION_DURATION
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        setState({
          usuario: result.usuario,
          isAuthenticated: true,
          isLoading: false
        })
        return { success: true }
      }
      
      return { success: false, error: result.error || 'Error de autenticacion' }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: 'Error de conexion con el servidor' }
    }
  }, [])
  
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setState({
      usuario: null,
      isAuthenticated: false,
      isLoading: false
    })
  }, [])
  
  const hasRole = useCallback((roles: RolUsuario[]) => {
    if (!state.usuario) return false
    return roles.includes(state.usuario.rol)
  }, [state.usuario])
  
  return (
    <AuthContext.Provider value={{ 
      user: state.usuario, 
      isAuthenticated: state.isAuthenticated, 
      isLoading: state.isLoading, 
      login, 
      logout, 
      hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
