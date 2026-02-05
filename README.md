# 🏢 AluminioRD Pro - Sistema de Cotizaciones

Sistema completo de gestión de cotizaciones para ventanas y puertas de aluminio.

**Stack:**
- ⚛️ Frontend: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- 🔧 Backend: Google Apps Script (GAS) + Google Sheets
- 🚀 Deploy: GitHub Pages (Frontend) + GAS Web App (Backend)

---

## 📋 Características

- 📊 Dashboard con estadísticas
- 🧮 Calculadora de cotizaciones
- 📄 Gestión completa de cotizaciones
- 👥 CRM de clientes
- 💳 Control de pagos
- 📅 Calendario de eventos
- 🖼️ Galería de proyectos

---

## 🚀 Instalación Rápida

### 1. Backend (Google Apps Script)

1. Crear nuevo Google Sheet
2. **Extensiones > Apps Script**
3. Copiar código de `public/gas/Code.gs`
4. Ejecutar `inicializarHojas()`
5. **Implementar > Nueva implementación > Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
6. **Copiar URL del Web App**

### 2. Frontend (GitHub Pages)

```bash
# Instalar dependencias
npm install

# Configurar URL de GAS
echo "VITE_GAS_URL=https://script.google.com/macros/s/TU_ID/exec" > .env

# Desarrollo local
npm run dev

# Deploy a GitHub Pages
npm run deploy
```

---

## 📖 Documentación Completa

Ver instrucciones detalladas en `public/gas/INSTRUCCIONES.txt`

**Credenciales por defecto:**
- PIN: `1234`

---

## 🔧 Stack Técnico

- React 19 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Recharts (gráficas)
- Google Apps Script (backend)
- Google Sheets (database)

---

## 📁 Estructura

```
src/
├── components/
│   ├── modules/        # Módulos principales
│   ├── ui/             # Componentes shadcn/ui
│   └── ...
├── lib/
│   ├── api.ts          # Cliente HTTP
│   ├── types.ts        # TypeScript types
│   └── ...
└── App.tsx
```

---

## 🐛 Troubleshooting

**Error CORS**: Verificar configuración de GAS Web App

**Cambios en GAS no se reflejan**: Crear nueva implementación

**404 en GitHub Pages**: Verificar `base: './'` en vite.config.ts

---

Hecho con ❤️ para AluminioRD
