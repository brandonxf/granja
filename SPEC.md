# GranjaVerde - E-commerce de Productos de Granja

## 1. Project Overview

- **Project Name**: GranjaVerde
- **Type**: E-commerce Web Application (React SPA)
- **Core Functionality**: Tienda online para productos agrícolas frescos con panel de administración para gestionar inventario, pedidos y estadísticas
- **Target Users**: Consumidores que buscan productos frescos de granja y administradores del negocio

---

## 2. UI/UX Specification

### Layout Structure

#### Public Pages (Tienda)
- **Header**: Logo + navegación principal + carrito de compras
- **Hero Section**: Banner con imagen de campo/granja y mensaje de bienvenida
- **Products Grid**: Catálogo de productos en grid responsivo (4 cols desktop, 2 cols tablet, 1 col mobile)
- **Features Section**: Beneficios de comprar en GranjaVerde
- **Footer**: Links rápidos, contacto, redes sociales + **BOTÓN DE LOGIN ADMIN**

#### Admin Pages
- **Sidebar**: Navegación del admin dashboard
- **Main Content**: Área de trabajo con estadísticas y gestión

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

#### Color Palette (Verdes Tipo Campo)
| Name | Hex Code | Usage |
|------|----------|-------|
| Primary Green | `#2D5A27` | Headers, botones principales, acentos |
| Secondary Green | `#4A7C43` | Hover states, elementos secundarios |
| Light Green | `#8FBC8F` | Fondos claros, divisores |
| Accent Yellow | `#F4D03F` | CTAs importantes, badges de oferta |
| Earth Brown | `#5D4037` | Textos secundarios, borders |
| Cream White | `#FAF8F5` | Fondo principal |
| Dark Forest | `#1A3A17` | Footer, sidebar admin |
| Success | `#388E3C` | Estados de éxito |
| Warning | `#FFA000` | Estados de advertencia |
| Error | `#D32F2F` | Estados de error |

#### Typography
- **Font Family**: 
  - Headings: `'Playfair Display', serif` (elegante, orgánico)
  - Body: `'Nunito', sans-serif` (limpio, legible)
- **Font Sizes**:
  - H1: 48px / 3rem
  - H2: 36px / 2.25rem
  - H3: 24px / 1.5rem
  - Body: 16px / 1rem
  - Small: 14px / 0.875rem

#### Spacing System
- Base unit: 8px
- Spacing scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px

#### Visual Effects
- **Box Shadows**: 
  - Card: `0 4px 20px rgba(45, 90, 39, 0.1)`
  - Button hover: `0 6px 20px rgba(45, 90, 39, 0.25)`
- **Border Radius**: 
  - Cards: 16px
  - Buttons: 8px
  - Images: 12px
- **Animations**: 
  - Page transitions: fade-in 0.3s ease
  - Button hover: scale(1.02) + shadow transition
  - Card hover: translateY(-4px)
  - Staggered load: animation-delay para grid de productos

### Components

#### Header
- Logo (texto con ícono de hoja)
- Navegación: Inicio, Productos, Nosotros, Contacto
- Icono de carrito con badge de cantidad
- Fondo verde con texto blanco

#### ProductCard
- Imagen del producto (aspect-ratio 1:1)
- Badge de "Nuevo" o "Oferta" si aplica
- Nombre del producto
- Precio (con descuento si hay oferta)
- Botón "Agregar al Carrito"
- Hover: elevación + sombra

#### Footer
- 3 columnas: Sobre nosotros, Enlaces rápidos, Contacto
- Redes sociales con iconos
- **Botón de Login Admin** prominente
- Copyright
- Fondo oscuro (Dark Forest)

#### AdminLogin
- Formulario con email y contraseña
- Logo de GranjaVerde
- Botón de ingreso
- Diseño limpio con fondo verde

#### AdminDashboard
- Sidebar con navegación:
  - Dashboard (índice)
  - Productos (CRUD)
  - Pedidos
  - Estadísticas
- Header con logout
- Contenido principal con cards de estadísticas
- Gráficos simples de ventas

---

## 3. Functionality Specification

### Core Features

#### Tienda (Frontend)
1. **Catálogo de Productos**
   - Grid de productos con filtros por categoría
   - Categorías: Frutas, Verduras, Lácteos, Huevos, Artesanales
   - Información: imagen, nombre, precio, descripción breve

2. **Carrito de Compras**
   - Agregar/quitar productos
   - Actualizar cantidades
   - Ver total
   - Persistencia en localStorage

3. **Navegación**
   - Routing con React Router
   - URLs: `/`, `/productos`, `/producto/:id`

#### Panel de Administración
1. **Login**
   - Formulario de autenticación
   - Credenciales mock: admin@granjaverde.com / admin123
   - JWT simulado en localStorage

2. **Dashboard**
   - Tarjetas de estadísticas:
     - Total productos
     - Pedidos hoy
     - Ingresos del mes
     - Clientes registrados
   - Lista de pedidos recientes

3. **Gestión de Productos**
   - Listar productos
   - Agregar nuevo producto
   - Editar producto existente
   - Eliminar producto
   - (Mock con estado local)

### User Interactions
- Click en producto → ver detalle
- Agregar al carrito → toast de confirmación
- Login admin → redirección a dashboard
- CRUD productos en admin

### Data Handling
- Estado global con React Context API
- Mock data para productos inicial
- Persistencia de sesión admin en localStorage
- Carrito guardado en localStorage

### Edge Cases
- Carrito vacío: mostrar mensaje
- Admin no autenticado: redirigir a login
- Producto no encontrado: página 404
- Formularios vacíos: validación con mensajes de error

---

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Colores verdes de campo aplicados consistentemente
- [ ] Tipografía legible y jerárquica
- [ ] Diseño responsivo en todos los breakpoints
- [ ] Animaciones suaves en interacciones
- [ ] Footer con botón de login admin visible

### Functional Checkpoints
- [ ] Navegación entre páginas funciona correctamente
- [ ] Productos se muestran en grid
- [ ] Carrito funciona (agregar, quitar, total)
- [ ] Login de admin valida credenciales
- [ ] Dashboard muestra estadísticas
- [ ] CRUD de productos funciona
- [ ] Ruta protegida para admin

### Technical Checkpoints
- [ ] React con Vite configurado
- [ ] React Router para navegación
- [ ] Context API para estado global
- [ ] Estilos con CSS Modules o styled-components
- [ ] Sin errores en consola
- [ ] Build exitoso

---

## 5. Technical Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **State**: React Context API
- **Styling**: CSS Modules
- **Icons**: Lucide React
- **Charts**: Recharts (para dashboard)
- **Fonts**: Google Fonts (Playfair Display, Nunito)
