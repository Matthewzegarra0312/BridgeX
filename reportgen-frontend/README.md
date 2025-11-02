# ReportGen Frontend

Frontend de aplicación web para generación y gestión de reportes automatizados, conectándose a MCPs de MySQL y Gmail.

## 🚀 Características

- **Dashboard Interactivo**: Vista general con métricas y estado de conexiones
- **Generación de Reportes**: Formulario completo con preview en tiempo real
- **Visualización de Resultados**: KPIs, gráficos y tablas de datos
- **Reportes Programados**: Gestión de tareas cron para reportes automáticos
- **Configuración Avanzada**: Gestión de conexiones, grupos de destinatarios y consultas guardadas

## 🛠️ Tecnologías

- **Framework**: Next.js 15 + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: TanStack Query (React Query)
- **Gráficos**: Recharts
- **Formularios**: React Hook Form + Zod
- **Notificaciones**: Sonner
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend de agent-reportes ejecutándose (por defecto en `http://localhost:3000`)

## 🔧 Instalación

1. **Clonar el repositorio** (si aplica)

```bash
cd reportgen-frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ReportGen
```

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

### Modo Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
reportgen-frontend/
├── app/                      # App Router de Next.js
│   ├── page.tsx             # Dashboard principal
│   ├── reports/
│   │   ├── new/             # Formulario de nuevo reporte
│   │   └── [id]/            # Vista de resultados
│   ├── scheduler/           # Reportes programados
│   ├── settings/            # Configuración
│   ├── layout.tsx           # Layout raíz
│   ├── providers.tsx        # Providers (React Query, etc.)
│   └── globals.css          # Estilos globales
├── components/
│   ├── layout/              # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── ui/                  # Componentes UI reutilizables
│       └── Button.tsx
├── services/
│   └── api.ts               # Cliente API y endpoints
├── types/
│   └── report.types.ts      # Tipos TypeScript
├── lib/
│   └── utils.ts             # Utilidades
├── public/                  # Archivos estáticos
└── package.json

```

## 🔌 Integración con Backend

El frontend se conecta al backend de `agent-reportes` mediante los siguientes endpoints:

### Endpoints Disponibles

- `GET /health` - Estado del backend
- `POST /generate-report` - Generar y enviar reporte
- `GET /report-queries` - Obtener consultas predefinidas
- `POST /run-scheduled-report` - Ejecutar reporte programado

### Configuración del Backend

Asegúrate de que el backend esté configurado correctamente:

```bash
cd ../agent-reportes
npm run dev
```

El backend debe estar ejecutándose en `http://localhost:3000`

## 🎨 Diseño

El diseño sigue un tema oscuro moderno con:

- **Colores principales**: 
  - Background: `#0f1419` y `#0a0e1a`
  - Accent: Blue `#3B82F6`
  - Borders: Gray `#374151`

- **Tipografía**: Inter (Google Fonts)

- **Responsive**: Mobile-first design con breakpoints de Tailwind CSS

## 📱 Páginas Principales

### 1. Dashboard (`/`)
- Cards con métricas (reportes hoy, conexiones)
- Lista de reportes recientes
- Filtros por fecha y tipo

### 2. Generar Reporte (`/reports/new`)
- Selector de consultas predefinidas
- Configuración de fechas con presets
- Gestión de destinatarios y grupos
- Opciones de reporte (PDF/HTML, gráficos, CSV)
- Preview en tiempo real

### 3. Resultados (`/reports/[id]`)
- Indicador de progreso de generación
- KPIs con tendencias
- Gráficos (línea y barras)
- Tabla de datos paginada
- Acciones: descargar, reenviar, programar

### 4. Scheduler (`/scheduler`)
- Lista de reportes programados
- Toggle activo/inactivo
- Historial de ejecuciones
- CRUD de schedules

### 5. Settings (`/settings`)
- **Connections**: Gestión de MySQL y Gmail
- **Recipient Groups**: CRUD de grupos de emails
- **Saved Queries**: Gestión de consultas SQL

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén disponibles)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔒 Seguridad

- Validación client-side con Zod
- Sanitización de inputs
- Variables de entorno seguras con prefijo `NEXT_PUBLIC_`
- TypeScript strict mode habilitado

## 🌐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend MCP | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | `ReportGen` |

## 📝 Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Compila para producción
npm start            # Inicia el servidor de producción
npm run lint         # Ejecuta ESLint
npm run type-check   # Verifica tipos TypeScript
```

## 🤝 Flujo de Usuario Típico

1. Usuario accede al dashboard → Ve métricas y reportes recientes
2. Click "New Report" → Formulario de configuración
3. Selecciona "Ventas Diarias" → SQL se actualiza en preview
4. Elige "Última semana" → Fechas se completan automáticamente
5. Agrega emails o grupos → Validación inmediata
6. Click "Generate & Send" → Progreso en tiempo real
7. Resultados mostrados → KPIs, gráficos, tabla, opciones de reenvío

## 🐛 Troubleshooting

### El frontend no se conecta al backend

1. Verifica que el backend esté ejecutándose:
```bash
curl http://localhost:3000/health
```

2. Revisa la variable `NEXT_PUBLIC_API_URL` en `.env.local`

3. Verifica CORS en el backend (debe permitir `http://localhost:3001`)

### Errores de TypeScript

```bash
npm run type-check
```

### Errores de build

```bash
rm -rf .next
npm run build
```

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org/)
- [React Hook Form](https://react-hook-form.com/)

## 🔄 Próximas Características

- [ ] WebSocket para actualización en tiempo real
- [ ] Exportación a PDF de reportes
- [ ] Modo offline con PWA
- [ ] Editor SQL con syntax highlighting
- [ ] Compartir reportes con URLs
- [ ] Multi-tenant support

---

**Desarrollado con ❤️ para automatización de reportes empresariales**
