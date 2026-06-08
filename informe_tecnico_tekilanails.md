# Informe Técnico — Tekila Nails

## 1. Resumen Ejecutivo

Tekila Nails es una **aplicación web full-stack** de gestión de turnos y pagos online para un estudio de manicuría de alta gama ubicado en Maipú, Mendoza (Argentina). El sistema permite a los clientes explorar servicios, reservar un turno y pagar una seña en tiempo real mediante Mercado Pago. Al confirmarse el pago, el sistema sincroniza automáticamente el turno en Google Calendar, bloquea el horario en la base de datos, notifica a la dueña vía email (Resend) y Telegram, y redirige al cliente a una página de confirmación. Paralelamente, existe un panel de administración privado desde el cual la dueña gestiona toda la operación.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework Web | **Next.js** | 16.1.6 |
| Lenguaje | **TypeScript** | ^5 |
| UI Runtime | **React** | 19.2.3 |
| Estilos | **Tailwind CSS** | ^4 (via PostCSS) |
| Base de Datos / Auth / Storage | **Supabase** | @supabase/supabase-js ^2.94 |
| Animaciones | **Framer Motion** | ^12.31 |
| Carrusel | **Embla Carousel** | ^8.6 |
| Íconos | **Lucide React** + **React Icons** | ^0.563 / ^5.5 |
| Pasarela de Pagos | **Mercado Pago SDK** | ^2.12 |
| Calendar API | **Google APIs (googleapis)** | ^171.2 |
| Email Transaccional | **Resend** | ^6.9 |
| Tipografía | Google Fonts: **Inter** + **Playfair Display** | (vía next/font) |
| Deployment target | **Vercel** | (env config lista) |
| PWA | manifest.json + icon-192x192.png | básico |

---

## 3. Arquitectura General

```
TekilaNails/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout global (fonts, glow, meta)
│   ├── globals.css             # Design system tokens (Tailwind @theme)
│   ├── page.tsx                # Landing page principal (Client Component)
│   ├── reserva-confirmada/
│   │   └── page.tsx            # Página post-pago (callback MP)
│   ├── admin/
│   │   ├── page.tsx            # Panel de administración (auth + tabs)
│   │   └── components/
│   │       ├── ReservasTab.tsx
│   │       ├── ServiciosTab.tsx
│   │       ├── HorariosTab.tsx
│   │       ├── ManualReservasTab.tsx
│   │       └── AdminAvatarUpload.tsx
│   └── api/
│       ├── calendar/route.ts   # POST: Calendar + Supabase + Email + Telegram
│       └── checkout/route.ts   # POST: Mercado Pago preference
├── components/
│   ├── BookingFlow.tsx         # Wizard de reserva (2 pasos)
│   ├── CarruselServicios.tsx   # Embla carousel de servicios
│   ├── Button.tsx              # PrimaryButton reutilizable
│   ├── ThemeToggle.tsx         # Toggle dark/light mode
│   └── sections/
│       ├── Hero.tsx
│       ├── Biography.tsx
│       ├── Methodology.tsx
│       ├── SupportModal.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase.ts             # Singleton client (anon key)
│   ├── google.ts               # Google Calendar auth JWT (sin uso activo)
│   └── servicios.ts            # Constantes: OPCIONES_RETIRO
└── public/
    ├── logo.png / logoB.png / logoN.png
    ├── icon-192x192.png
    └── manifest.json
```

### Patrón de Routing
El proyecto usa el **App Router** de Next.js 13+. Todas las páginas de usuario son **Client Components** (`'use client'`), excepto las API Routes que corren en el **Node.js edge server-side**. No se usa `use server` ni Server Components explícitos.

---

## 4. Variables de Entorno (`.env.local`)

| Variable | Propósito |
|---|---|
| `GOOGLE_CLIENT_ID / SECRET` | OAuth2 para Google Calendar |
| `GOOGLE_REFRESH_TOKEN` | Token de larga duración para Calendar |
| `GOOGLE_CALENDAR_ID` | ID del calendario destino (actualmente `primary`) |
| `MP_ACCESS_TOKEN` | Token privado de Mercado Pago (server-side) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Clave pública MP (expuesta al cliente) |
| `NEXT_PUBLIC_BASE_URL` | URL base para back_urls de MP |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `ADMIN_PASSWORD` | Contraseña en texto plano en env (redundante con RPC) |
| `NEXT_PUBLIC_WHATSAPP_ROCIO` | Número WhatsApp de la dueña |
| `RESEND_API_KEY` | Clave para envío de emails |
| `EMAIL_ROCIO` | Email destino de notificaciones |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `TELEGRAM_CHAT_ID` | ID del chat de Telegram destino |

