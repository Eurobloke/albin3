/**
 * AluminioRD Pro - Backend Google Apps Script
 * Sistema de Cotizaciones para Ventanas y Puertas de Aluminio
 * 
 * INSTRUCCIONES DE INSTALACION:
 * 1. Crear un nuevo Google Spreadsheet
 * 2. Ir a Extensiones > Apps Script
 * 3. Copiar todo este codigo en el editor
 * 4. Ejecutar inicializarHojas() una vez para crear las hojas
 * 5. Implementar > Nueva implementacion > Aplicacion web
 * 6. Configurar: 
 *    - Ejecutar como: "Yo (tu email)"
 *    - Quien tiene acceso: "Cualquier persona" (Anyone)
 * 7. Copiar la URL del Web App y usarla en el frontend
 * 
 * IMPORTANTE: Cada vez que modifiques el codigo, debes crear una NUEVA implementacion
 */

// ============================================
// CONFIGURACION GLOBAL
// ============================================

const SHEETS = {
  USUARIOS: 'Usuarios',
  CLIENTES: 'Clientes',
  COTIZACIONES: 'Cotizaciones',
  ITEMS_COTIZACION: 'ItemsCotizacion',
  PAGOS: 'Pagos',
  EVENTOS: 'Eventos',
  GALERIA: 'Galeria',
  CONFIG: 'Configuracion',
  PRECIOS: 'Precios'
};

// ============================================
// HANDLERS HTTP - CORS HABILITADO
// ============================================

/**
 * Maneja requests GET
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Maneja requests POST
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Procesa la request y devuelve respuesta JSON con CORS
 */
function handleRequest(e) {
  try {
    // Obtener action de parametros URL o del body
    const action = e.parameter.action;
    
    // Obtener datos del body si es POST
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // Si no es JSON valido, usar como string
        data = { raw: e.postData.contents };
      }
    }
    
    // Combinar parametros URL con data del body
    data = { ...e.parameter, ...data };
    
    let result;
    
    switch (action) {
      // ============ AUTH ============
      case 'login':
        result = login(data.pin_hash);
        break;
      case 'validateSession':
        result = { success: true, valid: true };
        break;
        
      // ============ CLIENTES ============
      case 'getClientes':
        result = getClientes();
        break;
      case 'getCliente':
        result = getCliente(data.id);
        break;
      case 'guardarCliente':
        result = guardarCliente(data);
        break;
      case 'eliminarCliente':
        result = eliminarCliente(data.id);
        break;
        
      // ============ COTIZACIONES ============
      case 'getCotizaciones':
        result = getCotizaciones();
        break;
      case 'getCotizacion':
        result = getCotizacion(data.id);
        break;
      case 'guardarCotizacion':
        result = guardarCotizacion(data);
        break;
      case 'eliminarCotizacion':
        result = eliminarCotizacion(data.id);
        break;
      case 'actualizarEstadoCotizacion':
        result = actualizarEstadoCotizacion(data.id, data.estado);
        break;
        
      // ============ PAGOS ============
      case 'getPagos':
        result = getPagos(data.cotizacion_id);
        break;
      case 'guardarPago':
        result = guardarPago(data);
        break;
        
      // ============ EVENTOS ============
      case 'getEventos':
        result = getEventos(data.fecha_inicio, data.fecha_fin);
        break;
      case 'guardarEvento':
        result = guardarEvento(data);
        break;
      case 'actualizarEstadoEvento':
        result = actualizarEstadoEvento(data.id, data.estado);
        break;
        
      // ============ GALERIA ============
      case 'getGaleria':
        result = getGaleria();
        break;
      case 'guardarFoto':
        result = guardarFoto(data);
        break;
        
      // ============ STATS ============
      case 'getStats':
        result = getDashboardStats();
        break;
        
      // ============ CONFIG ============
      case 'getConfig':
        result = getConfig();
        break;
      case 'guardarConfig':
        result = guardarConfig(data);
        break;
        
      // ============ INIT ============
      case 'init':
        result = inicializarHojas();
        break;
        
      default:
        result = { success: false, error: 'Accion no reconocida: ' + action };
    }
    
    return createJsonResponse(result);
    
  } catch (error) {
    return createJsonResponse({ 
      success: false, 
      error: error.toString(),
      stack: error.stack 
    });
  }
}

/**
 * Crea respuesta JSON con headers CORS
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// INICIALIZACION
// ============================================

/**
 * Ejecutar esta funcion UNA VEZ para crear las hojas
 */
