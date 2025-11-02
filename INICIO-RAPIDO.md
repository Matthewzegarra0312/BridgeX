# 🚀 Guía de Inicio Rápido - Sistema ReportGen Completo

Este documento te guiará paso a paso para ejecutar el sistema completo de ReportGen (Backend + Frontend).

## 📋 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    ReportGen System                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   Frontend       │         │    Backend       │     │
│  │   (Next.js)      │────────▶│  (agent-reportes)│     │
│  │   Port: 3001     │  HTTP   │   Port: 3000     │     │
│  └──────────────────┘         └──────────────────┘     │
│                                        │                 │
│                          ┌─────────────┼─────────────┐  │
│                          │             │             │  │
│                    ┌─────▼─────┐ ┌────▼─────┐ ┌────▼────┐
│                    │ MySQL MCP │ │ Gmail MCP│ │ Express │
│                    │  Server   │ │  Server  │ │  HTTP   │
│                    └───────────┘ └──────────┘ └─────────┘
│                          │             │                 │
│                    ┌─────▼─────┐ ┌────▼─────┐          │
│                    │  MySQL DB │ │ Gmail API│          │
│                    │           │ │          │          │
│                    └───────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Requisitos Previos

### Software Necesario

- **Node.js 18+** (con npm)
- **MySQL 5.7+** (para base de datos)
- **Cuenta Gmail** con API habilitada

### Verificar Instalaciones

```powershell
# Verificar Node.js y npm
node --version  # Debe ser >= 18.x
npm --version

# Verificar MySQL
mysql --version
```

## 📦 Estructura de Carpetas

```
BridgeX/
├── agent-reportes/        # Backend con MCPs
│   ├── src/
│   ├── package.json
│   └── .env (crear)
│
└── reportgen-frontend/    # Frontend Next.js
    ├── app/
    ├── package.json
    └── .env.local (crear)
```

## 🔧 Configuración del Backend (agent-reportes)

### 1. Navegar al directorio del backend

```powershell
cd c:\Users\gguerrem\Downloads\BridgeX\agent-reportes
```

### 2. Crear archivo `.env`

Crea un archivo `.env` en la raíz de `agent-reportes`:

```env
# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reports_db
DB_USER=root
DB_PASS=tu_password_mysql
DB_SSL=false
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=30000

# Gmail Configuration
GMAIL_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=tu_client_secret
GMAIL_REFRESH_TOKEN=tu_refresh_token
GMAIL_REDIRECT_URI=http://localhost:3000/oauth2callback
GMAIL_EMAIL=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password

# Server Configuration
PORT=3000
HOST=localhost
ENABLE_CRON=true
CRON_SCHEDULE=0 9 * * *

# Report Configuration
DEFAULT_RECIPIENTS=admin@empresa.com
DEFAULT_REPORT_TYPE=ventas_diarias
```

### 3. Configurar Base de Datos MySQL

```sql
-- Crear base de datos
CREATE DATABASE reports_db;

-- Usar la base de datos
USE reports_db;

-- Crear tabla de ventas (ejemplo)
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME,
    producto VARCHAR(255),
    categoria VARCHAR(100),
    cantidad INT,
    precio DECIMAL(10, 2),
    cliente_id INT,
    total DECIMAL(10, 2)
);

-- Insertar datos de ejemplo
INSERT INTO ventas (fecha, producto, categoria, cantidad, precio, cliente_id, total) VALUES
('2023-10-01 10:00:00', 'Laptop HP', 'Electrónicos', 2, 15000.00, 1, 30000.00),
('2023-10-01 11:30:00', 'Mouse Logitech', 'Accesorios', 5, 250.00, 2, 1250.00),
('2023-10-02 09:15:00', 'Teclado Mecánico', 'Accesorios', 1, 1200.00, 3, 1200.00);
```

### 4. Instalar dependencias

```powershell
npm install
```

### 5. Iniciar el backend

```powershell
# Modo desarrollo
npm run dev

# O modo producción
npm run build
npm start
```

**El backend estará corriendo en: `http://localhost:3000`**

### 6. Verificar que el backend funciona

```powershell
# Desde otra terminal
curl http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2023-10-28T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🎨 Configuración del Frontend (reportgen-frontend)

### 1. Navegar al directorio del frontend

```powershell
cd c:\Users\gguerrem\Downloads\BridgeX\reportgen-frontend
```

### 2. El archivo `.env.local` ya debería existir

Verifica que contenga:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ReportGen
```

### 3. Las dependencias ya están instaladas

