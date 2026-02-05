"use client"

import React from "react"

import { useState, useRef } from "react"
import { useApp } from "@/lib/app-context"
import type { ImagenGaleria } from "@/lib/types"
import {
  Search,
  Plus,
  ImageIcon,
  X,
  Trash2,
  Download,
  ZoomIn,
  Grid3X3,
  List,
  Filter,
  Tag,
  Calendar,
} from "lucide-react"

const categorias = [
  "Ventanas Corredizas",
  "Puertas Corredizas",
  "Ventanas Proyectantes",
  "Puertas Batientes",
  "Fachadas",
  "Barandas",
  "Otros",
]

export function GaleriaModule() {
  const { galeria, addImagen, deleteImagen } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState<string>("todas")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedImage, setSelectedImage] = useState<ImagenGaleria | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredImages = galeria.filter((img) => {
    const matchesSearch =
      img.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategoria =
      filterCategoria === "todas" || img.categoria === filterCategoria
    
    return matchesSearch && matchesCategoria
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        addImagen({
          titulo: file.name.replace(/\.[^/.]+$/, ""),
          url: dataUrl,
          categoria: "Otros",
          fecha: new Date().toISOString(),
        })
      }
      reader.readAsDataURL(file)
    }

    setShowUpload(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Esta seguro de eliminar esta imagen?")) {
      deleteImagen(id)
      if (selectedImage?.id === id) {
        setSelectedImage(null)
      }
    }
  }

  const categoryCounts = galeria.reduce((acc, img) => {
    acc[img.categoria] = (acc[img.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Galeria</h1>
          <p className="text-white/60">Portafolio de trabajos realizados</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-gradient flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Subir Imagen
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Total Imagenes</p>
              <p className="text-xl font-bold text-white">{galeria.length}</p>
            </div>
          </div>
        </div>
        {Object.entries(categoryCounts).slice(0, 3).map(([cat, count]) => (
          <div key={cat} className="glass-card hidden md:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs truncate">{cat}</p>
                <p className="text-xl font-bold text-white">{count}</p>
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
              placeholder="Buscar por titulo, descripcion o tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark pl-12 w-full"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="input-dark min-w-[180px]"
            >
              <option value="todas">Todas las categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-colors ${
                  viewMode === "grid"
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-white/60 hover:bg-white/5"
                }`}
                aria-label="Vista cuadricula"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-colors ${
                  viewMode === "list"
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-white/60 hover:bg-white/5"
                }`}
                aria-label="Vista lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid/List */}
      {filteredImages.length === 0 ? (
        <div className="glass-card text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/60">No hay imagenes en la galeria</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 px-6 py-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
          >
            Subir primera imagen
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((imagen) => (
            <div
              key={imagen.id}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(imagen)}
            >
              <img
                src={imagen.url || "/placeholder.svg"}
                alt={imagen.titulo}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium truncate">{imagen.titulo}</p>
                  <p className="text-white/60 text-sm">{imagen.categoria}</p>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(imagen)
                    }}
                    className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    aria-label="Ver imagen"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(imagen.id)
                    }}
                    className="p-2 rounded-lg bg-red-500/50 backdrop-blur-sm text-white hover:bg-red-500/70 transition-colors"
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredImages.map((imagen) => (
            <div
              key={imagen.id}
              className="glass-card flex items-center gap-4 cursor-pointer"
              onClick={() => setSelectedImage(imagen)}
            >
              <img
                src={imagen.url || "/placeholder.svg"}
                alt={imagen.titulo}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{imagen.titulo}</h3>
                <p className="text-white/60 text-sm">{imagen.categoria}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(imagen.fecha).toLocaleDateString("es-DO")}
                  </span>
                  {imagen.tags && imagen.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {imagen.tags.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(imagen)
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors touch-target"
                  aria-label="Ver imagen"
                >
                  <ZoomIn className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(imagen.id)
                  }}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors touch-target"
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onFileSelect={handleFileSelect}
          fileInputRef={fileInputRef}
          addImagen={addImagen}
        />
      )}

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          imagen={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={() => handleDelete(selectedImage.id)}
        />
      )}
    </div>
  )
}

interface UploadModalProps {
  onClose: () => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  addImagen: (data: Omit<ImagenGaleria, "id">) => void
}

function UploadModal({ onClose, onFileSelect, fileInputRef, addImagen }: UploadModalProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "Otros",
    tags: "",
    url: "",
  })
  const [previewUrl, setPreviewUrl] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPreviewUrl(dataUrl)
      setFormData({ ...formData, url: dataUrl, titulo: file.name.replace(/\.[^/.]+$/, "") })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url) return

    addImagen({
      titulo: formData.titulo,
      descripcion: formData.descripcion || undefined,
      categoria: formData.categoria,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
      url: formData.url,
      fecha: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Subir Imagen</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Imagen *</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${previewUrl ? "border-orange-500/50" : "border-white/20 hover:border-white/40"}
              `}
            >
              {previewUrl ? (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 mx-auto text-white/20 mb-2" />
                  <p className="text-white/60">Click para seleccionar imagen</p>
                  <p className="text-white/40 text-sm">JPG, PNG, WebP</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

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
            <label className="block text-sm text-white/60 mb-2">Categoria *</label>
            <select
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              className="input-dark w-full"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Descripcion</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="input-dark min-h-[80px] resize-none"
              placeholder="Descripcion del trabajo..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="input-dark"
              placeholder="aluminio, blanco, moderno (separados por coma)"
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
            <button
              type="submit"
              disabled={!formData.url}
              className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Subir Imagen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface LightboxProps {
  imagen: ImagenGaleria
  onClose: () => void
  onDelete: () => void
}

function Lightbox({ imagen, onClose, onDelete }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imagen.url || "/placeholder.svg"}
          alt={imagen.titulo}
          className="w-full max-h-[70vh] object-contain rounded-2xl"
        />
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{imagen.titulo}</h3>
            <p className="text-white/60">{imagen.categoria}</p>
            {imagen.descripcion && (
              <p className="text-white/40 mt-2">{imagen.descripcion}</p>
            )}
            {imagen.tags && imagen.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {imagen.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <a
              href={imagen.url}
              download={imagen.titulo}
              className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Descargar imagen"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onDelete}
              className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              aria-label="Eliminar imagen"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
