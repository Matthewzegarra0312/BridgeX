# 🤖 Agente de Reportes - MCP MySQL ↔ Gmail

Un agente inteligente que ejecuta consultas en MySQL mediante Model Context Protocol (MCP), genera reportes automáticos con KPIs y los envía por correo usando Gmail.

## 🎯 Características Principales

- ✅ **Servidor MCP MySQL** - Ejecuta consultas SQL parametrizadas de forma segura
- ✅ **Servidor MCP Gmail** - Envía emails con plantillas HTML y adjuntos CSV
- ✅ **Generación de KPIs** - Calcula métricas automáticamente (totales, promedios, variaciones)
- ✅ **Reportes Automáticos** - Programación con cron para envío regular
- ✅ **Plantillas HTML** - Emails formateados con tablas y gráficos
- ✅ **Manejo de Errores** - Reintentos exponenciales y logging detallado
- ✅ **APIs RESTful** - Endpoints HTTP para integración externa
- ✅ **TypeScript** - Código fuertemente tipado y documentado

## 🏗️ Arquitectura

```
[Usuario/CRON] → [Agente LLM] → [MCP mcp.mysql.query] → [Transformación/Reporte] → [MCP mcp.gmail.send]
```

### Componentes:

1. **MySQL MCP Server** (`src/mcp/mysql-server.ts`)
   - Herramientas: `mysql_query`, `mysql_schema`, `mysql_ping`
   - Conexión segura con pool de conexiones
   - Parámetros SQL seguros contra inyección

2. **Gmail MCP Server** (`src/mcp/gmail-server.ts`) 
   - Herramientas: `gmail_send`, `gmail_send_report`, `gmail_auth_status`
   - OAuth2 y App Password support
   - Plantillas HTML con Handlebars

3. **Agente Orquestador** (`src/agent.ts`)
   - Coordina MySQL y Gmail MCPs
   - Genera KPIs y métricas automáticamente
   - Programa tareas con node-cron

4. **Generador de Reportes** (`src/utils/report-generator.ts`)
   - Calcula KPIs automáticamente
   - Genera CSV y HTML
   - Comparaciones con períodos anteriores

## 🚀 Instalación Rápida

### 1. Clonar e Instalar

```bash
git clone <repository-url>
cd agent-reportes
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos MySQL
mysql -u root -p < examples/database-setup.sql
```

### 4. Configurar Gmail OAuth2

#### Opción A: OAuth2 (Recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la Gmail API
4. Crea credenciales OAuth2 para aplicación web
5. Agrega `http://localhost:3000/oauth2callback` a URIs de redirección
6. Ejecuta el script de configuración:

```bash
npm run setup-gmail-oauth
```

#### Opción B: App Password (Alternativo)

1. Activa verificación en 2 pasos en Gmail
2. Ve a Configuración de cuenta > Seguridad > Contraseñas de aplicaciones
3. Genera contraseña para "Correo"
4. Configura en `.env`:

```env
GMAIL_EMAIL=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_password_16_chars
```

### 5. Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📊 Uso

### Generar Reporte Manual

```bash
curl -X POST http://localhost:3000/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT DATE(fecha) as fecha, SUM(monto) as total FROM ventas WHERE fecha BETWEEN :desde AND :hasta GROUP BY DATE(fecha)",
    "period": {
      "start": "2024-11-01 00:00:00",
      "end": "2024-11-07 23:59:59", 
      "label": "Semana del 1-7 nov 2024"
    },
    "recipients": ["finanzas@empresa.com", "gerencia@empresa.com"],
    "reportType": "Ventas Semanales",
    "includeComparison": true
  }'
```

### Reporte Programado

```bash
curl -X POST http://localhost:3000/run-scheduled-report \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "ventas_diarias",
    "recipients": ["manager@empresa.com"]
  }'
```

### Ejemplo Programático

```typescript
import { ReportAgent, createConfigFromEnv } from './src/index.js';

const config = createConfigFromEnv();
const agent = new ReportAgent(config);

await agent.start();

const result = await agent.generateReport({
  query: "SELECT * FROM ventas WHERE fecha BETWEEN :desde AND :hasta",
  period: {
    start: "2024-11-01 00:00:00",
    end: "2024-11-01 23:59:59",
    label: "1 de noviembre"
  },
  recipients: ["test@example.com"],
  reportType: "Ventas Diarias"
});

console.log(result);
```

## 📋 Consultas Predefinidas

El sistema incluye consultas SQL predefinidas optimizadas:

### `ventas_diarias`
```sql
SELECT 
  DATE(fecha) as fecha,
  COUNT(*) as total_transacciones,
  SUM(monto) as total_ventas,  
  AVG(monto) as promedio_venta
FROM ventas 
WHERE fecha BETWEEN :desde AND :hasta
GROUP BY DATE(fecha)
ORDER BY fecha DESC
```

