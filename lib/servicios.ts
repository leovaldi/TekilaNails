export const SERVICIOS_BASE = [
    {
    id: 'ayuda',
    nombre: 'No sé qué hacerme / Asesoría',
    descripcion: '¿Dudas con el diseño o técnica? Reservá tu lugar con una seña mínima y Rocío se contactará con vos para asesorarte y definir el servicio ideal.',
    precio: 10000, // Seña base de 5000 + comisión
    duracion: 30,
    foto: '/trabajo1.png'
  },
  {
    id: 'esmaltado',
    nombre: 'Esmaltado Permanente',
    descripcion: 'Color impecable sobre tu uña natural. Ideal si buscás prolijidad y brillo duradero.',
    precio: 11000,
    duracion: 60,
    foto: '/trabajo1.png' // Agregamos el campo foto
  },
  {
    id: 'capping-gel',
    nombre: 'Capping Gel',
    descripcion: 'Refuerzo de gel sobre tu uña para evitar que se quiebre. Incluye esmaltado.',
    precio: 14000,
    duracion: 90,
    foto: '/trabajo2.png'
  },
  {
    id: 'esculpidas-soft',
    nombre: 'Esculpidas Soft Gel',
    descripcion: 'Extensión con sistema Soft Gel, resultado natural y ligero.',
    precio: 17500,
    duracion: 120,
    foto: '/trabajo3.png'
  }
];

export const OPCIONES_RETIRO = [
  { id: 'mio', nombre: 'Retiro Tekila (Hecho por mí)', precio: 3800 },
  { id: 'otro', nombre: 'Retiro de otra colega', precio: 5000 }
];