> ⚠️ El `.env.local` contiene **credenciales reales** (tokens de producción de MP, Telegram, Google). No está en `.gitignore` explícitamente para secretos. Requiere revisión en el despliegue.

---

## 5. Base de Datos (Supabase / PostgreSQL)

### Tablas inferidas del código

#### `servicios`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer (PK) | Auto-incremental |
| `nombre` | text | Nombre del servicio |
| `precio` | integer | Precio en ARS |
| `descripcion` | text | Descripción larga |
| `foto_url` | text | URL pública en Supabase Storage |
| `orden` | integer | Posición en el carrusel (nullable) |

#### `horarios_disponibles`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer (PK) | Auto-incremental |
| `dia_hora` | timestamptz | Fecha y hora del turno |
| `estado` | text | `'disponible'` / `'reservado'` |

#### `reservas`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | UUID auto-generado |
| `servicio_id` | integer (FK → servicios) | |
| `horario_id` | integer (FK → horarios_disponibles) | |
| `nombre_cliente` | text | |
| `whatsapp_cliente` | text | Número limpio (solo dígitos) |
| `monto_senia` | integer | Monto de la seña pagada |
| `estado_pago` | text | `'pendiente'` / `'aprobado'` |
| `payment_id` | text | ID de pago de MP (o `'MANUAL-timestamp'`) |
| `created_at` | timestamptz | Auto |

#### `perfil`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer (PK, = 1) | Singleton row |
| `biografia` | text | Texto editable desde admin |

### Stored Procedures (RPC)
- **`verificar_admin_password(password_intento)`** → `boolean`: Compara la contraseña hasheada almacenada en la BD con el intento del login.
- **`actualizar_admin_password(nueva_password)`** → genera nuevo hash y actualiza.

### Supabase Storage
- **Bucket `fotos-servicios`**: almacena imágenes de servicios con nombres aleatorios (`Math.random().ext`) y la foto de perfil en la ruta fija `biografia/foto-perfil.jpg`.

### next.config.ts — Remote Images
```ts
remotePatterns: [{
  protocol: 'https',
  hostname: 'eqtmrqzgibmpincgksej.supabase.co',
  pathname: '/storage/v1/object/public/**'
}]
```
Habilita `next/image` para optimizar imágenes de Supabase Storage.

---

## 6. Design System & Estilos

### Paleta de Colores (definida en `globals.css` con `@theme inline`)
```css
--color-tekila-dark:  #000000
--color-tekila-pink:  #FF0080   /* Rosa neón principal */
--color-tekila-light: #FF99CC   /* Rosa pastel */
--color-tekila-white: #FFFFFF
--color-tekila-gray:  #666666
--background: #FFFFFF (light) / #0a0a0a (dark)
--foreground: #111111 (light) / #FFFFFF (dark)
```

### Tipografía
- **`--font-sans`** = Inter (body, UI labels)
- **`--font-heading`** = Playfair Display (h1–h4, `.italic.font-light`)
- Ambas cargadas via `next/font/google` con variables CSS

### Técnicas visuales aplicadas
- **Glassmorphism**: Carrusel usa `dark:backdrop-blur-md` + gradientes `from-white/5`
- **Glow effect global**: Dos `div` fixed con `blur-[120px]` en los corners del layout
- **Conic gradient animado** en bordes de cards (política, RRSS, Hero button)
- **`mix-blend-screen`** en los glows del root layout
- **`clamp()`** extensivo para tipografía fluida responsive
- **Scrollbar personalizado**: 5px, `#FF99CC`, borderless track
- **Micro-animaciones**: Framer Motion en Hero, Biography, Methodology, Carousel

---

## 7. Flujo Completo de Reserva (User Journey)

