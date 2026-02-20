# Ecommerce Cineplanet — Documentación Técnica

## Acceso rápido

> ⚠️ **Nota:** Dentro de la carpeta **`payu-sandbox-cards`** existen **datos de prueba** para facilitar el testing de pagos. Incluyen ejemplos tanto para **usuarios autenticados** como para **usuarios invitados**. Estos datos son únicamente para entorno de desarrollo/pruebas y **no deben usarse en producción**.

| | |
|---|---|
| **Página Publicada** | https://ecommerce-cineplanet-dev.web.app |
| **Stack** | React 19 + React Router 7 + Firebase + PayU |
| **Idioma de la app** | Español (es-PE) |
| **Moneda** | Sol peruano (PEN) |

---

## Inicio rápido

Para ejecutar el proyecto en local:

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   - Copia `.env.example` a `.env`
   - Completa las variables de Firebase (requeridas para auth, Firestore, películas, dulcería y pedidos)
   - Completa las de PayU solo si quieres probar pagos (ver [Variables de entorno](#variables-de-entorno))

   ```bash
   cp .env.example .env
   ```

3. **Levantar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

> Sin Firebase configurado la app no mostrará películas, dulcería ni permitirá iniciar sesión.

---

## Tabla de contenidos

1. [Inicio rápido](#inicio-rápido)
2. [Descripción general](#descripción-general)
3. [Servicios externos y librerías](#servicios-externos-y-librerías)
4. [Arquitectura](#arquitectura)
5. [Rutas](#rutas)
6. [Vistas (páginas)](#vistas-páginas)
7. [Servicios — lógica y contratos HTTP/Firestore](#servicios--lógica-y-contratos-httpfirestore)
8. [Componentes reutilizables](#componentes-reutilizables)
9. [Estado global (Stores)](#estado-global-stores)
10. [Flujo de la aplicación](#flujo-de-la-aplicación)
11. [Contratos de datos](#contratos-de-datos)
12. [Variables de entorno](#variables-de-entorno)
13. [Decisiones de diseño](#decisiones-de-diseño)
14. [Puntos importantes y consideraciones](#puntos-importantes-y-consideraciones)

---

## Descripción general

Ecommerce Cineplanet es una SPA (Single Page Application) que permite a los usuarios:

- Navegar el catálogo de películas en cartelera.
- Comprar productos de dulcería.
- Pagar con tarjeta de crédito/débito mediante PayU.
- Consultar su historial de pedidos.

No existe un servidor propio. Todo el backend es Firebase (base de datos + autenticación). El procesamiento de pagos es delegado completamente a la API de PayU. La app se sirve como archivos estáticos desde Firebase Hosting.

---

## Servicios externos y librerías

### Servicios externos

#### Firebase
**Por qué se usó:** Firebase permite tener un backend sin servidor propio. Provee base de datos en tiempo real (Firestore), autenticación con Google OAuth, y hosting estático todo en el mismo ecosistema. Para un proyecto sin infraestructura propia es la opción más rápida de poner en producción con cero mantenimiento de servidor.

- **Firebase Auth:** Autenticación de usuarios mediante Google OAuth. También se soporta acceso como invitado (sin cuenta).
- **Cloud Firestore:** Base de datos NoSQL orientada a documentos. Se usa para almacenar películas (`premieres`), productos de dulcería (`candystore`) y pedidos (`orders`).
- **Firebase Hosting:** Sirve el build estático de la app. Configurado con rewrite `**` → `/index.html` para que React Router maneje todas las rutas en el cliente.

#### PayU
**Por qué se usó:** PayU es el procesador de pagos más extendido en Latinoamérica y tiene soporte nativo para Perú (PEN). Ofrece un entorno de prueba completo y firma de solicitudes con MD5 sin necesidad de un backend propio para el flujo básico.

- Procesamiento de tarjetas de crédito/débito (Visa, Mastercard, Amex, Diners).
- Autenticación mediante firma MD5 (`apiKey + merchantId + referenceCode + amount + currency`).
- Modo test configurable con variable de entorno.
- La app envía un `POST` con los datos de la transacción. PayU devuelve `transactionId` y `operationDate`.

---

### Librerías principales

| Librería | Versión | Por qué se usó |
|---|---|---|
| **React 19** | 19.2.4 | Framework UI principal. Se eligió la versión 19 por compatibilidad con React Router 7. |
| **React Router 7** | 7.12.0 | Enrutamiento del lado del cliente. Se eligió v7 (ex-Remix) porque provee un sistema de rutas con tipado automático y file-based routing conveniente. `ssr: false` porque no necesitamos SSR. |
| **@tanstack/react-query** | 5.x | Manejo de fetching, caché y estados de carga. Se eligió sobre `useEffect` manual porque resuelve automáticamente deduplicación de peticiones, stale-while-revalidate, y paginación infinita (`useInfiniteQuery`). |
| **Zustand** | 5.x | Estado global liviano. Se eligió sobre Redux porque no requiere boilerplate. Se usa para carrito (con persistencia localStorage) y usuario autenticado. |
| **react-hook-form** | 7.x | Manejo del formulario de pago. Permite controlar campos de forma no controlada (menos re-renders) y se integra limpiamente con Zod. |
| **Zod** | 4.x | Validación de esquemas del formulario. Se eligió porque es el estándar de facto con TypeScript y permite validadores custom (expiración futura, formato DNI/CE/Pasaporte). |
| **@hookform/resolvers** | 5.x | Puente entre Zod y react-hook-form. Sin esto habría que escribir la validación manualmente. |
| **md5** | 2.x | Generación de la firma MD5 que exige la API de PayU para autenticar las peticiones. No hay alternativa nativa en el browser. |
| **sonner** | 2.x | Toasts de notificación. Se eligió sobre react-toastify por su API más simple y mejor diseño por defecto. |
| **Tailwind CSS** | 4.x | Estilos utility-first. No hay archivos CSS custom, todo el diseño vive en las clases de los componentes, lo que facilita la coherencia visual y la velocidad de desarrollo. |
| **vite-tsconfig-paths** | 5.x | Permite usar alias de imports (`@/components/...`) configurados en `tsconfig.json` directamente en Vite sin duplicar configuración. |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (SPA)                            │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Routes    │    │  Components │    │     Stores      │  │
│  │  (pages)    │◄──►│ reutiliz.   │◄──►│   (Zustand)     │  │
│  └──────┬──────┘    └─────────────┘    └─────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │  Services   │  ← capa de acceso a datos                  │
│  └──────┬──────┘                                            │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
    ┌─────┴──────────────────┐
    │                        │
    ▼                        ▼
┌───────────┐         ┌─────────────┐
│  Firebase │         │    PayU     │
│  (BaaS)   │         │  REST API   │
│           │         │             │
│ • Auth    │         │ • POST /    │
│ • Firestore         │   payments  │
│ • Hosting │         └─────────────┘
└───────────┘
```

### Principios de la arquitectura

- **Sin SSR:** `react-router.config.ts` tiene `ssr: false`. La app es 100% cliente. El HTML inicial es un `index.html` vacío y React monta todo.
- **Sin servidor propio:** No hay Express, Nest, ni ningún backend. Firebase actúa como BaaS.
- **Capa de servicios separada:** Los componentes y rutas no llaman a Firebase directamente. Toda la lógica de acceso a datos vive en `app/services/`.
- **Estado global mínimo:** Solo se mantiene en store lo que necesita cruzar varias rutas (carrito, usuario). El estado de UI (modales, menú) es local al componente.
- **React Query como capa de caché:** Las llamadas a Firestore pasan por React Query, que evita refetch innecesario con `staleTime: 5min`.

### Estructura de directorios

```
app/
├── components/          # Componentes UI reutilizables
│   ├── Navbar.tsx
│   ├── CartDrawer.tsx
│   └── MovieImage.tsx
├── routes/              # Una página por archivo
│   ├── home.tsx
│   ├── premiere.tsx
│   ├── candy-store.tsx
│   ├── checkout.tsx
│   ├── confirmation.tsx
│   ├── orders.tsx
│   ├── login.tsx
│   └── not-found.tsx
├── services/            # Acceso a datos y APIs externas
│   ├── premieres.ts
│   ├── candystore.ts
│   ├── orders.ts
│   ├── payU.ts
│   └── complete.ts
├── store/               # Estado global (Zustand)
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── paymentStore.ts
├── lib/
│   └── firebase.client.ts   # Inicialización de Firebase (solo cliente)
├── utils/
│   └── formatCurrency.ts    # Formateo a PEN
├── types/
│   └── index.ts             # Tipos TypeScript compartidos
├── root.tsx                 # Layout raíz + providers
└── routes.ts                # Declaración de rutas
```

---

## Rutas

Todas las rutas son client-side. React Router 7 usa file-based routing declarado en `app/routes.ts`.

| Ruta | Archivo | Descripción | Auth requerida |
|---|---|---|---|
| `/` | `home.tsx` | Catálogo de películas con scroll infinito | No |
| `/pelicula/:id` | `premiere.tsx` | Detalle de una película | No |
| `/dulceria` | `candy-store.tsx` | Catálogo de dulcería con búsqueda | **Sí** |
| `/pago` | `checkout.tsx` | Formulario de pago | **Sí** |
| `/confirmacion` | `confirmation.tsx` | Resumen del pedido completado | **Sí** |
| `/mis-pedidos` | `orders.tsx` | Historial de compras del usuario | **Sí** |
| `/login` | `login.tsx` | Inicio de sesión (Google / invitado) | No |
| `*` | `not-found.tsx` | 404 | No |

### Protección de rutas
Las rutas protegidas verifican `useAuthStore().user`. Si no hay usuario, redirigen a `/login?redirect=/ruta-original`. Después del login, se recupera el `redirect` del query string y se navega allí automáticamente.

```
Ejemplo:
/dulceria → sin sesión → /login?redirect=/dulceria → login exitoso → /dulceria
```

---

## Servicios — lógica y contratos HTTP/Firestore

### `app/services/premieres.ts`

Accede a la colección `premieres` de Firestore.

**`getPremieres(cursor?)`**
- Tipo: Lectura Firestore
- Paginación: cursor-based con `startAfter()`, 4 items por página
- Retorna: `{ items: Premiere[], nextCursor: QueryDocumentSnapshot | null }`

**`getPremiereById(id)`**
- Tipo: Lectura Firestore (documento único)
- Retorna: `Premiere | null`

---

### `app/services/candystore.ts`

Accede a la colección `candystore` de Firestore.

**`getCandyStore(cursor?)`**
- Tipo: Lectura Firestore
- Paginación: cursor-based con `startAfter()`, 6 items por página
- Retorna: `{ items: Product[], nextCursor: QueryDocumentSnapshot | null }`

---

### `app/services/orders.ts`

Accede a la colección `orders` de Firestore.

**`saveOrder(payload)`**
- Tipo: Escritura Firestore (`addDoc`)
- Payload enviado a Firestore:
  ```typescript
  {
    userEmail: string,
    userName: string,
    items: CartItem[],
    total: number,
    payUResponse: {
      transactionId: string,
      operationDate: string
    },
    createdAt: serverTimestamp()   // timestamp del servidor Firebase
  }
  ```
- Retorna: `void`

**`getOrders(email)`**
- Tipo: Lectura Firestore con filtro `where("userEmail", "==", email)`
- Ordenamiento: En el cliente por `createdAt` (descendente)
- Retorna: `Order[]`

---

### `app/services/payU.ts`

Procesamiento de pagos mediante la REST API de PayU.

**`processPayment(payload)`**
- Método HTTP: `POST`
- URL: `VITE_PAYU_BASE_URL`
- Content-Type: `application/json; charset=utf-8`

**Payload enviado a PayU:**
```typescript
{
  language: "es",
  command: "SUBMIT_TRANSACTION",
  merchant: {
    apiLogin: string,    // VITE_PAYU_API_LOGIN
    apiKey: string       // VITE_PAYU_API_KEY
  },
  transaction: {
    order: {
      accountId: string,          // VITE_PAYU_ACCOUNT_ID
      referenceCode: string,      // generado con timestamp
      description: "Cineplanet",
      language: "es",
      signature: string,          // MD5(apiKey~merchantId~refCode~amount~currency)
      notifyUrl: string,
      additionalValues: {
        TX_VALUE: { value: number, currency: "PEN" }
      },
      buyer: {
        emailAddress: string,
        fullName: string
      }
    },
    payer: {
      emailAddress: string,
      fullName: string,
      dniNumber: string
    },
    creditCard: {
      number: string,             // sin espacios
      securityCode: string,
      expirationDate: string,     // "YYYY/MM"
      name: string
    },
    extraParameters: {
      INSTALLMENTS_NUMBER: 1
    },
    type: "AUTHORIZATION_AND_CAPTURE",
    paymentMethod: string,        // "VISA" | "MASTERCARD" | "AMEX" | "DINERS"
    paymentCountry: "PE",
    deviceSessionId: string,      // generado aleatoriamente
    ipAddress: "127.0.0.1",
    cookie: string,
    userAgent: string
  },
  test: boolean                   // VITE_PAYU_TEST
}
```

**Respuesta de PayU (éxito):**
```typescript
{
  code: "SUCCESS",
  transactionResponse: {
    transactionId: string,
    state: "APPROVED",
    operationDate: string,         // ISO 8601
    // otros campos de PayU...
  }
}
```

**Lo que retorna `processPayment`:**
```typescript
{
  transactionId: string,
  operationDate: string
}
```

**Errores que maneja:**
- Código distinto de `SUCCESS` → lanza error con mensaje de PayU
- `state` distinto de `APPROVED` → lanza error con estado de la transacción
- `INACTIVE_PAYMENT_PROVIDER` en modo test → lanza error descriptivo

---

### `app/services/complete.ts`

Placeholder para la integración futura con la API de Cineplanet. Actualmente es una función vacía que recibe los datos de la transacción pero no hace nada. El error que genera se captura silenciosamente en `checkout.tsx` para que no bloquee el flujo de pago.

---

## Componentes reutilizables

### `Navbar.tsx`

Barra de navegación global presente en todas las páginas.

**Props:** Ninguna. Lee estado de stores.

**Responsabilidades:**
- Logo y links de navegación (Home, Dulcería, Mis pedidos si hay sesión).
- Ícono de carrito con badge de cantidad (muestra "9+" si hay más de 9 items).
- Menú hamburguesa en mobile con animación de apertura/cierre.
- Muestra nombre de usuario y botón "Cerrar sesión" si hay sesión activa.
- Botón "Iniciar sesión" si no hay sesión.
- Abre/cierra el `CartDrawer`.

**Estado local:** `menuOpen: boolean`, `cartOpen: boolean`
**Stores consumidos:** `useAuthStore`, `useCartStore`

---

### `CartDrawer.tsx`

Panel lateral deslizable desde la derecha que muestra el contenido del carrito.

**Props:**
```typescript
{
  isOpen: boolean,
  onClose: () => void
}
```

**Responsabilidades:**
- Lista todos los items del carrito con imagen, nombre, precio y cantidad.
- Botones `+` / `−` para ajustar cantidad. Botón `×` para eliminar el item completo.
- Botón "Vaciar carrito" con modal de confirmación.
- Muestra total calculado automáticamente.
- Botón "Pagar" navega a `/pago`.
- Cierra con tecla `Escape` o click en el backdrop.
- Bloquea el scroll del body mientras está abierto.

**Estado local:** `confirmClear: boolean`
**Stores consumidos:** `useCartStore`

---

### `MovieImage.tsx`

Componente de imagen con manejo de estados de carga.

**Props:**
```typescript
{
  src: string,
  alt: string,
  className?: string
}
```

**Estados internos:**
- `loading`: muestra skeleton animado.
- `loaded`: muestra la imagen con fade-in.
- `error`: muestra ícono placeholder.

**Decisión de diseño:** Se extrajo como componente porque el mismo patrón se repite en `home.tsx`, `premiere.tsx` y `candy-store.tsx`. Centraliza la lógica de carga y el tratamiento de errores de imagen.

---

## Estado global (Stores)

Todos los stores usan **Zustand**. Solo `cartStore` tiene persistencia en `localStorage`.

### `cartStore.ts`

**Clave en localStorage:** `cineplanet-cart`

**Estado:**
```typescript
{
  items: CartItem[],   // lista de productos en el carrito
  total: number,       // suma de (precio × cantidad) calculada automáticamente
  hydrated: boolean    // true una vez que localStorage fue leído al montar
}
```

**Acciones:**
| Acción | Descripción |
|---|---|
| `addItem(product)` | Si el producto ya existe incrementa `cantidad`, si no lo agrega con `cantidad: 1` |
| `removeItem(id)` | Decrementa `cantidad` en 1. Si llega a 0, elimina el item |
| `removeItemFull(id)` | Elimina el item independientemente de la cantidad |
| `clearCart()` | Vacía el carrito completamente |
| `setHydrated()` | Marca el store como hidratado (para evitar flash de carrito vacío) |

**Por qué persiste en localStorage:** El carrito debe sobrevivir a recargas de página. El usuario no debería perder sus items si cierra el navegador accidentalmente.

---

### `authStore.ts`

**Sin persistencia** — se sincroniza con Firebase Auth `onAuthStateChanged` en `root.tsx`.

**Estado:**
```typescript
{
  user: { name: string, email: string } | null,
  hydrated: boolean
}
```

**Acciones:** `setUser(user)`, `logout()`, `setHydrated()`

**Por qué no persiste:** Firebase ya maneja la sesión. Al recargar, `onAuthStateChanged` dispara inmediatamente con el usuario actual si la sesión sigue activa.

---

### `paymentStore.ts`

Store secundario. Fue creado como alternativa para pasar datos de pago entre rutas, pero finalmente se optó por pasar el estado vía `React Router navigate(state)`. Queda disponible como opción.

---

## Flujo de la aplicación

### 1. Navegación inicial

```
/ (home)
├─ Lista películas con scroll infinito (4 por carga)
│   └─ Click en película → /pelicula/:id
│       └─ Botón "Comprar entradas" → /dulceria (requiere auth)
└─ Navbar siempre visible con carrito y sesión
```

### 2. Autenticación

```
Ruta protegida sin sesión
→ /login?redirect=/ruta-original
    ├─ Google OAuth → Firebase Auth → setUser() → redirect
    └─ Invitado → nombre/email manual → setUser() → redirect
```

### 3. Compra de productos

```
/dulceria
├─ Carga productos con scroll infinito (6 por carga)
├─ Búsqueda en cliente (filter sobre items ya cargados)
├─ addItem(product) → cartStore
└─ Carrito actualizado en Navbar (badge)
```

### 4. Checkout y pago

```
/pago
├─ Formulario validado con Zod + react-hook-form
│   ├─ Campos: tarjeta, vencimiento, CVV, nombre, email, documento
│   └─ Formateo automático: XXXX XXXX XXXX XXXX, MM/YY, mayúsculas
│
└─ onSubmit:
    1. processPayment(payload) → POST PayU API
    2. completeTransaction() → (falla silenciosamente, placeholder)
    3. saveOrder(payload) → Firestore addDoc
    4. queryClient.invalidateQueries(['orders']) → invalida caché
    5. clearCart() → vacía carrito en store y localStorage
    6. navigate('/confirmacion', { state: { payUResponse, items, total } })
```

### 5. Confirmación

```
/confirmacion
├─ Lee estado desde location.state (navigate anterior)
├─ Si no hay state → redirige a /
├─ Muestra: items, total, transactionId, operationDate
└─ Links: "Ver mis pedidos" → /mis-pedidos | "Volver al inicio" → /
```

### 6. Historial de pedidos

```
/mis-pedidos
├─ getOrders(user.email) → Firestore where + client-sort desc
└─ Lista de órdenes con items, total, fecha, transactionId
```

---

## Contratos de datos

### Tipos TypeScript principales (`app/types/index.ts`)

**Premiere (película)**
```typescript
{
  id: string,
  titulo: string,
  imagen: string,        // URL de imagen
  descripcion: string
}
```

**Product (dulcería)**
```typescript
{
  id: string,
  nombre: string,
  descripcion: string,
  precio: number         // en PEN
}
```

**CartItem (item en carrito)**
```typescript
{
  id: string,
  nombre: string,
  descripcion: string,
  precio: number,
  cantidad: number
}
```

**Order (pedido guardado)**
```typescript
{
  id: string,             // auto-generado por Firestore
  userEmail: string,
  userName: string,
  items: CartItem[],
  total: number,
  payUResponse: {
    transactionId: string,
    operationDate: string
  },
  createdAt: Timestamp    // Firebase Timestamp
}
```

---

## Variables de entorno

El archivo `.env` (no commitado) debe contener:

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# PayU
VITE_PAYU_API_KEY=
VITE_PAYU_API_LOGIN=
VITE_PAYU_MERCHANT_ID=
VITE_PAYU_ACCOUNT_ID=
VITE_PAYU_BASE_URL=
VITE_PAYU_TEST=true          # para pruebas
```

---

## Decisiones de diseño

### ¿Por qué React Query en lugar de `useEffect` para fetching?

`useEffect` manual para fetching requiere manejar estados `loading`, `error`, `data`, deduplicación de peticiones en StrictMode, y cancelación. React Query resuelve todo eso. Además, `useInfiniteQuery` implementa la paginación con cursor de Firestore de forma declarativa.

### ¿Por qué pasar datos de confirmación por `navigate(state)` y no por store?

El estado de la confirmación es efímero — solo importa una vez, después de pagar. Guardarlo en un store persistente o en Firestore sería overhead innecesario. `navigate('/confirmacion', { state })` es el mecanismo diseñado exactamente para esto en React Router.

### ¿Por qué el formulario de pago usa react-hook-form y no estado controlado?

Un formulario con ~8 campos controlados con `useState` genera un re-render por cada tecla. `react-hook-form` trabaja con refs (no controlado) y solo re-renderiza en submit o en errores de validación. Para un formulario de pago donde el rendimiento percibido importa, esto es la elección correcta.

### ¿Por qué `complete.ts` está vacío?

`complete.ts` es el punto de integración con la API propia de Cineplanet para registrar la compra en sus sistemas internos. No estaba disponible durante el desarrollo, por lo que se dejó como placeholder. La llamada se hace en `checkout.tsx` envuelta en `try/catch` que falla silenciosamente para no bloquear el flujo de pago ya aprobado por PayU.

### ¿Por qué la búsqueda de dulcería es en cliente y no en Firestore?

Firestore no soporta búsqueda de texto libre nativa. Las opciones serían Algolia/Typesense (costo extra) o filtrar en cliente. Dado que el catálogo de dulcería es relativamente pequeño, filtrar en el cliente sobre los items ya cargados es suficiente y evita latencia de red adicional.

---

## Puntos importantes y consideraciones

### Seguridad

### Detección del tipo de tarjeta

La función en `payU.ts` detecta el método de pago por el primer dígito del número de tarjeta:
- `4` → VISA
- `5` → MASTERCARD
- `3` → AMEX o DINERS (diferenciado por el segundo dígito)

Esto es estándar en la industria (IIN/BIN ranges).

### Firma MD5 de PayU

La firma tiene el formato: `MD5(apiKey~merchantId~referenceCode~txValue~currency)`

Si la firma no coincide, PayU rechaza la transacción con error de autenticación. El `referenceCode` se genera con timestamp para garantizar unicidad.

### Ordenamiento de pedidos

Los pedidos se ordenan en el cliente (no en Firestore) por limitación de permisos en la query compuesta de Firestore (requeriría un índice compuesto `userEmail + createdAt`). Para el volumen esperado de pedidos por usuario esto es aceptable.

### Firebase Hosting — rewrites

`firebase.json` configura un rewrite `**` → `/index.html`. Esto es fundamental para que las rutas de React Router (ej: `/dulceria`, `/pago`) funcionen al acceder directamente por URL. Sin esto, Firebase devolvería 404 porque no existe ningún archivo en esas rutas.

### Assets estáticos con caché de 1 año

Los assets en `/assets/**` tienen `Cache-Control: public, max-age=31536000, immutable`. Vite genera hashes en los nombres de archivo (`main.abc123.js`) lo que hace seguro el caché agresivo: si el contenido cambia, cambia el nombre del archivo.
