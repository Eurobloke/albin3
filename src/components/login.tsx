'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Lock, AlertCircle } from 'lucide-react'

export function Login() {
  const { login } = useAuth()
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])
  
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    setError('')
    
    // Mover al siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Intentar login si todos estan llenos
    if (value && index === 3 && newPin.every(d => d)) {
      handleLogin(newPin.join(''))
    }
  }
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      const newPin = pasted.split('')
      setPin(newPin)
      handleLogin(pasted)
    }
  }
  
  const handleLogin = async (pinValue: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await login(pinValue)
      
      if (!result.success) {
        setError(result.error || 'PIN incorrecto')
        setPin(['', '', '', ''])
        inputRefs.current[0]?.focus()
        
        // Vibracion haptica en error
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100])
        }
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      setPin(['', '', '', ''])
      inputRefs.current[0]?.focus()
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md text-center">
        {/* Logo y titulo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">AluminioRD Pro</h1>
          <p className="text-white/60 text-sm">Sistema de Cotizaciones</p>
        </div>
        
        {/* Icono candado */}
        <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
          <Lock className="w-6 h-6 text-orange-500" />
        </div>
        
        <p className="text-white/70 mb-6">Ingresa tu PIN de acceso</p>
        
        {/* Inputs del PIN */}
        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className="w-14 h-16 text-center text-2xl font-bold text-white bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
              aria-label={`Digito ${index + 1} del PIN`}
            />
          ))}
        </div>
        
        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 mb-4 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-orange-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verificando...</span>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-white/30 text-xs">Contacta al administrador si olvidaste tu PIN</p>
        </div>
      </div>
    </div>
  )
}
