<div align="center">

<img src="public/logo.png" alt="Manjares del Campo" width="120" />

# Manjares del Campo

### Directo del campo a tu mesa

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Railway-Backend-0B0D0E?style=flat-square&logo=railway)](https://railway.app)

**Plataforma de e-commerce para venta de productos agrícolas frescos y orgánicos.**  
Conecta directamente a productores del campo con consumidores finales, con pedidos gestionados vía WhatsApp.

🌐 **[Ver demo en vivo](https://granja-nu.vercel.app)**

</div>

---

## Tabla de contenidos

- [Características](#-características)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación local](#-instalación-local)
- [Variables de entorno](#-variables-de-entorno)
- [Funcionalidades del Admin](#-funcionalidades-del-admin)
- [Integración WhatsApp](#-integración-whatsapp)
- [Despliegue](#-despliegue)

---

## ✨ Características

### Tienda
- 🛍️ **Catálogo de productos** con imágenes, categorías, precios y disponibilidad
- 🔍 **Búsqueda en tiempo real** por nombre y descripción
- 🎚️ **Filtro por precio** con rango deslizable min/max
- 🔃 **Ordenamiento** por precio, nombre y más recientes
- 🪟 **Modal de detalle** con productos relacionados por categoría
- 🛒 **Carrito de compras** con selector de cantidades
- 💀 **Skeleton loading** mientras cargan los productos

### Checkout por WhatsApp
- 💬 **Botón flotante** de WhatsApp en toda la aplicación
- 📦 **Resumen de pedido automático** — genera un mensaje con productos, cantidades y total listo para enviar
- 🔍 **Seguimiento de pedidos** — los clientes pueden rastrear el estado de sus pedidos

### Diseño
- 🌍 **Globo terráqueo 3D interactivo** con punto pulsante sobre Colombia (D3.js)
- ✍️ **Animación typewriter** en el hero principal
- 🎴 **Scroll reveal** en secciones al hacer scroll
- 📱 **Diseño completamente responsivo**
- 🌿 **Paleta natural** — verde oscuro, crema y dorado

### Admin Dashboard
- 🔐 **Autenticación JWT** con sesión protegida
- 📋 **CRUD completo de productos** — crear, editar, eliminar
- 🖼️ **Subida de imágenes** a Cloudinary
- 📊 **Panel de estadísticas** — total de productos, categorías y valores
- 👥 **Gestión de usuarios** — listar, crear y eliminar usuarios administradores
- 👤 **Perfil de admin** — ver y actualizar datos del perfil
- 📦 **Seguimiento de pedidos** — gestión de pedidos de clientes

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite 7, React Router 7 |
| Estilos | CSS puro con variables, DM Sans + Fraunces |
| Íconos | Lucide React |
| Visualización | D3.js (globo 3D), Recharts (admin) |
| Backend | Express 5, Node.js |
| Base de datos | PostgreSQL via Neon (serverless) |
| Imágenes | Cloudinary |
| Autenticación | JWT + bcryptjs |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## 🏗️ Arquitectura

```
Cliente (Vercel)          Servidor (Railway)         Servicios externos
┌─────────────┐           ┌──────────────────┐       ┌────────────────┐
│  React SPA  │  ──API──▶ │  Express REST    │ ────▶ │  Neon Postgres │
│  Vite 7     │           │  /api/products   │       └────────────────┘
│             │           │  /api/categories │       ┌────────────────┐
│  D3.js Globe│           │  /api/auth       │ ────▶ │  Cloudinary    │
└─────────────┘           └──────────────────┘       └────────────────┘
       │
       ▼
  WhatsApp API
  (wa.me links)
```

---

## 📁 Estructura del proyecto

```
manjares-del-campo/
├── public/
│   ├── favicon.png
│   └── logo.png
├── server/
│   ├── index.js              # API REST Express
│   ├── config/
│   │   └── db.js             # Conexión a PostgreSQL
│   ├── middleware/
│   │   └── auth.js          # Middleware de autenticación JWT
│   └── routes/
│       ├── products.js      # CRUD de productos
│       ├── auth.js          # Autenticación de admins
│       ├── orders.js        # Gestión de pedidos
│       ├── admins.js        # Gestión de usuarios admin
│       └── upload.js        # Subida de imágenes a Cloudinary
├── src/
│   ├── api/
│   │   └── client.js         # Funciones de fetch al backend
│   ├── assets/               # Imágenes locales
│   ├── components/
│   │   ├── GlobeCanvas/      # Globo 3D con D3.js
│   │   ├── Header/           # Navbar con carrito
│   │   ├── Footer/
│   │   ├── ProductCard/      # Tarjeta + modal de producto
│   │   ├── ProductSkeleton/  # Skeleton loading
│   │   ├── Toast/            # Notificaciones
│   │   └── WhatsAppButton/   # Botón flotante WhatsApp
│   ├── context/
│   │   └── AppContext.jsx    # Estado global (carrito, productos)
│   ├── hooks/
│   │   └── useScrollReveal.js
│   ├── pages/
│   │   ├── Home/
│   │   ├── Products/         # Catálogo con búsqueda y filtros
│   │   ├── Cart/             # Carrito + checkout WhatsApp
│   │   ├── About/
│   │   ├── Contact/
│   │   ├── OrderTracking/    # Seguimiento de pedidos
│   │   ├── AdminLogin/
│   │   ├── AdminDashboard/   # Panel principal admin
│   │   ├── AdminUsers/       # Gestión de usuarios
│   │   └── AdminProfile/    # Perfil del admin
│   ├── App.jsx
│   └── main.jsx
├── .env                      # Variables de entorno (no incluido)
├── package.json
└── vite.config.js
```

---

## 🚀 Instalación local

### Requisitos previos
- Node.js 18+
- npm o yarn
- Cuenta en [Neon](https://neon.tech) (PostgreSQL serverless)
- Cuenta en [Cloudinary](https://cloudinary.com)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/brandonxf/granja.git
cd granja

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar en desarrollo (frontend + backend simultáneo)
npm run dev:all
```

El frontend corre en `http://localhost:5173` y el backend en `http://localhost:3001`.

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT
JWT_SECRET=tu_secreto_jwt

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Backend URL (para el frontend en desarrollo)
VITE_API_URL=http://localhost:3001
```

---

## 🛠️ Funcionalidades del Admin

Accede en `/admin/login` con tus credenciales de administrador.

| Función | Descripción |
|---------|-------------|
| **Dashboard** | Panel principal con estadísticas y gráficos |
| **Productos** | Crear, editar y eliminar productos con imagen |
| **Categorías** | Ver categorías disponibles |
| **Usuarios** | Listar, crear y eliminar usuarios administradores |
| **Pedidos** | Ver y gestionar pedidos de clientes |
| **Perfil** | Ver y actualizar datos del perfil de admin |
| **Imágenes** | Subida directa a Cloudinary con preview |

---

## 💬 Integración WhatsApp

El flujo de compra no requiere pasarela de pagos. Funciona así:

```
Usuario agrega productos al carrito
           ↓
   Presiona "Proceder al pago"
           ↓
Se genera un mensaje automático con:
  • Lista de productos y cantidades
  • Total del pedido
           ↓
  Se abre WhatsApp con el mensaje
  listo para enviar al vendedor
```

Esto permite operar sin infraestructura de pagos, ideal para negocios locales y pequeños productores.

---

## 🌐 Despliegue

### Frontend — Vercel
```bash
# Conectar repositorio en vercel.com
# Build command:   npm run build
# Output directory: dist
# Agregar variables de entorno en el panel de Vercel
```

### Backend — Railway
```bash
# Conectar repositorio en railway.app
# Start command: node server/index.js
# Agregar variables de entorno en el panel de Railway
```

---

<div align="center">

Hecho con 🌿 para conectar el campo con la mesa

</div>
