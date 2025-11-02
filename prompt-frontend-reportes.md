# Reto 2 — Frontend de Reportes (React + MCP Integration)

**Objetivo:**
Desarrollar una aplicación web React que permita configurar, generar y visualizar reportes interactivos conectándose a los MCPs de MySQL y Gmail del backend.

## Alcance y entregables

1. **Configuración inicial:**
   * Un archivo `package.json` con dependencias para React 18+, TypeScript, Tailwind CSS, React Query y bibliotecas de gráficos
   * Configuración `vite.config.ts` o `next.config.js` según framework elegido
   * Variables de entorno en `.env.local`:
     * `NEXT_PUBLIC_API_URL` - URL del backend MCP (ej: `http://localhost:3000`)
     * `NEXT_PUBLIC_APP_NAME` - Nombre de la aplicación

2. **Página principal - Dashboard de Reportes:**
   * Layout responsivo con sidebar de navegación
   * Cards resumen con métricas principales:
     * Total de reportes generados hoy/semana/mes
     * Estado de conexión MySQL (verde/rojo)
     * Estado de conexión Gmail (verde/rojo)
     * Último reporte enviado (fecha/hora)
   * Lista de reportes recientes con filtros por fecha y tipo

3. **Formulario de Generación de Reportes:**
   * **Sección 1 - Configuración de consulta:**
     * Selector de consulta predefinida (dropdown):
       - "Ventas Diarias" → `ventas_diarias`
       - "Productos Top" → `productos_top`
       - "Clientes Activos" → `clientes_activos`
       - "Consulta Personalizada" → textarea SQL libre
     * Selector de rango de fechas (datepicker):
       - Presets: "Hoy", "Ayer", "Última semana", "Último mes"
       - Selector personalizado desde/hasta
     * Preview de consulta SQL (solo lectura, formateado)
   
   * **Sección 2 - Configuración de destinatarios:**
     * Campo de emails múltiples con validación
     * Selector de grupos predefinidos:
       - "Finanzas" → `finanzas@empresa.com`
       - "Gerencia" → `gerencia@empresa.com, director@empresa.com`
       - "Analítica" → `analitica@empresa.com, bi@empresa.com`
     * Botón "Agregar destinatario" para emails individuales
   
   * **Sección 3 - Opciones del reporte:**
     * Campo de asunto del email (editable)
     * Selector de tipo de reporte:
       - "Ejecutivo" → Solo KPIs principales
       - "Detallado" → KPIs + tabla completa
       - "Comparativo" → Incluir comparación con período anterior
     * Checkbox "Incluir gráficos" (opcional)
     * Checkbox "Adjuntar CSV"

4. **Preview en tiempo real:**
   * Panel lateral que muestre:
     * Vista previa de la consulta SQL con parámetros reemplazados
     * Estimación de registros a consultar
     * Lista de destinatarios formateada
     * Asunto del email final
   * Botón "Probar consulta" que ejecute sin enviar email

5. **Página de Resultados:**
   * Visualización de datos en tiempo real mientras se ejecuta:
     * Indicador de progreso: "Conectando a base de datos..." → "Ejecutando consulta..." → "Generando reporte..." → "Enviando emails..."
   * Resultados mostrados en:
     * **KPIs Cards**: Métricas principales con iconos y colores
     * **Tabla de datos**: Paginada, ordenable, con búsqueda
     * **Gráficos**: Chart.js o Recharts con datos visualizados
   * **Panel de acciones**:
     * "Descargar CSV"
     * "Reenviar reporte"
     * "Programar reporte" → Modal de configuración cron

6. **Configuración de Reportes Programados:**
   * Lista de tareas cron configuradas
   * Formulario para crear/editar programaciones:
     * Selector de frecuencia: "Diario", "Semanal", "Mensual", "Personalizado"
     * Hora de ejecución (time picker)
     * Días de la semana (para semanal)
     * Día del mes (para mensual)
     * Configuración avanzada cron (texto libre)
   * Toggle activar/desactivar cada programación
   * Historial de ejecuciones con estado (exitoso/fallido)

7. **Página de Configuración:**
   * **Conexiones**:
     * Test de conexión MySQL con botón "Probar conexión"
     * Estado de autenticación Gmail con botón "Reautenticar"
     * Configuración de SMTP alternativo
   * **Destinatarios predefinidos**:
     * CRUD de grupos de emails
     * Validación de emails con indicador visual
   * **Consultas personalizadas**:
     * Editor SQL con syntax highlighting
     * Validador de consultas
     * Guardar/cargar consultas favoritas

## Estructura de componentes React

