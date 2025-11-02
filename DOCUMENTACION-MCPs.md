# 📘 DOCUMENTACIÓN DE MCPs (Model Context Protocol Servers)

## 🔍 ¿Qué son los MCPs?

Los **Model Context Protocol (MCP) Servers** son servidores especializados que exponen funcionalidades específicas a través de herramientas (tools) que pueden ser consumidas por agentes o aplicaciones.

En este proyecto, tenemos **2 MCPs**:
1. **MySQL MCP Server** - Para consultas a bases de datos
2. **Gmail MCP Server** - Para envío de emails

---

## 📊 MySQL MCP Server

### Ubicación
`agent-reportes/src/mcp/mysql-server.ts`

### Configuración
```typescript
{
  host: string;        // localhost
  port: number;        // 3306
  database: string;    // reportes_db
  user: string;        // tu_usuario
  password: string;    // tu_contraseña
  ssl: boolean;        // false para local
  connectionLimit: number;    // 10
  acquireTimeout: number;     // 60000
  timeout: number;            // 30000
}
```

### Herramientas (Tools)

#### 1. `mysql_query`
Ejecuta consultas SQL con parámetros nombrados.

**Input:**
```typescript
{
  sql: string;           // Query SQL con parámetros :nombre
  params?: Record<string, any>;  // { nombre: valor }
}
```

**Output:**
```typescript
{
  columns: string[];     // Nombres de columnas
  rows: any[][];         // Datos en formato matriz
  rowCount: number;      // Número de filas
  executionTime: number; // Tiempo en ms
}
```

**Ejemplo:**
```typescript
{
  sql: "SELECT * FROM ventas WHERE fecha >= :desde AND fecha <= :hasta",
  params: {
    desde: "2025-01-01 00:00:00",
    hasta: "2025-01-31 23:59:59"
  }
}
```

#### 2. `mysql_schema`
Obtiene información del esquema de la base de datos.

**Input:**
```typescript
{
  table?: string;  // Opcional: nombre de tabla específica
}
```

**Output:**
```typescript
{
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      key?: string;  // PRI, UNI, MUL
    }>;
  }>;
}
```

#### 3. `mysql_ping`
Verifica el estado de la conexión.

**Input:**
```typescript
{}
```

**Output:**
```typescript
{
  connected: boolean;
  message: string;
  responseTime?: number;  // ms
}
```

### Endpoints HTTP

El MySQL MCP está expuesto a través de:
```
POST http://localhost:3000/mcp/mysql
```

**Ejemplo de llamada:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "mysql_query",
    "arguments": {
      "sql": "SELECT COUNT(*) as total FROM ventas",
      "params": {}
    }
  },
  "id": 1
}
```

---

## 📧 Gmail MCP Server

### Ubicación
`agent-reportes/src/mcp/gmail-server.ts`

### Configuración (Simplificada con SMTP)
```typescript
{
  email: string;        // tucorreo@gmail.com
  appPassword: string;  // abcdefghijklmnop (16 caracteres)
}
```

### SMTP Config (Interno)
```typescript
{
  host: "smtp.gmail.com",
  port: 587,
  secure: false,  // true para port 465
  auth: {
    user: email,
    pass: appPassword
  }
}
```

### Herramientas (Tools)

#### 1. `gmail_send`
Envía un email básico con soporte para adjuntos.

**Input:**
```typescript
{
  to: string[];           // ["dest1@example.com", "dest2@example.com"]
  cc?: string[];          // Opcional
  bcc?: string[];         // Opcional
  subject: string;        // Asunto del email
  body_text?: string;     // Cuerpo en texto plano
  body_html?: string;     // Cuerpo en HTML
  attachments?: Array<{
    filename: string;
    content_base64: string;  // Contenido en base64
    mimeType: string;        // "text/csv", "application/pdf", etc.
  }>;
}
```

**Output:**
```typescript
{
  status: "sent" | "failed";
  message_id?: string;      // ID del mensaje enviado
  error?: string;           // Mensaje de error si falla
  recipients_count: number;
  sent_at: string;          // ISO 8601 timestamp
}
```

#### 2. `gmail_send_report`
Envía un reporte formateado con plantilla HTML predefinida.

**Input:**
```typescript
{
  to: string[];
  cc?: string[];
  reportType: string;         // "Ventas Diarias", etc.
  date: string;               // "02/11/2025"
  period: string;             // "01/11/2025 - 02/11/2025"
  kpis: Array<{
    label: string;            // "Total Ventas"
    value: string;            // "$12,345.67"
  }>;
  tableHeaders?: string[];    // ["Producto", "Cantidad", "Monto"]
  tableData?: any[][];        // [["Laptop", 5, 6499.95], ...]
  csvContent?: string;        // Contenido CSV para adjuntar
  hasData: boolean;           // true si hay datos
}
```

**Output:**
Igual que `gmail_send`.

**Plantilla HTML:**
- Header con título del reporte
- KPIs en tarjetas
- Tabla de datos (si hay)
- Footer con instrucciones
- Adjunto CSV automático

#### 3. `gmail_auth_status`
Verifica el estado de autenticación SMTP.

**Input:**
```typescript
{}
```

**Output:**
```typescript
{
  authenticated: boolean;
  email?: string;
  message: string;
}
```

### Endpoints HTTP

El Gmail MCP está expuesto a través de:
```
POST http://localhost:3000/mcp/gmail
```

**Ejemplo de llamada:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "gmail_send_report",
    "arguments": {
      "to": ["gerencia@empresa.com"],
      "reportType": "Ventas Diarias",
      "date": "02/11/2025",
      "period": "02/11/2025",
      "kpis": [
        { "label": "Total Ventas", "value": "$12,345.67" },
        { "label": "Número de Ventas", "value": "42" }
      ],
      "hasData": true,
      "csvContent": "producto,cantidad,monto\nLaptop,5,6499.95"
    }
  },
  "id": 1
}
```

