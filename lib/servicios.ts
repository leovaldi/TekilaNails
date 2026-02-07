// lib/servicios.ts

/**
 * Mantenemos solo las opciones de retiro aquí ya que son constantes 
 * que se suman al servicio principal traído desde la base de datos.
 */
export const OPCIONES_RETIRO = [
  { 
    id: 'mio', 
    nombre: 'Retiro Tekila (Hecho por mí)', 
    precio: 3800 
  },
  { 
    id: 'otro', 
    nombre: 'Retiro de otra colega', 
    precio: 5000 
  }
];