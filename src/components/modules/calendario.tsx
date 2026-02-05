"use client"

import React from "react"

import { useState, useMemo } from "react"
import { useApp } from "@/lib/app-context"
import type { EventoCalendario, TipoEvento, Cotizacion, Cliente } from "@/lib/types"

type Evento = EventoCalendario
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  Wrench,
  Truck,
  X,
  Edit2,
  Trash2,
} from "lucide-react"

const tipoEventoConfig: Record<
  TipoEvento,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  medicion: {
    label: "Medicion",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: <FileText className="w-4 h-4" />,
  },
  instalacion: {
    label: "Instalacion",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: <Wrench className="w-4 h-4" />,
  },
  entrega: {
    label: "Entrega",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    icon: <Truck className="w-4 h-4" />,
  },
  seguimiento: {
    label: "Seguimiento",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    icon: <CalendarIcon className="w-4 h-4" />,
  },
  otro: {
    label: "Otro",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    icon: <CalendarIcon className="w-4 h-4" />,
  },
}

const DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export function CalendarioModule() {
  const { eventos, cotizaciones, clientes, addEvento, updateEvento, deleteEvento } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [view, setView] = useState<"month" | "week">("month")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [year, month])

  const getEventosForDate = (date: Date) => {
    return eventos.filter((e) => {
      const eventDate = new Date(e.fecha)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddEvento = (date?: Date) => {
    setEditingEvento(null)
    if (date) setSelectedDate(date)
    setShowForm(true)
  }

  const handleEditEvento = (evento: Evento) => {
    setEditingEvento(evento)
    setShowForm(true)
  }

  const handleDeleteEvento = (id: string) => {
    if (confirm("Esta seguro de eliminar este evento?")) {
      deleteEvento(id)
    }
  }

  const handleSubmit = (data: Omit<Evento, "id">) => {
    if (editingEvento) {
      updateEvento(editingEvento.id, data)
    } else {
      addEvento(data)
    }
    setShowForm(false)
    setEditingEvento(null)
  }

  // Eventos de hoy
  const todayEvents = getEventosForDate(new Date())

  // Proximos eventos (7 dias)
  const upcomingEvents = eventos
    .filter((e) => {
      const eventDate = new Date(e.fecha)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= today && eventDate <= nextWeek
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Calendario</h1>
          <p className="text-white/60">Programa citas, instalaciones y entregas</p>
        </div>
        <button
          onClick={() => handleAddEvento()}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors touch-target"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-white/60 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dayEvents = getEventosForDate(date)
              const isSelected =
                selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative p-2 min-h-[80px] rounded-lg transition-all text-left
                    ${isCurrentMonth ? "bg-white/5" : "bg-white/[0.02]"}
                    ${isToday(date) ? "ring-2 ring-orange-500" : ""}
                    ${isSelected ? "bg-orange-500/20" : "hover:bg-white/10"}
                  `}
                >
                  <span
                    className={`
                      text-sm font-medium
                      ${isCurrentMonth ? "text-white" : "text-white/30"}
                      ${isToday(date) ? "text-orange-400" : ""}
                    `}
                  >
                    {date.getDate()}
                  </span>
                  
                  {/* Event dots */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((evento) => (
                      <div
                        key={evento.id}
                        className={`text-xs truncate px-1 py-0.5 rounded ${tipoEventoConfig[evento.tipo].bgColor} ${tipoEventoConfig[evento.tipo].color}`}
                      >
                        {evento.titulo}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-white/40">
                        +{dayEvents.length - 3} mas
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar - Selected Date Events or Upcoming */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
                </h3>
                <button
                  onClick={() => handleAddEvento(selectedDate)}
                  className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {getEventosForDate(selectedDate).length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">
                  Sin eventos para este dia
                </p>
              ) : (
                <div className="space-y-3">
                  {getEventosForDate(selectedDate).map((evento) => (
                    <EventoCard
                      key={evento.id}
                      evento={evento}
                      cotizaciones={cotizaciones}
                      clientes={clientes}
                      onEdit={handleEditEvento}
                      onDelete={handleDeleteEvento}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="glass-card">
            <h3 className="font-semibold text-white mb-4">
              Proximos 7 dias
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">
                Sin eventos programados
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((evento) => (
                  <EventoCard
                    key={evento.id}
                    evento={evento}
                    cotizaciones={cotizaciones}
                    clientes={clientes}
                    onEdit={handleEditEvento}
                    onDelete={handleDeleteEvento}
                    showDate
                  />
                ))}
              </div>
            )}
          </div>

          {/* Today's Events */}
          {todayEvents.length > 0 && !selectedDate && (
            <div className="glass-card border-l-4 border-orange-500">
              <h3 className="font-semibold text-white mb-4">Hoy</h3>
              <div className="space-y-3">
                {todayEvents.map((evento) => (
                  <EventoCard
                    key={evento.id}
                    evento={evento}
                    cotizaciones={cotizaciones}
                    clientes={clientes}
                    onEdit={handleEditEvento}
                    onDelete={handleDeleteEvento}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <EventoForm
          evento={editingEvento}
          defaultDate={selectedDate}
          cotizaciones={cotizaciones}
          clientes={clientes}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingEvento(null)
          }}
        />
      )}
    </div>
  )
}

interface EventoCardProps {
  evento: Evento
  cotizaciones: Cotizacion[]
  clientes: Cliente[]
  onEdit: (evento: Evento) => void
  onDelete: (id: string) => void
  showDate?: boolean
}

function EventoCard({ evento, cotizaciones, clientes, onEdit, onDelete, showDate }: EventoCardProps) {
  const config = tipoEventoConfig[evento.tipo] || tipoEventoConfig.otro
  const cotizacion = cotizaciones.find((c) => c.id === (evento.cotizacionId || evento.cotizacion_id))
  const cliente = cotizacion?.cliente

  return (
    <div className={`p-3 rounded-xl ${config.bgColor} border border-white/5`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`${config.color}`}>{config.icon}</div>
          <div>
            <p className="font-medium text-white text-sm">{evento.titulo}</p>
            {showDate && (
              <p className="text-xs text-white/40">
                {new Date(evento.fecha).toLocaleDateString("es-DO")}
              </p>
            )}
            {evento.hora && (
              <p className="flex items-center gap-1 text-xs text-white/60 mt-1">
                <Clock className="w-3 h-3" />
                {evento.hora}
              </p>
            )}
            {evento.direccion && (
              <p className="flex items-center gap-1 text-xs text-white/60 mt-1">
                <MapPin className="w-3 h-3" />
                {evento.direccion}
              </p>
            )}
            {cliente && (
              <p className="text-xs text-white/40 mt-1">{cliente.nombre}</p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(evento)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Editar evento"
          >
            <Edit2 className="w-3 h-3 text-white/60" />
          </button>
          <button
            onClick={() => onDelete(evento.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
            aria-label="Eliminar evento"
          >
            <Trash2 className="w-3 h-3 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface EventoFormProps {
  evento: Evento | null
  defaultDate: Date | null
  cotizaciones: Cotizacion[]
  clientes: Cliente[]
  onSubmit: (data: Omit<Evento, "id">) => void
  onClose: () => void
}

function EventoForm({
  evento,
  defaultDate,
  cotizaciones,
  clientes,
  onSubmit,
  onClose,
}: EventoFormProps) {
  const [formData, setFormData] = useState({
    titulo: evento?.titulo || "",
    tipo: evento?.tipo || ("medicion" as TipoEvento),
    fecha: evento?.fecha || defaultDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    hora: evento?.hora || "",
    cotizacionId: evento?.cotizacionId || "",
    direccion: evento?.direccion || "",
    notas: evento?.notas || "",
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
            {evento ? "Editar Evento" : "Nuevo Evento"}
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
            <label className="block text-sm text-white/60 mb-2">Titulo *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Tipo de Evento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(tipoEventoConfig).map(([value, { label, icon, bgColor, color }]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, tipo: value as TipoEvento })
                  }
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.tipo === value
                      ? `border-orange-500 ${bgColor} ${color}`
                      : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm text-white/60 mb-2">Hora</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                className="input-dark w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Cotizacion Relacionada
            </label>
            <select
              value={formData.cotizacionId}
              onChange={(e) =>
                setFormData({ ...formData, cotizacionId: e.target.value })
              }
              className="input-dark w-full"
            >
              <option value="">Sin cotizacion</option>
              {cotizaciones.map((cot) => (
                <option key={cot.id} value={cot.id}>
                  {cot.numero} - {cot.cliente?.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Direccion</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="input-dark"
              placeholder="Direccion del evento..."
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
              placeholder="Notas adicionales..."
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
              {evento ? "Guardar" : "Crear Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
