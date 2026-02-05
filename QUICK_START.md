# ⚡ Inicio Rápido - AluminioRD Pro

## 🎯 En 5 Minutos

### 1️⃣ Backend (Google Apps Script)

```bash
1. Crear Google Sheet nuevo
2. Extensiones > Apps Script
3. Copiar código de public/gas/Code.gs
4. Ejecutar inicializarHojas()
5. Implementar > Web App > Cualquier persona
6. COPIAR URL
```

### 2️⃣ Frontend (Local)

```bash
npm install
echo "VITE_GAS_URL=TU_URL_AQUI" > .env
npm run dev
```

**Login**: PIN `1234`

### 3️⃣ Deploy (GitHub Pages)

```bash
# Automático
git push  # (con workflow configurado)

# Manual
npm run deploy
```

---

## 📝 Checklist de Instalación

Backend:
- [ ] Google Sheet creado
- [ ] Apps Script configurado
- [ ] inicializarHojas() ejecutado
- [ ] Web App deployado
- [ ] URL copiada

Frontend:
- [ ] npm install completado
- [ ] .env configurado con URL
- [ ] npm run dev funciona
- [ ] Login con PIN 1234 exitoso

GitHub Pages:
- [ ] Repositorio creado
- [ ] Workflow configurado
- [ ] Secret VITE_GAS_URL agregado
- [ ] Push realizado
- [ ] App accesible en github.io

---

## 🔧 Configuración Rápida

### .env
```bash
VITE_GAS_URL=https://script.google.com/macros/s/TU_ID/exec
```

### Workflow Secret
```
Name: VITE_GAS_URL
Value: https://script.google.com/macros/s/TU_ID/exec
```

---

## ✅ Verificación

### Backend OK:
```
https://script.google.com/macros/s/TU_ID/exec?action=getStats
```
Debe retornar JSON con datos

### Frontend OK:
- Login funciona
- Dashboard carga
- Módulos navegan correctamente

---

## 🚨 Problemas Comunes

**No conecta con GAS**
→ Verificar URL en .env es correcta

**CORS error**
→ GAS Web App debe ser "Cualquier persona"

**Cambios GAS no se ven**
→ Crear "Nueva versión" al deployar

**404 en GitHub Pages**
→ Verificar base: './' en vite.config.ts

---

## 📚 Documentación Completa

- README.md (overview)
- public/gas/INSTRUCCIONES.txt (detallado)
- Este archivo (quick start)

---

**¿Listo?** 🚀

```bash
npm run dev
```