```
1. Landing (page.tsx)
   └─ useEffect → supabase.from('servicios').select('*').order('orden')
   └─ Renderiza CarruselServicios

2. Usuario selecciona servicio
   └─ setSelectedService(s) + setShowModal(true)
   └─ Modal AnimatePresence aparece con scale + opacity

3. Modal: Selección de "retiro previo"
   └─ OPCIONES_RETIRO (constante local): none / mio (+$3800) / otro (+$5000)
   └─ Lógica de precio:
        total = precio_servicio + precio_retiro
        seña  = total / 2
        final = ceil(seña / (1 - 0.0773))  ← absorbe comisión MP del 7.73%

4. BookingFlow — Paso 1: Selección de horario
   └─ useEffect → supabase.from('horarios_disponibles')
        .select('*').eq('estado','disponible').order('dia_hora')
   └─ Filtra: new Date(h.dia_hora) > ahora
   └─ useMemo: agrupa por mes → por día → array de turnos
   └─ UI: Acordeón mes → acordeón día → botones de hora

5. BookingFlow — Paso 2: Datos del cliente + Pago
   └─ Validación: nombre (3–35 chars), whatsapp (10–15 dígitos)
   └─ INSERT en 'reservas' con estado_pago='pendiente'
   └─ fetch('/api/checkout') → MP Preference
   └─ window.location.href = init_point  (redirect a MP)

6. API /api/checkout (route.ts)
   └─ MercadoPagoConfig + Preference.create()
   └─ items: [{ id: reservaId, title: nombreServicio, unit_price: monto }]
   └─ back_urls: success=/reserva-confirmada, failure=/, pending=/
   └─ payment_methods: excluye 'ticket', max 1 cuota
   └─ auto_return: 'approved'
   └─ Retorna { init_point }

7. Usuario completa pago en Mercado Pago
   └─ MP redirige a /reserva-confirmada?external_reference=reservaId&payment_id=xxx

8. Página /reserva-confirmada (page.tsx)
   └─ useSearchParams() extrae external_reference + payment_id
   └─ useRef(false) previene doble ejecución
   └─ supabase.from('reservas').select('*, servicios(*), horarios_disponibles(*)')
   └─ UPDATE reservas SET estado_pago='aprobado', payment_id=xxx
   └─ fetch('/api/calendar', { method:'POST', body: { reserva } })

9. API /api/calendar (route.ts) — Orquestador post-pago
   a) Google Calendar: OAuth2 → calendar.events.insert()
      - summary: '💅 {servicio} - {cliente}'
      - duration: 1 hora
      - timeZone: America/Argentina/Buenos_Aires
   b) Supabase: horarios_disponibles SET estado='reservado'
   c) Supabase: reservas SET estado_pago='aprobado'
   d) Resend: Email HTML estilizado a EMAIL_ROCIO
   e) Telegram: POST a api.telegram.org/bot.../sendMessage (Markdown)
      - Incluye link clickeable wa.me/{numero}
```

> **Idempotencia parcial**: `ejecutadoRef.current` en la página de confirmación evita la doble llamada en StrictMode. Sin embargo, si el usuario recarga la página, el flujo se re-ejecuta pero el check `estado_pago !== 'aprobado'` lo cortocircuita.

---

## 8. API Routes — Detalle Técnico

### `POST /api/checkout`
- **Input**: `{ nombreServicio, precioSenia, reservaId }`
- **Proceso**: Instancia `MercadoPagoConfig` con `MP_ACCESS_TOKEN`, crea `Preference` con item único
- **Sanitización**: Limpia la `baseUrl` de comentarios inline (`split('#')[0]`) y slash final
- **Output**: `{ init_point: string }`

### `POST /api/calendar`
- **Input**: `{ reserva }` — objeto completo con joins `servicios` y `horarios_disponibles`
- **Proceso en secuencia** (pasos independientes con try/catch silencioso en Calendar y Email):
  1. Construye OAuth2 con refresh_token (no service account)
  2. Inserta evento en Google Calendar
  3. Bloquea horario en Supabase
  4. Actualiza estado_pago en reserva
  5. Envía email HTML via Resend
  6. Envía mensaje Telegram via REST API (`POST /sendMessage`)
- **Resiliencia**: Calendar y Email tienen `try/catch` silencioso. Si fallan, el flujo no se interrumpe.