### `productos_top`
```sql
SELECT 
  p.nombre as producto,
  COUNT(v.id) as cantidad_vendida,
  SUM(v.monto) as total_ventas,
  AVG(v.monto) as precio_promedio
FROM ventas v
JOIN productos p ON v.producto_id = p.id
WHERE v.fecha BETWEEN :desde AND :hasta
GROUP BY p.id, p.nombre
ORDER BY total_ventas DESC
LIMIT 10
```

### `clientes_activos`
```sql
SELECT 
  c.nombre as cliente,
  COUNT(v.id) as total_compras,
  SUM(v.monto) as total_gastado,
  MAX(v.fecha) as ultima_compra
FROM clientes c
JOIN ventas v ON c.id = v.cliente_id
WHERE v.fecha BETWEEN :desde AND :hasta
GROUP BY c.id, c.nombre
ORDER BY total_gastado DESC
LIMIT 20
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reportes_db
DB_USER=reportes_user
DB_PASS=password

# Gmail OAuth2
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret  
GMAIL_REFRESH_TOKEN=your_refresh_token

# Servidor
PORT=3000
HOST=localhost
LOG_LEVEL=info

# Cron
ENABLE_CRON=true
CRON_SCHEDULE=0 9 * * *
DEFAULT_RECIPIENTS=finanzas@empresa.com,gerencia@empresa.com
```

### Programación de Reportes

El sistema soporta programación con sintaxis cron:

- `0 9 * * *` - Diario a las 9:00 AM
- `0 9 * * 1-5` - Lunes a viernes a las 9:00 AM  
- `0 */6 * * *` - Cada 6 horas
- `0 0 1 * *` - Primer día de cada mes

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Lint
npm run lint
npm run lint:fix
```

## 📊 KPIs Generados Automáticamente

El sistema calcula automáticamente:

1. **Total de Registros** - Número total de filas
2. **Total de Ventas** - Suma de columnas numéricas
3. **Promedio** - Promedio de valores numéricos
4. **Variación vs Período Anterior** - Porcentaje de cambio
5. **Top 5 Elementos** - Elementos más frecuentes

## 🔒 Seguridad

- ✅ **Parámetros SQL seguros** - Prevención de inyección SQL
- ✅ **Conexiones TLS** - Cifrado de base de datos
- ✅ **OAuth2** - Autenticación segura con Gmail
- ✅ **Variables de entorno** - Secretos no en código
- ✅ **Validación de entrada** - Esquemas Zod
- ✅ **Rate limiting** - Protección contra abuso

## 📋 API Endpoints

### Principales

- `POST /generate-report` - Generar y enviar reporte
- `POST /run-scheduled-report` - Ejecutar reporte programado
- `GET /health` - Estado del servicio
- `GET /report-queries` - Consultas disponibles

### MCP Servers

- `POST /mcp/mysql` - Servidor MCP MySQL
- `POST /mcp/gmail` - Servidor MCP Gmail

## 🐛 Troubleshooting

### Error de Conexión MySQL

```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Probar conexión
mysql -h localhost -u reportes_user -p reportes_db
```

### Error de Autenticación Gmail

```bash
# Verificar variables de entorno
echo $GMAIL_CLIENT_ID
echo $GMAIL_CLIENT_SECRET

# Regenerar refresh token
npm run setup-gmail-oauth
```

### Error de Dependencias

```bash
# Limpiar node_modules  
rm -rf node_modules package-lock.json
npm install

# Verificar versiones
npm ls
```

## 🚀 Despliegue en Producción

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY examples/ ./examples/

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  agent-reportes:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_NAME=reportes_db
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: reportes_db
    volumes:
      - ./examples/database-setup.sql:/docker-entrypoint-initdb.d/init.sql
```

### PM2

```bash
# Instalar PM2
npm install -g pm2

# Configurar ecosystem
echo 'module.exports = {
  apps: [{
    name: "agent-reportes",
    script: "dist/index.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}' > ecosystem.config.js

# Ejecutar
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Guías de Contribución

- Seguir convenciones de TypeScript
- Agregar tests para nueva funcionalidad
- Actualizar documentación
- Ejecutar `npm run lint` antes de commit

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- 📧 Email: soporte@empresa.com
- 💬 Issues: [GitHub Issues](https://github.com/tu-usuario/agent-reportes/issues)
- 📖 Docs: [Documentación completa](https://docs.empresa.com/agent-reportes)

## 🎉 Agradecimientos

- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocolo MCP
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - SDK oficial
- Comunidad de desarrolladores MCP

---

**Desarrollado con ❤️ usando TypeScript y Model Context Protocol**