function inicializarHojas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetsToCreate = [
    { 
      name: SHEETS.USUARIOS, 
      headers: ['id', 'nombre', 'email', 'telefono', 'pin_hash', 'rol', 'activo', 'created_at', 'last_login'] 
    },
    { 
      name: SHEETS.CLIENTES, 
      headers: ['id', 'tipo_persona', 'nombre', 'cedula', 'rnc', 'telefono', 'email', 'direccion', 'sector', 'ciudad', 'tipo_cliente', 'notas', 'total_facturado', 'created_at', 'updated_at'] 
    },
    { 
      name: SHEETS.COTIZACIONES, 
      headers: ['id', 'numero', 'fecha', 'fecha_validez', 'cliente_id', 'proyecto', 'estado', 'subtotal_materiales', 'instalacion_incluida', 'instalacion', 'subtotal_general', 'descuento_porcentaje', 'descuento', 'base_imponible', 'itbis', 'total', 'total_m2', 'vendedor_id', 'vendedor', 'validez_dias', 'notas', 'created_at', 'updated_at'] 
    },
    { 
      name: SHEETS.ITEMS_COTIZACION, 
      headers: ['id', 'cotizacion_id', 'tipo_producto', 'descripcion', 'ancho', 'alto', 'cantidad', 'precio_unitario', 'total', 'color', 'vidrio', 'detalles_json', 'created_at'] 
    },
    { 
      name: SHEETS.PAGOS, 
      headers: ['id', 'cotizacion_id', 'monto', 'fecha', 'metodo', 'referencia', 'banco', 'notas', 'created_at'] 
    },
    { 
      name: SHEETS.EVENTOS, 
      headers: ['id', 'titulo', 'tipo', 'fecha', 'hora_inicio', 'hora_fin', 'cotizacion_id', 'cliente_id', 'direccion', 'estado', 'notas', 'created_at'] 
    },
    { 
      name: SHEETS.GALERIA, 
      headers: ['id', 'titulo', 'descripcion', 'tipo_trabajo', 'url', 'cotizacion_id', 'fecha', 'destacado', 'created_at'] 
    },
    { 
      name: SHEETS.CONFIG, 
      headers: ['clave', 'valor', 'descripcion'] 
    },
    { 
      name: SHEETS.PRECIOS, 
      headers: ['codigo', 'descripcion', 'categoria', 'unidad', 'precio', 'activo'] 
    }
  ];
  
  sheetsToCreate.forEach(config => {
    let sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }
    // Siempre actualizar headers
    sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
    sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  });
  
  // Crear usuario admin por defecto
  crearUsuarioAdmin();
  
  return { success: true, message: 'Hojas inicializadas correctamente' };
}

/**
 * Crea usuario admin con PIN 1234
 */
function crearUsuarioAdmin() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  const data = getSheetData(SHEETS.USUARIOS);
  
  // Verificar si ya existe un admin
  const adminExists = data.some(row => row.rol === 'admin');
  if (adminExists) return;
  
  // PIN 1234 hasheado con SHA-256
  const pinHash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
  
  const newAdmin = [
    generateId(),           // id
    'Administrador',        // nombre
    'admin@aluminiord.com', // email
    '809-000-0000',        // telefono
    pinHash,               // pin_hash (1234)
    'admin',               // rol
    true,                  // activo
    new Date().toISOString(), // created_at
    ''                     // last_login
  ];
  
  sheet.appendRow(newAdmin);
}

// ============================================
// UTILIDADES
// ============================================

function generateId() {
  return Utilities.getUuid();
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function findRowIndex(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return i + 1; // +1 porque getRange usa 1-based index
    }
  }
  return -1;
}

// ============================================
// AUTH
// ============================================

function login(pinHash) {
  const usuarios = getSheetData(SHEETS.USUARIOS);
  const usuario = usuarios.find(u => u.pin_hash === pinHash && u.activo);
  
  if (!usuario) {
    return { success: false, error: 'PIN incorrecto o usuario inactivo' };
  }
  
  // Actualizar last_login
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.USUARIOS);
  const rowIndex = findRowIndex(SHEETS.USUARIOS, usuario.id);
  if (rowIndex > 0) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lastLoginCol = headers.indexOf('last_login') + 1;
    if (lastLoginCol > 0) {
      sheet.getRange(rowIndex, lastLoginCol).setValue(new Date().toISOString());
    }
  }
  
  // No devolver el pin_hash
  delete usuario.pin_hash;
  
  return { 
    success: true, 
    usuario: usuario,
    token: generateId() // Token simple para esta sesion
  };
}