---

## 9. Panel de Administración (`/admin`)

### Autenticación
- **Sin JWT / sesión real**: Estado `isAuthenticated` vive solo en memoria React
- La contraseña se valida mediante **Supabase RPC** `verificar_admin_password` (hash en BD)
- **Auto-logout**: `setTimeout` de 15 minutos inactivos (reset en `mousemove` / `keypress`)
- El panel es una **Single Page** con tabs, sin rutas separadas

### Tabs del Panel

| Tab | Componente | Funcionalidad |
|---|---|---|
| **Reservas** | `ReservasTab` | Lista reservas aprobadas agrupadas por día. Selección múltiple. Botón "Asistió" elimina reserva + horario. Link directo a WhatsApp del cliente. |
| **Nueva Reserva** | `ManualReservasTab` | Formulario para crear reservas sin pago (efectivo). `payment_id = 'MANUAL-timestamp'`, `monto_senia = 0`. También dispara `/api/calendar`. |
| **Servicios** | `ServiciosTab` | CRUD completo. Drag-order mediante botones ↑↓ que intercambian el campo `orden` en paralelo (`Promise.all`). Upload de foto a Supabase Storage. |
| **Horarios** | `HorariosTab` | Generador de agenda: selección múltiple de días + horas → INSERT masivo. Vista "Libres" / "Dados". Liberar turno = borrar reserva + reset estado. |
| **Perfil** | `AdminAvatarUpload` | Upload foto de perfil (path fijo `biografia/foto-perfil.jpg`, `upsert:true`). Edición de biografía. Cambio de contraseña admin (verifica actual → actualiza hash vía RPC). |

---

## 10. Componentes de la Landing

### `Hero.tsx`
- `min-h-[100svh]` — usa viewport height sin barras de navegación móvil
- Logo adaptativo: `logoB.png` (blanco) en dark mode, `logoN.png` (negro) en light
- Botón "Explorar" con borde animado conic-gradient girando 4s
- Indicador de scroll con `animate={{ y: [0,5,0] }}` infinito

### `Biography.tsx`
- Fetch de foto (`storage.getPublicUrl`) + biografía (`perfil` table) en `useEffect`
- Cache-busting en imagen: `?t=${new Date().getTime()}`
- Animación `whileInView` con `once: true` (no repite al subir)
- Sparkles (`✦`) con scale/opacity pulsante via Framer Motion

### `CarruselServicios.tsx`
- **Embla Carousel** con `loop:false`, `align:'center'`, `dragFree:false`
- Cards no-seleccionadas: `opacity-20 scale-95 blur-[1px]` — efecto foco
- `onSelect` solo se dispara si `isSelected` para evitar clics accidentales
- `priority={index < 2}` para LCP optimization en primeras imágenes

### `Methodology.tsx` (Políticas)
- 6 cards con borde conic-gradient animado en hover (desktop) / siempre visible (mobile)
- Transición `grid-rows-[0fr/1fr]` para acordeón CSS nativo (sin JS extra)
- Incluye `SupportModal` — reporte de errores vía WhatsApp

### `SupportModal.tsx`
- Modal puro React (sin portal)
- Genera URL `wa.me/{número}?text={encoded}` con mensaje estructurado
- Deshabilitado mientras nombre o apellido estén vacíos

### `BookingFlow.tsx`
- **2 pasos** con state `step: 1 | 2`
- Paso 1: acordeón mes→día→hora (3 niveles de `useState`)
- Paso 2: inputs + resumen de pago con gradiente neon
- Resumen muestra desglose: valor servicio / seña / gestión MP / total

---

## 11. Lib y Utilidades

### `lib/supabase.ts`
```ts
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```
Singleton global usando **anon key**. Usado tanto en cliente como en API routes (donde debería usarse service_role key para operaciones privilegiadas).

### `lib/google.ts`
Configura un cliente JWT con `GOOGLE_CLIENT_EMAIL` y `GOOGLE_PRIVATE_KEY`. **Sin embargo, no se usa en producción**: la ruta `/api/calendar` recrea la auth con OAuth2 + refresh_token directamente. Este archivo es código muerto.

