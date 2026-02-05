"use client"

import React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { Cliente } from "@/lib/types"
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  User,
  X,
  FileText,
  DollarSign,
} from "lucide-react"

export function ClientesModule() {
  const { clientes, cotizaciones, pagos, addCliente, updateCliente, deleteCliente } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getClienteStats = (clienteId: string) => {
    const clienteCotizaciones = cotizaciones.filter((c) => c.cliente?.id === clienteId)
    const clientePagos = pagos.filter((p) => 
      clienteCotizaciones.some((c) => c.id === p.cotizacion_id)
    )
    const totalCotizado = clienteCotizaciones.reduce((sum, c) => sum + c.total, 0)
    const totalPagado = clientePagos.reduce((sum, p) => sum + p.monto, 0)
    
    return {
      cotizaciones: clienteCotizaciones.length,
      totalCotizado,
      totalPagado,
      pendiente: totalCotizado - totalPagado,
    }
  }

  const handleSubmit = async (data: Omit<Cliente, "id" | "created_at" | "updated_at" | "total_facturado">) => {
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, data)
      } else {
        await addCliente(data)
      }
      setShowForm(false)
      setEditingCliente(null)
    } catch (error) {
      console.error("Error guardando cliente:", error)
      alert("Error al guardar el cliente. Intente de nuevo.")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Esta seguro de eliminar este cliente?")) {
      try {
        await deleteCliente(id)
        if (selectedCliente?.id === id) {
          setSelectedCliente(null)
        }
      } catch (error) {
        console.error("Error eliminando cliente:", error)
        alert("Error al eliminar el cliente.")
      }
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Clientes</h1>
          <p className="text-white/60">Gestiona tu cartera de clientes</p>
        </div>
        <button
          onClick={() => {
            setEditingCliente(null)
            setShowForm(true)
          }}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por nombre, telefono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-dark pl-12 w-full"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="lg:col-span-2 space-y-4">
          {filteredClientes.length === 0 ? (
            <div className="glass-card text-center py-12">
              <User className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/60">No hay clientes registrados</p>
            </div>
          ) : (
            filteredClientes.map((cliente) => {
              const stats = getClienteStats(cliente.id)
              return (
                <div
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className={`glass-card cursor-pointer transition-all ${
                    selectedCliente?.id === cliente.id
                      ? "ring-2 ring-orange-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {cliente.nombre}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cliente.telefono}
                          </span>
                          {cliente.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {cliente.email}
                            </span>
                          )}
                        </div>
                        {cliente.direccion && (
                          <p className="flex items-center gap-1 mt-1 text-sm text-white/40">
                            <MapPin className="w-3 h-3" />
                            {cliente.direccion}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCliente(cliente)
                          setShowForm(true)
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors touch-target"
                        aria-label="Editar cliente"
                      >
                        <Edit2 className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(cliente.id)
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors touch-target"
                        aria-label="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{stats.cotizaciones}</p>
                      <p className="text-xs text-white/40">Cotizaciones</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        ${stats.totalPagado.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/40">Pagado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">
                        ${stats.pendiente.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/40">Pendiente</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detalle del Cliente */}
        <div className="hidden lg:block">
          {selectedCliente ? (
            <ClienteDetail
              cliente={selectedCliente}
              cotizaciones={cotizaciones.filter(
                (c) => c.cliente?.id === selectedCliente.id
              )}
              onClose={() => setSelectedCliente(null)}
            />
          ) : (
            <div className="glass-card text-center py-12">
              <User className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/60">Selecciona un cliente para ver detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ClienteForm
          cliente={editingCliente}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingCliente(null)
          }}
        />
      )}
    </div>
  )
}

interface ClienteFormProps {
  cliente: Cliente | null
  onSubmit: (data: Omit<Cliente, "id" | "created_at" | "updated_at" | "total_facturado">) => void
  onClose: () => void
}

function ClienteForm({ cliente, onSubmit, onClose }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    tipo_persona: cliente?.tipo_persona || "fisica" as const,
    nombre: cliente?.nombre || "",
    telefono: cliente?.telefono || "",
    email: cliente?.email || "",
    direccion: cliente?.direccion || "",
    cedula: cliente?.cedula || "",
    ciudad: cliente?.ciudad || "Santo Domingo",
    sector: cliente?.sector || "",
    tipo_cliente: cliente?.tipo_cliente || "retail" as const,
    notas: cliente?.notas || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {cliente ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="block text-sm text-white/60 mb-2">Tipo de Persona *</label>
    <select
      value={formData.tipo_persona}
      onChange={(e) => setFormData({ ...formData, tipo_persona: e.target.value as "fisica" | "juridica" })}
      className="input-dark"
    >
      <option value="fisica">Persona Fisica</option>
      <option value="juridica">Persona Juridica (Empresa)</option>
    </select>
  </div>

  <div>
    <label className="block text-sm text-white/60 mb-2">
      {formData.tipo_persona === "juridica" ? "Nombre de Empresa *" : "Nombre Completo *"}
    </label>
    <input
      type="text"
      value={formData.nombre}
      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
      className="input-dark"
      required
    />
  </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Telefono *
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input-dark"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Cedula/RNC
            </label>
            <input
              type="text"
              value={formData.cedula}
              onChange={(e) =>
                setFormData({ ...formData, cedula: e.target.value })
              }
              className="input-dark"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Direccion
            </label>
            <textarea
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="input-dark min-h-[80px] resize-none"
            />
          </div>

<div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm text-white/60 mb-2">Ciudad *</label>
      <input
        type="text"
        value={formData.ciudad}
        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
        className="input-dark"
        required
      />
    </div>
    <div>
      <label className="block text-sm text-white/60 mb-2">Sector</label>
      <input
        type="text"
        value={formData.sector}
        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
        className="input-dark"
      />
    </div>
  </div>

  <div>
    <label className="block text-sm text-white/60 mb-2">Tipo de Cliente *</label>
    <select
      value={formData.tipo_cliente}
      onChange={(e) => setFormData({ ...formData, tipo_cliente: e.target.value as "retail" | "constructor" | "mayorista" })}
      className="input-dark"
    >
      <option value="retail">Retail (Cliente Final)</option>
      <option value="constructor">Constructor</option>
      <option value="mayorista">Mayorista</option>
    </select>
  </div>

  <div>
    <label className="block text-sm text-white/60 mb-2">Notas</label>
    <textarea
      value={formData.notas}
      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
      className="input-dark min-h-[80px] resize-none"
      placeholder="Notas adicionales sobre el cliente..."
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
              {cliente ? "Guardar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ClienteDetailProps {
  cliente: Cliente
  cotizaciones: Array<{
    id: string
    numero: string
    fecha: string
    estado: string
    total: number
  }>
  onClose: () => void
}

function ClienteDetail({ cliente, cotizaciones }: ClienteDetailProps) {
  return (
    <div className="glass-card sticky top-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-3xl">
            {cliente.nombre.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white">{cliente.nombre}</h3>
        <p className="text-white/40 text-sm">
          Cliente desde {new Date(cliente.created_at).toLocaleDateString("es-DO")}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-white/80">
          <Phone className="w-4 h-4 text-orange-400" />
          <span>{cliente.telefono}</span>
        </div>
        {cliente.email && (
          <div className="flex items-center gap-3 text-white/80">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>{cliente.email}</span>
          </div>
        )}
        {cliente.direccion && (
          <div className="flex items-center gap-3 text-white/80">
            <MapPin className="w-4 h-4 text-green-400" />
            <span>{cliente.direccion}</span>
          </div>
        )}
      </div>

      {/* Cotizaciones Recientes */}
      <div>
        <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Cotizaciones Recientes
        </h4>
        {cotizaciones.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">
            Sin cotizaciones
          </p>
        ) : (
          <div className="space-y-2">
            {cotizaciones.slice(0, 5).map((cot) => (
              <div
                key={cot.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div>
                  <p className="text-white font-medium">{cot.numero}</p>
                  <p className="text-white/40 text-xs">
                    {new Date(cot.fecha).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${cot.total.toLocaleString()}
                  </p>
                  <span className={`badge badge-${cot.estado} text-xs`}>
                    {cot.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 mt-6">
        <a
          href={`tel:${cliente.telefono}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Llamar
        </a>
        <a
          href={`https://wa.me/1${cliente.telefono.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