// ============================================
// CLIENTES
// ============================================

function getClientes() {
  const clientes = getSheetData(SHEETS.CLIENTES);
  return { success: true, data: clientes };
}

function getCliente(id) {
  const clientes = getSheetData(SHEETS.CLIENTES);
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) {
    return { success: false, error: 'Cliente no encontrado' };
  }
  return { success: true, data: cliente };
}

function guardarCliente(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CLIENTES);
  const now = new Date().toISOString();
  
  if (data.id) {
    // Actualizar existente
    const rowIndex = findRowIndex(SHEETS.CLIENTES, data.id);
    if (rowIndex < 0) {
      return { success: false, error: 'Cliente no encontrado' };
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    
    // Actualizar campos
    headers.forEach((header, i) => {
      if (data[header] !== undefined && header !== 'id' && header !== 'created_at') {
        currentRow[i] = data[header];
      }
    });
    
    // Actualizar updated_at
    const updatedAtIndex = headers.indexOf('updated_at');
    if (updatedAtIndex >= 0) currentRow[updatedAtIndex] = now;
    
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([currentRow]);
    
    const clienteActualizado = {};
    headers.forEach((h, i) => clienteActualizado[h] = currentRow[i]);
    
    return { success: true, data: clienteActualizado };
  } else {
    // Crear nuevo
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => {
      if (header === 'id') return generateId();
      if (header === 'created_at') return now;
      if (header === 'updated_at') return now;
      if (header === 'total_facturado') return 0;
      return data[header] || '';
    });
    
    sheet.appendRow(newRow);
    
    const nuevoCliente = {};
    headers.forEach((h, i) => nuevoCliente[h] = newRow[i]);
    
    return { success: true, data: nuevoCliente };
  }
}

function eliminarCliente(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CLIENTES);
  const rowIndex = findRowIndex(SHEETS.CLIENTES, id);
  
  if (rowIndex < 0) {
    return { success: false, error: 'Cliente no encontrado' };
  }
  
  sheet.deleteRow(rowIndex);
  return { success: true };
}

// ============================================
// COTIZACIONES
// ============================================

function getCotizaciones() {
  const cotizaciones = getSheetData(SHEETS.COTIZACIONES);
  const clientes = getSheetData(SHEETS.CLIENTES);
  
  // Adjuntar datos del cliente a cada cotizacion
  const result = cotizaciones.map(cot => {
    const cliente = clientes.find(c => c.id === cot.cliente_id);
    return { ...cot, cliente: cliente || null };
  });
  
  return { success: true, data: result };
}

function getCotizacion(id) {
  const cotizaciones = getSheetData(SHEETS.COTIZACIONES);
  const cotizacion = cotizaciones.find(c => c.id === id);
  
  if (!cotizacion) {
    return { success: false, error: 'Cotizacion no encontrada' };
  }
  
  // Obtener items
  const items = getSheetData(SHEETS.ITEMS_COTIZACION).filter(i => i.cotizacion_id === id);
  
  // Obtener cliente
  const clientes = getSheetData(SHEETS.CLIENTES);
  const cliente = clientes.find(c => c.id === cotizacion.cliente_id);
  
  // Obtener pagos
  const pagos = getSheetData(SHEETS.PAGOS).filter(p => p.cotizacion_id === id);
  
  return { 
    success: true, 
    data: { 
      ...cotizacion, 
      cliente,
      elementos: items,
      pagos
    } 
  };
}

function guardarCotizacion(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);
  const now = new Date().toISOString();
  
  if (data.id) {
    // Actualizar existente
    const rowIndex = findRowIndex(SHEETS.COTIZACIONES, data.id);
    if (rowIndex < 0) {
      return { success: false, error: 'Cotizacion no encontrada' };
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    
    headers.forEach((header, i) => {
      if (data[header] !== undefined && header !== 'id' && header !== 'created_at') {
        currentRow[i] = data[header];
      }
    });
    
    const updatedAtIndex = headers.indexOf('updated_at');
    if (updatedAtIndex >= 0) currentRow[updatedAtIndex] = now;
    
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([currentRow]);
    
    // Guardar items si vienen
    if (data.elementos && Array.isArray(data.elementos)) {
      guardarItemsCotizacion(data.id, data.elementos);
    }
    
    const cotizacionActualizada = {};
    headers.forEach((h, i) => cotizacionActualizada[h] = currentRow[i]);
    
    return { success: true, data: cotizacionActualizada };
  } else {
    // Crear nueva
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newId = generateId();
    const numero = generarNumeroCotizacion();
    
    const newRow = headers.map(header => {
      if (header === 'id') return newId;
      if (header === 'numero') return numero;
      if (header === 'created_at') return now;
      if (header === 'updated_at') return now;
      if (header === 'estado') return data.estado || 'borrador';
      return data[header] || '';
    });
    
    sheet.appendRow(newRow);
    
    // Guardar items si vienen
    if (data.elementos && Array.isArray(data.elementos)) {
      guardarItemsCotizacion(newId, data.elementos);
    }
    
    const nuevaCotizacion = {};
    headers.forEach((h, i) => nuevaCotizacion[h] = newRow[i]);
    
    return { success: true, data: nuevaCotizacion };
  }
}

