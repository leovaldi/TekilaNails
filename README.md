# Tekila Nails 💅

**Tekila Nails** es una aplicación web moderna y de alta gama diseñada exclusivamente para el salón de manicuría de **Rocío Mena** en Maipú, Mendoza. Construida con tecnologías modernas, la plataforma ofrece una experiencia premium tanto para la dueña como para sus clientas.

## 🌟 ¿Qué hace esta página y para qué sirve?

Esta página web funciona como una **vidriera virtual y un sistema automatizado de reservas**. Sus principales propósitos son:
1. **Mostrar los Servicios:** Exhibe un catálogo interactivo de los servicios ofrecidos (ej. Kapping, Esculpidas, Esmaltado Semipermanente) con sus respectivos precios, descripciones y fotos de los trabajos.
2. **Gestionar Turnos:** Permite a las clientas visualizar los días y horarios disponibles en tiempo real y seleccionar el turno que mejor se adapte a su agenda.
3. **Cobro de Seña Automático:** Integra un sistema de pagos (Mercado Pago) para cobrar el 50% del valor del servicio a modo de seña, asegurando el compromiso de asistencia.

## 🛠️ ¿Qué problema soluciona?

Antes de esta plataforma, el proceso de reserva solía ser manual y tedioso:
- **Adiós a los mensajes interminables:** Soluciona el problema de perder tiempo enviando mensajes por WhatsApp para coordinar "qué día tenés libre" o "cuánto sale esto". Toda la información está a la vista de la clienta.
- **Reducción de ausentismos (No-shows):** Al requerir el pago de una seña obligatoria antes de confirmar el turno por el sistema, se reduce drásticamente el porcentaje de clientas que reservan un horario y luego no asisten, protegiendo así el tiempo y los ingresos de la profesional.
- **Imagen Profesional:** Eleva el estatus del salón reemplazando un simple perfil de Instagram o mensajes por una plataforma sólida, fluida y con animaciones de alta gama.

## ⚙️ ¿Cómo funciona?

El flujo de uso de la aplicación está pensado para ser rápido y orientado a dispositivos móviles (Mobile First):

1. **Exploración:** La clienta ingresa y es recibida con una estética premium. Desliza para leer la biografía de Rocío o para ver el **Carrusel de Servicios**.
2. **Selección del Servicio:** Al elegir un servicio, se abre un modal de reserva. Aquí puede especificar si necesita un servicio adicional (como retiro de material de otro salón, que modifica el precio).
3. **Selección de Horario:** La aplicación se conecta con la base de datos para traer automáticamente los horarios que están **disponibles** a futuro.
4. **Datos y Pago:** La clienta ingresa su nombre y WhatsApp. Seguidamente el sistema calcula la seña (50% + recargo de plataforma).
5. **Confirmación:** Al hacer clic en "Pagar y Reservar", la plataforma se comunica con una API segura y redirige a la clienta a **Mercado Pago** para abonar. Una vez pagada la seña, el turno queda formalmente asignado en el sistema.

## 🚀 Tecnologías y Arquitectura

- **Frontend:** [Next.js](https://nextjs.org/) (App Router) y React.
- **Estilos y Animaciones:** [Tailwind CSS](https://tailwindcss.com/) combinado con [Framer Motion](https://www.framer.com/motion/) para lograr transiciones y micro-interacciones suaves y profesionales.
- **Base de Datos y Backend:** [Supabase](https://supabase.com/) (PostgreSQL). Actúa como el motor principal guardando turnos, información de reservas y configuración del perfil.
- **Pasarela de Pago:** [Mercado Pago SDK](https://www.mercadopago.com.ar/developers) integrado a través de un endpoint en `/api/checkout`.

---
*Diseñado y desarrollado para ofrecer la mejor experiencia en reservas de estética.*