---

## 🔗 Integración en el Backend

### Agent (Orquestador)
`agent-reportes/src/agent.ts`

El **Agent** es el orquestador que:
1. Recibe peticiones HTTP del frontend
2. Llama a los MCPs según sea necesario
3. Procesa y combina resultados
4. Devuelve respuestas al frontend

### Flujo de Generación de Reporte

```
Frontend                Agent                MySQL MCP           Gmail MCP
   |                      |                      |                   |
   |--POST /generate-report-->                   |                   |
   |                      |                      |                   |
   |                      |--mysql_query-------->|                   |
   |                      |<--results------------|                   |
   |                      |                      |                   |
   |                      |--mysql_query (prev)->|                   |
   |                      |<--prev results-------|                   |
   |                      |                      |                   |
   |                      |--generate KPIs       |                   |
   |                      |--format data         |                   |
   |                      |                      |                   |
   |                      |--gmail_send_report----------------->     |
   |                      |<--email confirmation----------------------|
   |                      |                      |                   |
   |<--JSON response------|                      |                   |
   |                      |                      |                   |
```

### Endpoints del Agent

#### 1. `GET /health`
Health check del servicio.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "version": "1.0.0"
}
```

#### 2. `POST /generate-report`
Genera y envía un reporte.

**Request:**
```json
{
  "query": "SELECT ...",
  "period": {
    "start": "2025-01-01 00:00:00",
    "end": "2025-01-31 23:59:59",
    "label": "Enero 2025"
  },
  "recipients": ["gerencia@empresa.com"],
  "reportType": "ventas_diarias",
  "includeComparison": true
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "type": "ventas_diarias",
    "period": {...},
    "summary": "Reporte generado exitosamente",
    "kpis": [...],
    "dataRows": 42,
    "hasData": true
  },
  "email": {
    "status": "sent",
    "messageId": "...",
    "recipients": ["gerencia@empresa.com"],
    "sentAt": "2025-11-02T..."
  },
  "generatedAt": "2025-11-02T..."
}
```

#### 3. `POST /run-scheduled-report`
Ejecuta un reporte programado manualmente.

**Request:**
```json
{
  "reportType": "ventas_diarias",
  "recipients": ["finanzas@empresa.com"]
}
```

#### 4. `GET /report-queries`
Lista las queries de reporte predefinidas.

**Response:**
```json
{
  "ventas_diarias": {
    "sql": "SELECT ...",
    "description": "Reporte de ventas diarias",
    "kpiCalculators": {...}
  }
}
```

---

## 🔐 Seguridad

### MySQL
- Conexiones a través de pool
- Parámetros nombrados para prevenir SQL injection
- Timeout configurables
- Reintentos automáticos

### Gmail SMTP
- Autenticación con App Password
- TLS habilitado
- Reintentos automáticos en caso de fallo
- Validación de emails con Zod

### Variables de Entorno
- Credenciales nunca hardcodeadas
- Archivo `.env` en `.gitignore`
- Validación con Zod schemas

---

## 🛠️ Utilidades Compartidas

### Logger (`utils/logger.ts`)
Winston logger con niveles:
- `info`: Información general
- `warn`: Advertencias
- `error`: Errores con stack trace

### Retry (`utils/retry.ts`)
- `retryWithExponentialBackoff`: Reintentos con backoff exponencial
- `retryNetworkOperation`: Específico para operaciones de red

### Report Generator (`utils/report-generator.ts`)
- Genera reportes con KPIs
- Calcula tendencias (comparación con período anterior)
- Formatea datos para email
- Genera CSV

---

## 📦 Dependencias Clave

```json
{
  "@modelcontextprotocol/sdk": "^1.0.2",  // MCP SDK
  "mysql2": "^3.11.4",                     // MySQL driver
  "nodemailer": "^6.9.7",                  // SMTP cliente
  "express": "^4.21.1",                    // HTTP server
  "zod": "^3.23.8",                        // Validación
  "handlebars": "^4.7.8",                  // Templates
  "winston": "^3.15.0",                    // Logging
  "node-cron": "^3.0.3"                    // Tareas programadas
}
```

---

## 🧪 Testing

Los MCPs se pueden probar independientemente:

```typescript
// Test MySQL MCP
const mysqlServer = new MySQLMCPServer(config);
await mysqlServer.connect();
const result = await mysqlServer.callTool('mysql_query', {
  sql: 'SELECT 1',
  params: {}
});

// Test Gmail MCP
const gmailServer = new GmailMCPServer(config);
await gmailServer.authenticate();
const result = await gmailServer.callTool('gmail_auth_status', {});
```

---

## 📚 Recursos Adicionales

- MCP Specification: https://modelcontextprotocol.io/
- MySQL2 Docs: https://github.com/sidorares/node-mysql2
- Nodemailer Docs: https://nodemailer.com/
- Express Docs: https://expressjs.com/

---

## 🔄 Actualizaciones Recientes

**v1.0.0 (02/11/2025)**
- Simplificado Gmail MCP para usar SMTP con App Password
- Eliminada dependencia de OAuth2
- Mejoras en manejo de errores
- Documentación completa
