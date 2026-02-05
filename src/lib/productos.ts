import type { ProductoConfig, TipoProducto } from './types'

export const PRODUCTOS: Record<TipoProducto, ProductoConfig> = {
  ventana_corrediza_2h: {
    nombre: 'Ventana Corrediza 2 Hojas',
    categoria: 'ventanas',
    sistemas: ['Serie 300', 'Serie 400', 'Serie 600'],
    vidrios: ['4mm transparente', '6mm transparente', '6mm templado', '8mm templado', '6mm bronce', '8mm reflectivo'],
    accesorios_obligatorios: ['rodamientos', 'cerradura', 'felpa', 'tornillos', 'silicon'],
    accesorios_opcionales: ['mosquitero', 'reja_seguridad']
  },
  ventana_proyectante: {
    nombre: 'Ventana Proyectante/Abatible',
    categoria: 'ventanas',
    sistemas: ['Serie 300', 'Serie 400', 'Serie 500'],
    vidrios: ['4mm transparente', '6mm transparente', '6mm templado', '8mm templado'],
    accesorios_obligatorios: ['brazos_proyeccion', 'bisagras', 'cerradura', 'felpa']
  },
  ventana_fija: {
    nombre: 'Ventana Fija',
    categoria: 'ventanas',
    sistemas: ['Serie 300', 'Serie 400'],
    vidrios: ['4mm transparente', '6mm transparente', '6mm templado', '8mm templado', '6mm bronce'],
    accesorios_obligatorios: ['silicon_estructural', 'tacos_apoyo']
  },
  ventana_celosia: {
    nombre: 'Ventana de Celosia',
    categoria: 'ventanas',
    sistemas: ['Estandar'],
    vidrios: ['4mm transparente', '6mm transparente'],
    accesorios_obligatorios: ['paletas_vidrio', 'mecanismo_operacion', 'soportes']
  },
  puerta_corrediza_2h: {
    nombre: 'Puerta Corrediza 2 Hojas',
    categoria: 'puertas',
    sistemas: ['Serie 450', 'Serie 600', 'Serie 700'],
    vidrios: ['6mm templado', '8mm templado', '10mm templado', '8mm laminado'],
    accesorios_obligatorios: ['rodamientos_heavy_duty', 'cerradura_embutir', 'jaladores', 'felpa', 'tope_inferior']
  },
  puerta_abatible: {
    nombre: 'Puerta Abatible',
    categoria: 'puertas',
    sistemas: ['Serie 450', 'Serie 600'],
    vidrios: ['6mm templado', '8mm templado', '10mm templado'],
    accesorios_obligatorios: ['bisagras_heavy_duty', 'cerradura_embutir', 'cierra_puertas', 'manija_llave']
  },
  puerta_plegable: {
    nombre: 'Puerta Plegable/Acordeon',
    categoria: 'puertas',
    sistemas: ['Premium'],
    vidrios: ['6mm templado', '8mm templado'],
    accesorios_obligatorios: ['riel_superior', 'guia_inferior', 'bisagras_articuladas', 'rodamientos']
  },
  mampara_corrediza: {
    nombre: 'Mampara Bano Corrediza',
    categoria: 'mamparas',
    sistemas: ['Estandar cromado', 'Premium inoxidable'],
    vidrios: ['6mm templado transparente', '6mm templado esmerilado', '8mm templado'],
    accesorios_obligatorios: ['riel_superior_cromado', 'riel_inferior_drenaje', 'rodamientos_inox', 'jalador', 'sello_inferior']
  },
  mampara_batiente: {
    nombre: 'Mampara Batiente',
    categoria: 'mamparas',
    sistemas: ['Estandar cromado', 'Premium inoxidable'],
    vidrios: ['6mm templado transparente', '6mm templado esmerilado', '8mm templado'],
    accesorios_obligatorios: ['bisagras_inoxidables', 'manija', 'iman_cierre', 'sello_magnetico']
  },
  mampara_walk_in: {
    nombre: 'Mampara Fija Walk-in',
    categoria: 'mamparas',
    sistemas: ['Premium inoxidable'],
    vidrios: ['8mm templado', '10mm templado'],
    accesorios_obligatorios: ['perfil_pared', 'barra_estabilizadora', 'herrajes_cromados']
  },
  division_oficina: {
    nombre: 'Division de Oficina',
    categoria: 'otros',
    sistemas: ['Sistema modular'],
    vidrios: ['6mm transparente', '6mm templado', '8mm templado'],
    accesorios_obligatorios: ['postes_verticales', 'travesanos', 'tapajuntas', 'silicon_estructural']
  },
  celosia_aluminio: {
    nombre: 'Celosias de Aluminio',
    categoria: 'otros',
    sistemas: ['4 pulgadas', '6 pulgadas', '8 pulgadas'],
    vidrios: [],
    accesorios_obligatorios: ['perfiles_marco', 'paletas', 'soportes']
  }
}

export const COLORES_PERFIL = ['Natural', 'Blanco', 'Bronce', 'Negro', 'Champagne']

export const CATEGORIAS = {
  ventanas: { nombre: 'Ventanas', icono: 'Window' },
  puertas: { nombre: 'Puertas', icono: 'DoorOpen' },
  mamparas: { nombre: 'Mamparas', icono: 'Bath' },
  otros: { nombre: 'Otros', icono: 'Grid3X3' }
}

export function getProductosPorCategoria(categoria: string): [TipoProducto, ProductoConfig][] {
  return Object.entries(PRODUCTOS).filter(
    ([, config]) => config.categoria === categoria
  ) as [TipoProducto, ProductoConfig][]
}