### `lib/servicios.ts`
```ts
export const OPCIONES_RETIRO = [
  { id: 'mio',  nombre: 'Retiro Tekila',           precio: 3800 },
  { id: 'otro', nombre: 'Retiro de otra colega',   precio: 5000 },
]
```
Constantes hardcodeadas (no en BD). Los precios de retiro no son editables desde el admin.

---

## 12. Configuración TypeScript

```json
{
  "target": "ES2017",
  "strict": true,
  "module": "esnext",
  "moduleResolution": "bundler",
  "jsx": "react-jsx",
  "paths": { "@/*": ["./*"] }
}
```
- `strict: true` habilitado pero hay uso de `any[]` en varios componentes del admin
- Path alias `@/*` mapea a la raíz del proyecto

---

## 13. PWA (Progressive Web App)

El `manifest.json` en `/public` define la app como instalable en móvil (`display: standalone`). Solo tiene un ícono de 192x192. No tiene Service Worker ni estrategia de caché offline implementada.

---

## 14. SEO

Definido en `app/layout.tsx` via Next.js `Metadata`:
```ts
title: "Tekila Nails | Rocio Mena"
description: "Manicuría de alta gama en Maipú, Mendoza..."
keywords: ["Nails", "Mendoza", "Manicura", "Maipú", "Kapping", "Tekila Nails"]
authors: [{ name: "Rocío Mena" }]
icons: { icon: "/icon-192x192.png", apple: "/icon-192x192.png" }
```
La landing usa `<h2>` como primer heading visible (el `<h1>` no aparece explícitamente en la sección de servicios — el `<h1>` del admin es el único del panel).

---

## 15. Análisis de Seguridad

| Aspecto | Estado | Riesgo |
|---|---|---|
| Panel admin sin JWT/session | ⚠️ | Estado en memoria: si el tab se cierra, cualquiera puede acceder de nuevo sin auth. Sin rate limiting en login. |
| Anon key de Supabase en API routes server-side | ⚠️ | Debería usarse `service_role` key en server para operaciones admin |
| Credenciales reales en `.env.local` | ⚠️ | Tokens de producción MP y Google activos en desarrollo |
| `window.confirm()` para acciones destructivas | ℹ️ | Funcional pero no ideal en mobile |
| Validación de inputs | ✅ | Validación client-side en BookingFlow (nombre, WA) |
| RPC para password hashing | ✅ | La contraseña nunca viaja ni se almacena en texto plano en BD |
| Idempotencia en confirmación de pago | ✅ Parcial | `ejecutadoRef` previene doble disparo en React StrictMode |

---

## 16. Puntos de Mejora Identificados

1. **`lib/google.ts`** es código muerto — puede eliminarse.
2. **`OPCIONES_RETIRO`** hardcodeadas — deberían ser configurables desde el admin.
3. **Anon key en server routes** — usar Supabase `service_role` key en API routes.
4. **Admin sin sesión persistente** — considerar cookies httpOnly o Supabase Auth.
5. **Tipado débil en admin** — múltiples `any[]` que deberían tener interfaces.
6. **Sin paginación** en listas del admin (reservas, horarios).
7. **`Math.random()`** para nombres de archivo en Storage — no garantiza unicidad. Usar `crypto.randomUUID()`.
8. **PWA incompleta** — falta Service Worker para offline.
9. **`ADMIN_PASSWORD` en `.env.local`** — redundante, puede eliminarse ya que la fuente de verdad es la BD.
10. **Telegram usa Markdown** que puede fallar con caracteres especiales en nombres de clientes.

---

## 17. Flujo de Datos — Diagrama Resumen

```
Cliente (Browser)
    │
    ├─ GET /           → supabase.from('servicios')
    ├─ GET /admin      → supabase RPC verificar_admin_password
    │
    ├─ POST /api/checkout
    │       └─ MercadoPago.Preference.create()
    │               └─ redirect → MercadoPago
    │                       └─ redirect → /reserva-confirmada
    │
    └─ POST /api/calendar (desde /reserva-confirmada)
            ├─ Google Calendar API (OAuth2 refresh_token)
            ├─ Supabase: UPDATE horarios + reservas
            ├─ Resend: email HTML
            └─ Telegram Bot API: sendMessage
```

---

*Informe generado el 06/06/2026 — Tekila Nails v0.1.0*