function generarNumeroCotizacion() {
  const year = new Date().getFullYear();
  const cotizaciones = getSheetData(SHEETS.COTIZACIONES);
  const thisYear = cotizaciones.filter(c => c.numero && c.numero.includes(year.toString()));
  const nextNum = thisYear.length + 1;
  return `COT-${year}-${String(nextNum).padStart(4, '0')}`;
}

function guardarItemsCotizacion(cotizacionId, elementos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ITEMS_COTIZACION);
  
  // Eliminar items anteriores
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][1] === cotizacionId) { // columna cotizacion_id
      sheet.deleteRow(i + 1);
    }
  }
  
  // Insertar nuevos
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const now = new Date().toISOString();
  
  elementos.forEach(elem => {
    const newRow = headers.map(header => {
      if (header === 'id') return generateId();
      if (header === 'cotizacion_id') return cotizacionId;
      if (header === 'created_at') return now;
      if (header === 'detalles_json') return JSON.stringify(elem.detalles || {});
      return elem[header] || '';
    });
    sheet.appendRow(newRow);
  });
}

function eliminarCotizacion(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);
  const rowIndex = findRowIndex(SHEETS.COTIZACIONES, id);
  
  if (rowIndex < 0) {
    return { success: false, error: 'Cotizacion no encontrada' };
  }
  
  sheet.deleteRow(rowIndex);
  
  // Tambien eliminar items
  const itemsSheet = ss.getSheetByName(SHEETS.ITEMS_COTIZACION);
  const itemsData = itemsSheet.getDataRange().getValues();
  for (let i = itemsData.length - 1; i > 0; i--) {
    if (itemsData[i][1] === id) {
      itemsSheet.deleteRow(i + 1);
    }
  }
  
  return { success: true };
}

function actualizarEstadoCotizacion(id, estado) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);
  const rowIndex = findRowIndex(SHEETS.COTIZACIONES, id);
  
  if (rowIndex < 0) {
    return { success: false, error: 'Cotizacion no encontrada' };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const estadoCol = headers.indexOf('estado') + 1;
  const updatedAtCol = headers.indexOf('updated_at') + 1;
  
  if (estadoCol > 0) sheet.getRange(rowIndex, estadoCol).setValue(estado);
  if (updatedAtCol > 0) sheet.getRange(rowIndex, updatedAtCol).setValue(new Date().toISOString());
  
  return { success: true };
}

// ============================================
// PAGOS
// ============================================

function getPagos(cotizacionId) {
  const pagos = getSheetData(SHEETS.PAGOS);
  const filtered = cotizacionId ? pagos.filter(p => p.cotizacion_id === cotizacionId) : pagos;
  return { success: true, data: filtered };
}

function guardarPago(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PAGOS);
  const now = new Date().toISOString();
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => {
    if (header === 'id') return generateId();
    if (header === 'created_at') return now;
    return data[header] || '';
  });
  
  sheet.appendRow(newRow);
  
  const nuevoPago = {};
  headers.forEach((h, i) => nuevoPago[h] = newRow[i]);
  
  return { success: true, data: nuevoPago };
}

// ============================================
// EVENTOS / CALENDARIO
// ============================================

function getEventos(fechaInicio, fechaFin) {
  const eventos = getSheetData(SHEETS.EVENTOS);
  // Filtrar por rango de fechas si se proporciona
  let filtered = eventos;
  if (fechaInicio && fechaFin) {
    filtered = eventos.filter(e => {
      const fecha = new Date(e.fecha);
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
    });
  }
  return { success: true, data: filtered };
}

