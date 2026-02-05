"use client"

import React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Pago, MetodoPago, Cotizacion, Cliente } from "@/lib/types"
import {
  Search,
  Plus,
  DollarSign,
  Calendar,
  FileText,
  Trash2,
  CreditCard,
  Banknote,
  Building2,
  X,
  Filter,
  Download,
} from "lucide-react"

const metodoPagoLabels: Record<MetodoPago, { label: string; icon: React.ReactNode }> = {
  efectivo: { label: "Efectivo", icon: <Banknote className="w-4 h-4" /> },
  transferencia: { label: "Transferencia", icon: <Building2 className="w-4 h-4" /> },
  tarjeta: { label: "Tarjeta", icon: <CreditCard className="w-4 h-4" /> },
  cheque: { label: "Cheque", icon: <FileText className="w-4 h-4" /> },
}

export function PagosModule() {
  const { pagos, cotizaciones, clientes, addPago, deletePago } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMetodo, setFilterMetodo] = useState<MetodoPago | "todos">("todos")
  const [showForm, setShowForm] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const getCotizacionInfo = (cotizacionId: string) => {
    const cot = cotizaciones.find((c) => c.id === cotizacionId)
    if (!cot) return null
    return { cotizacion: cot, cliente: cot.cliente }
  }

  const filteredPagos = pagos.filter((pago) => {
    const info = getCotizacionInfo(pago.cotizacion_id || pago.cotizacionId || '')
    const matchesSearch =
      info?.cotizacion.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info?.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.referencia?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const pagoMetodo = pago.metodo || pago.tipo_pago
    const matchesMetodo = filterMetodo === "todos" || pagoMetodo === filterMetodo
    
    const matchesDate =
      (!dateRange.start || new Date(pago.fecha) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(pago.fecha) <= new Date(dateRange.end))
    
    return matchesSearch && matchesMetodo && matchesDate
  })

  const totalPagos = filteredPagos.reduce((sum, p) => sum + p.monto, 0)

  const handleSubmit = (data: Omit<Pago, "id">) => {
    addPago(data)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Esta seguro de eliminar este pago?")) {
      deletePago(id)
    }
  }

  // Resumen por metodo de pago
  const resumenPorMetodo = pagos.reduce((acc, pago) => {
    const metodo = pago.metodo || pago.tipo_pago || 'efectivo'
    acc[metodo] = (acc[metodo] || 0) + pago.monto
    return acc
  }, {} as Record<MetodoPago, number>)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Pagos</h1>
          <p className="text-white/60">Registro y control de pagos recibidos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar Pago
        </button>
      </div>

      {/* Resumen Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Total Recibido</p>
              <p className="text-xl font-bold text-white">
                ${totalPagos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {Object.entries(metodoPagoLabels).map(([metodo, { label, icon }]) => (
          <div key={metodo} className="glass-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                {icon}
              </div>
              <div>
                <p className="text-white/60 text-xs">{label}</p>
                <p className="text-xl font-bold text-white">
                  ${(resumenPorMetodo[metodo as MetodoPago] || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por cotizacion, cliente o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark pl-12 w-full"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterMetodo}
              onChange={(e) => setFilterMetodo(e.target.value as MetodoPago | "todos")}
              className="input-dark min-w-[150px]"
            >
              <option value="todos">Todos los metodos</option>
              {Object.entries(metodoPagoLabels).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-dark"
              placeholder="Desde"
            />

            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-dark"
              placeholder="Hasta"
            />
          </div>
        </div>
      </div>

      {/* Pagos List */}
      <div className="space-y-3">
        {filteredPagos.length === 0 ? (
          <div className="glass-card text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">No hay pagos registrados</p>
          </div>
        ) : (
          filteredPagos.map((pago) => {
            const info = getCotizacionInfo(pago.cotizacion_id || pago.cotizacionId || '')
            const pagoMetodo = (pago.metodo || pago.tipo_pago || 'efectivo') as MetodoPago
            return (
              <div key={pago.id} className="glass-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        pagoMetodo === "efectivo"
                          ? "bg-green-500/20 text-green-400"
                          : pagoMetodo === "transferencia"
                          ? "bg-blue-500/20 text-blue-400"
                          : pagoMetodo === "tarjeta"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {metodoPagoLabels[pagoMetodo].icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          ${pago.monto.toLocaleString()}
                        </span>
                        <span className="badge badge-aprobada text-xs">
                          {metodoPagoLabels[pagoMetodo].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        {info && (
                          <>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {info.cotizacion.numero}
                            </span>
                            <span>{info.cliente?.nombre}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(pago.fecha).toLocaleDateString("es-DO")}
                        </span>
                        {pago.referencia && (
                          <span>Ref: {pago.referencia}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(pago.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors touch-target"
                    aria-label="Eliminar pago"
                  >
                    <Trash2 className="w-4 h-4 text-white/60" />
                  </button>
                </div>
                {pago.notas && (
                  <p className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60">
                    {pago.notas}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <PagoForm
          cotizaciones={cotizaciones.filter((c) => c.estado !== "vencida")}
          clientes={clientes}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

interface PagoFormProps {
  cotizaciones: Cotizacion[]
  clientes: Cliente[]
  onSubmit: (data: Omit<Pago, "id">) => void
  onClose: () => void
}

function PagoForm({ cotizaciones, clientes, onSubmit, onClose }: PagoFormProps) {
  const [formData, setFormData] = useState({
    cotizacionId: "",
    monto: 0,
    fecha: new Date().toISOString().split("T")[0],
    metodo: "efectivo" as MetodoPago,
    referencia: "",
    notas: "",
  })

  const selectedCotizacion = cotizaciones.find((c) => c.id === formData.cotizacionId)
  const selectedCliente = selectedCotizacion?.cliente

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Registrar Pago</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Cotizacion *
            </label>
            <select
              value={formData.cotizacionId}
              onChange={(e) =>
                setFormData({ ...formData, cotizacionId: e.target.value })
              }
              className="input-dark w-full"
              required
            >
              <option value="">Seleccionar cotizacion...</option>
              {cotizaciones.map((cot) => (
                <option key={cot.id} value={cot.id}>
                  {cot.numero} - {cot.cliente?.nombre} (${cot.total.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedCotizacion && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Cliente:</span>
                <span className="text-white">{selectedCliente?.nombre}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-white/60">Total cotizacion:</span>
                <span className="text-white font-semibold">
                  ${selectedCotizacion.total.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-2">Monto *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                $
              </span>
              <input
                type="number"
                value={formData.monto || ""}
                onChange={(e) =>
                  setFormData({ ...formData, monto: Number(e.target.value) })
                }
                className="input-dark pl-8"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Fecha *</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              className="input-dark w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Metodo de Pago *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(metodoPagoLabels).map(([value, { label, icon }]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, metodo: value as MetodoPago })
                  }
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.metodo === value
                      ? "border-orange-500 bg-orange-500/20 text-orange-400"
                      : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Numero de Referencia
            </label>
            <input
              type="text"
              value={formData.referencia}
              onChange={(e) =>
                setFormData({ ...formData, referencia: e.target.value })
              }
              className="input-dark"
              placeholder="Numero de transferencia, cheque, etc."
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Notas</label>
            <textarea
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              className="input-dark min-h-[80px] resize-none"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-gradient">
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