```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          // Barra superior con usuario
│   │   ├── Sidebar.tsx         // Navegación lateral
│   │   └── Layout.tsx          // Layout principal
│   ├── forms/
│   │   ├── ReportForm.tsx      // Formulario principal
│   │   ├── QuerySelector.tsx   // Selector de consultas
│   │   ├── DateRangePicker.tsx // Selector de fechas
│   │   └── EmailInput.tsx      // Input múltiple emails
│   ├── charts/
│   │   ├── KPICard.tsx         // Card de métricas
│   │   ├── DataTable.tsx       // Tabla de resultados
│   │   └── ReportChart.tsx     // Gráficos
│   └── ui/
│       ├── Button.tsx          // Botones reutilizables
│       ├── Modal.tsx           // Modales
│       └── LoadingSpinner.tsx  // Indicadores de carga
├── pages/
│   ├── Dashboard.tsx           // Página principal
│   ├── GenerateReport.tsx      // Generar reporte
│   ├── ReportResults.tsx       // Mostrar resultados
│   ├── ScheduledReports.tsx    // Reportes programados
│   └── Settings.tsx            // Configuración
├── hooks/
│   ├── useReports.ts           // Hook para reportes
│   ├── useMCPConnection.ts     // Hook conexiones MCP
│   └── useRealTimeData.ts      // Hook datos en tiempo real
├── services/
│   ├── api.ts                  // Cliente HTTP para backend
│   ├── mcpClient.ts            // Cliente MCP directo
│   └── validation.ts           // Esquemas de validación
└── types/
    ├── report.types.ts         // Tipos de reportes
    ├── mcp.types.ts            // Tipos MCP
    └── api.types.ts            // Tipos API
```

## Integración con MCPs del backend

### Endpoints a consumir:

1. **GET /health**
   - Verificar estado del backend y conexiones

2. **POST /generate-report**
   ```typescript
   interface GenerateReportRequest {
     query: string;
     period: {
       start: string;
       end: string;
       label: string;
     };
     recipients: string[];
     reportType: string;
     includeComparison?: boolean;
     includeCharts?: boolean;
     attachCSV?: boolean;
   }
   ```

3. **GET /report-queries**
   - Obtener consultas predefinidas disponibles

4. **POST /run-scheduled-report**
   - Ejecutar reporte programado manualmente

5. **WebSocket /ws/report-progress**
   - Seguimiento en tiempo real del progreso de generación

### Comunicación MCP directa (opcional):

```typescript
// Para preview de datos sin enviar email
const previewData = await mcpClient.mysql.query({
  sql: selectedQuery,
  params: { desde: startDate, hasta: endDate }
});

// Para verificar estado de Gmail
const gmailStatus = await mcpClient.gmail.authStatus();
```

## UX/UI Requirements

1. **Diseño responsivo** - Mobile-first con Tailwind CSS
2. **Estados de carga** - Spinners y skeleton screens
3. **Validación en tiempo real** - Campos de formulario con feedback inmediato
4. **Accesibilidad** - ARIA labels, navegación por teclado
5. **Temas** - Modo claro/oscuro con persistencia
6. **Notificaciones** - Toast notifications para éxito/error
7. **Shortcuts** - Atajos de teclado para acciones frecuentes

## Ejemplo de flujo de usuario

1. **Usuario accede al dashboard** → Ve métricas y reportes recientes
2. **Click "Generar Reporte"** → Formulario con configuración
3. **Selecciona "Ventas Diarias"** → Consulta SQL se actualiza en preview
4. **Elige "Última semana"** → Fechas se completan automáticamente
5. **Agrega emails** → Validación inmediata, sugerencias de grupos
6. **Click "Probar consulta"** → Preview de datos sin enviar email
7. **Click "Generar y Enviar"** → Progreso en tiempo real
8. **Resultados mostrados** → KPIs, tabla, opción de reenvío

## Tecnologías sugeridas

* **Framework**: Next.js 14+ o Vite + React 18
* **Styling**: Tailwind CSS + HeadlessUI o shadcn/ui
* **Estado**: Zustand o React Query para server state
* **Gráficos**: Chart.js, Recharts o D3.js
* **Formularios**: React Hook Form + Zod validation
* **Fechas**: date-fns o dayjs
* **HTTP**: Axios o fetch con React Query
* **WebSockets**: Socket.io-client para tiempo real

## Testing y calidad

* **Unit tests**: Jest + React Testing Library
* **E2E tests**: Playwright o Cypress
* **Casos de prueba críticos**:
  - Envío de reporte completo end-to-end
  - Validación de formularios con datos inválidos
  - Reconexión automática cuando backend falla
  - Responsive design en móviles
* **Linting**: ESLint + Prettier
* **Type checking**: TypeScript strict mode

## Seguridad frontend

* **Validación client-side**: Nunca confiar solo en frontend
* **Sanitización**: Escape de HTML en datos dinámicos
* **CSP headers**: Content Security Policy configurado
* **Env vars**: Variables públicas con prefijo `NEXT_PUBLIC_`
* **Error boundaries**: Captura de errores React
* **Rate limiting visual**: Disable buttons durante requests

## Extensiones opcionales

* **PWA**: Service worker para uso offline
* **Exportación**: PDF generation de reportes
* **Colaboración**: Comentarios en reportes
* **Alertas**: Notificaciones push cuando reportes fallan
* **Audit log**: Historial de acciones del usuario
* **Multi-tenant**: Soporte para múltiples organizaciones