function guardarEvento(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EVENTOS);
  const now = new Date().toISOString();
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => {
    if (header === 'id') return generateId();
    if (header === 'created_at') return now;
    if (header === 'estado') return 'pendiente';
    return data[header] || '';
  });
  
  sheet.appendRow(newRow);
  
  const nuevoEvento = {};
  headers.forEach((h, i) => nuevoEvento[h] = newRow[i]);
  
  return { success: true, data: nuevoEvento };
}

function actualizarEstadoEvento(id, estado) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EVENTOS);
  const rowIndex = findRowIndex(SHEETS.EVENTOS, id);
  
  if (rowIndex < 0) {
    return { success: false, error: 'Evento no encontrado' };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const estadoCol = headers.indexOf('estado') + 1;
  
  if (estadoCol > 0) sheet.getRange(rowIndex, estadoCol).setValue(estado);
  
  return { success: true };
}

// ============================================
// GALERIA
// ============================================

function getGaleria() {
  const fotos = getSheetData(SHEETS.GALERIA);
  return { success: true, data: fotos };
}

function guardarFoto(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GALERIA);
  const now = new Date().toISOString();
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => {
    if (header === 'id') return generateId();
    if (header === 'created_at') return now;
    return data[header] || '';
  });
  
  sheet.appendRow(newRow);
  
  const nuevaFoto = {};
  headers.forEach((h, i) => nuevaFoto[h] = newRow[i]);
  
  return { success: true, data: nuevaFoto };
}

// ============================================
// DASHBOARD STATS
// ============================================

function getDashboardStats() {
  const cotizaciones = getSheetData(SHEETS.COTIZACIONES);
  const pagos = getSheetData(SHEETS.PAGOS);
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // Cotizaciones este mes
  const cotizacionesMes = cotizaciones.filter(c => {
    const fecha = new Date(c.created_at);
    return fecha >= startOfMonth;
  });
  
  // Cotizaciones mes anterior
  const cotizacionesMesAnterior = cotizaciones.filter(c => {
    const fecha = new Date(c.created_at);
    return fecha >= startOfLastMonth && fecha <= endOfLastMonth;
  });
  
  // Total ventas mes
  const totalMes = cotizacionesMes
    .filter(c => c.estado === 'aprobada' || c.estado === 'produccion' || c.estado === 'instalada')
    .reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);
  
  const totalMesAnterior = cotizacionesMesAnterior
    .filter(c => c.estado === 'aprobada' || c.estado === 'produccion' || c.estado === 'instalada')
    .reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);
  
  // Cotizaciones activas (no vencidas, no rechazadas)
  const activas = cotizaciones.filter(c => 
    ['borrador', 'enviada', 'aprobada', 'produccion'].includes(c.estado)
  ).length;
  
  // M2 vendidos
  const m2Mes = cotizacionesMes
    .filter(c => c.estado === 'aprobada' || c.estado === 'produccion' || c.estado === 'instalada')
    .reduce((sum, c) => sum + (parseFloat(c.total_m2) || 0), 0);
  
  // Tasa conversion
  const aprobadas = cotizacionesMes.filter(c => 
    ['aprobada', 'produccion', 'instalada'].includes(c.estado)
  ).length;
  const conversion = cotizacionesMes.length > 0 
    ? Math.round((aprobadas / cotizacionesMes.length) * 100) 
    : 0;
  
  return {
    success: true,
    data: {
      total_mes: totalMes,
      total_mes_cambio: totalMesAnterior > 0 
        ? Math.round(((totalMes - totalMesAnterior) / totalMesAnterior) * 100) 
        : 0,
      cotizaciones_activas: activas,
      cotizaciones_cambio: cotizacionesMes.length - cotizacionesMesAnterior.length,
      tasa_conversion: conversion,
      conversion_cambio: 0,
      m2_vendidos: Math.round(m2Mes * 10) / 10,
      m2_cambio: 0
    }
  };
}

// ============================================
// CONFIGURACION
// ============================================

function getConfig() {
  const config = getSheetData(SHEETS.CONFIG);
  const configObj = {};
  config.forEach(row => {
    configObj[row.clave] = row.valor;
  });
  return { success: true, data: configObj };
}

function guardarConfig(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CONFIG);
  
  Object.keys(data).forEach(clave => {
    if (clave === 'action') return; // Ignorar el action
    
    const configData = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < configData.length; i++) {
      if (configData[i][0] === clave) {
        sheet.getRange(i + 1, 2).setValue(data[clave]);
        found = true;
        break;
      }
    }
    
    if (!found) {
      sheet.appendRow([clave, data[clave], '']);
    }
  });
  
  return { success: true };
}