Si no, ejecuta:

```powershell
npm install
```

### 4. Iniciar el frontend

```powershell
npm run dev
```

**El frontend estará corriendo en: `http://localhost:3001`**

## 🚀 Acceder a la Aplicación

1. Abre tu navegador en: **http://localhost:3001**
2. Deberías ver el Dashboard de ReportGen
3. Las páginas disponibles son:
   - `/` - Dashboard principal
   - `/reports/new` - Crear nuevo reporte
   - `/scheduler` - Reportes programados
   - `/settings` - Configuración

## 🧪 Probar el Sistema

### Test 1: Verificar conexiones

1. Ve a `/settings`
2. En la pestaña "Connections"
3. Verifica que MySQL y Gmail muestren estado "Connected" (verde)

### Test 2: Generar un reporte

1. Ve a `/reports/new`
2. Selecciona "Ventas Diarias"
3. Elige el rango de fechas
4. Agrega un email de destinatario
5. Click en "Generate & Send"
6. Deberías ver el progreso y luego los resultados

### Test 3: Ver reportes recientes

1. Ve al Dashboard (`/`)
2. Verifica que aparezcan las métricas
3. Revisa la tabla de "Recent Reports"

## 🔍 Solución de Problemas Comunes

### ❌ Error: "Cannot connect to MySQL"

**Solución:**
1. Verifica que MySQL esté corriendo:
   ```powershell
   # Windows
   Get-Service -Name MySQL*
   ```
2. Verifica credenciales en `.env`
3. Prueba la conexión manualmente:
   ```powershell
   mysql -u root -p -h localhost
   ```

### ❌ Error: "Gmail authentication failed"

**Solución:**
1. Verifica que tengas las credenciales correctas en `.env`
2. Habilita "Apps menos seguras" en Gmail o usa contraseña de aplicación
3. Sigue la guía de OAuth2 de Google

### ❌ Frontend no se conecta al Backend

**Solución:**
1. Verifica que el backend esté corriendo:
   ```powershell
   curl http://localhost:3000/health
   ```
2. Verifica `NEXT_PUBLIC_API_URL` en `.env.local`
3. Revisa la consola del navegador (F12) para errores de CORS

### ❌ Puerto 3000 o 3001 ya está en uso

**Solución:**
```powershell
# Ver qué proceso usa el puerto
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Cambiar puerto en package.json:
# Backend: Editar PORT en .env
# Frontend: Editar script "dev" en package.json
```

## 📝 Scripts Útiles

### Backend (agent-reportes)

```powershell
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Ejecutar tests
npm run lint         # Linting
```

### Frontend (reportgen-frontend)

```powershell
npm run dev          # Desarrollo (puerto 3001)
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 🎯 Flujo de Trabajo Completo

### Ejemplo: Generar Reporte de Ventas Diarias

1. **Iniciar Backend**
   ```powershell
   cd agent-reportes
   npm run dev
   ```

2. **Iniciar Frontend** (en otra terminal)
   ```powershell
   cd reportgen-frontend
   npm run dev
   ```

3. **Acceder a la app**: `http://localhost:3001`

4. **Crear reporte**:
   - Click "New Report"
   - Seleccionar "Ventas Diarias"
   - Rango: "Last 7 Days"
   - Agregar emails
   - Click "Generate & Send"

5. **Ver resultados**:
   - KPIs automáticos
   - Gráficos de tendencias
   - Tabla de datos

6. **Email enviado**:
   - Los destinatarios reciben el reporte por email
   - Incluye gráficos y CSV adjunto

## 🔐 Seguridad

- **Nunca** subas archivos `.env` o `.env.local` a Git
- Usa variables de entorno para secretos
- Las credenciales de MySQL y Gmail son sensibles
- Implementa autenticación en producción

## 📚 Próximos Pasos

- [ ] Configurar OAuth2 completo para Gmail
- [ ] Agregar más consultas SQL predefinidas
- [ ] Configurar reportes programados (cron)
- [ ] Implementar autenticación de usuarios
- [ ] Deploy a producción (Vercel + Railway/AWS)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del backend en la terminal
2. Revisa la consola del navegador (F12)
3. Verifica las configuraciones en `.env` y `.env.local`
4. Consulta el README.md de cada proyecto

---

**¡Listo! 🎉 Ahora tienes el sistema ReportGen completo funcionando.**

Para cualquier duda, revisa la documentación de cada componente:
- Backend: `agent-reportes/README.md`
- Frontend: `reportgen-frontend/README.md`
