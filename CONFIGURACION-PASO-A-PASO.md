# 🔧 GUÍA COMPLETA DE CONFIGURACIÓN - ReportGen System

Esta guía te llevará paso a paso para configurar completamente el sistema ReportGen desde cero.

## 📑 Índice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Configuración de MySQL](#2-configuración-de-mysql)
3. [Configuración de Gmail API](#3-configuración-de-gmail-api)
4. [Configuración del Backend](#4-configuración-del-backend)
5. [Configuración del Frontend](#5-configuración-del-frontend)
6. [Verificación y Pruebas](#6-verificación-y-pruebas)
7. [Solución de Problemas](#7-solución-de-problemas)

---

## 1. Requisitos Previos

### Software Necesario

✅ **Node.js 18+**
```powershell
# Descargar de: https://nodejs.org/
# Verificar instalación:
node --version  # Debe mostrar v18.x o superior
npm --version
```

✅ **MySQL 5.7+ o 8.0+**
```powershell
# Descargar de: https://dev.mysql.com/downloads/mysql/
# Verificar instalación:
mysql --version
```

✅ **Git** (opcional pero recomendado)
```powershell
git --version
```

✅ **Cuenta de Gmail** con acceso a Google Cloud Console

---

## 2. Configuración de MySQL

### Paso 2.1: Instalar y Arrancar MySQL

**Windows:**
1. Descarga MySQL desde https://dev.mysql.com/downloads/mysql/
2. Instala con el wizard (usa "Development Computer" como configuración)
3. Anota la contraseña de root que configures
4. Verifica que el servicio esté corriendo:

```powershell
Get-Service -Name MySQL*
# Debe mostrar: Running
```

### Paso 2.2: Crear Base de Datos y Usuario

Abre MySQL Workbench o la terminal de MySQL:

```sql
-- 1. Conectarse como root
mysql -u root -p
-- (Ingresa tu contraseña)

-- 2. Crear la base de datos
CREATE DATABASE reports_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Crear usuario para la aplicación
CREATE USER 'reports_user'@'localhost' IDENTIFIED BY 'TuPasswordSegura123!';

-- 4. Otorgar permisos
GRANT ALL PRIVILEGES ON reports_db.* TO 'reports_user'@'localhost';
FLUSH PRIVILEGES;

-- 5. Usar la base de datos
USE reports_db;

-- 6. Crear tablas de ejemplo
CREATE TABLE clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT,
  producto_id INT,
  cantidad INT NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  INDEX idx_fecha (fecha)
);

-- 7. Insertar datos de ejemplo
INSERT INTO clientes (nombre, email, telefono, ciudad) VALUES
('Juan Pérez', 'juan@email.com', '555-0001', 'CDMX'),
('María García', 'maria@email.com', '555-0002', 'Guadalajara'),
('Carlos López', 'carlos@email.com', '555-0003', 'Monterrey'),
('Ana Martínez', 'ana@email.com', '555-0004', 'Puebla'),
('Luis Rodríguez', 'luis@email.com', '555-0005', 'Querétaro');

INSERT INTO productos (nombre, precio, categoria, stock) VALUES
('Laptop Dell XPS 13', 25000.00, 'Computadoras', 15),
('iPhone 14 Pro', 28000.00, 'Smartphones', 30),
('Mouse Logitech MX', 1200.00, 'Accesorios', 50),
('Monitor LG 27"', 6500.00, 'Monitores', 20),
('Teclado Mecánico', 2500.00, 'Accesorios', 35);

INSERT INTO ventas (cliente_id, producto_id, cantidad, monto_total, fecha) VALUES
(1, 1, 1, 25000.00, '2024-10-01 10:30:00'),
(2, 2, 2, 56000.00, '2024-10-01 14:20:00'),
(3, 3, 3, 3600.00, '2024-10-02 09:15:00'),
(4, 4, 1, 6500.00, '2024-10-02 16:45:00'),
(5, 5, 2, 5000.00, '2024-10-03 11:00:00'),
(1, 3, 5, 6000.00, '2024-10-03 13:30:00'),
(2, 4, 1, 6500.00, '2024-10-04 10:15:00'),
(3, 1, 1, 25000.00, '2024-10-04 15:20:00');

-- 8. Verificar que todo se creó correctamente
SHOW TABLES;
SELECT * FROM ventas LIMIT 5;
```

### Paso 2.3: Anotar Credenciales

Guarda estos datos para usarlos después:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reports_db
DB_USER=reports_user
DB_PASS=TuPasswordSegura123!
```

---

## 3. Configuración de Gmail API

### Opción A: Usar App Password (MÁS SIMPLE) ⭐ RECOMENDADO

#### Paso 3A.1: Habilitar Verificación en 2 Pasos

1. Ve a https://myaccount.google.com/security
2. En "Acceso a Google", haz clic en "Verificación en dos pasos"
3. Sigue los pasos para habilitarlo (necesitarás tu teléfono)

#### Paso 3A.2: Generar Contraseña de Aplicación

1. Una vez habilitada la verificación en 2 pasos, ve a:
   https://myaccount.google.com/apppasswords
2. En "Nombre de la aplicación", escribe: `ReportGen`
3. Haz clic en "Generar"
4. **COPIA LA CONTRASEÑA DE 16 CARACTERES** (aparece como: xxxx xxxx xxxx xxxx)
5. Guarda esta información:

```
GMAIL_EMAIL=tu-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  (sin espacios: xxxxxxxxxxxxxxxx)
```

### Opción B: OAuth2 (Más complejo pero más seguro)

#### Paso 3B.1: Crear Proyecto en Google Cloud

1. Ve a: https://console.cloud.google.com/
2. Haz clic en "Seleccionar proyecto" → "Nuevo proyecto"
3. Nombre: `ReportGen`
4. Haz clic en "Crear"

#### Paso 3B.2: Habilitar Gmail API

1. En el menú, ve a "APIs y servicios" → "Biblioteca"
2. Busca "Gmail API"
3. Haz clic en "Habilitar"

#### Paso 3B.3: Crear Credenciales OAuth2

1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "ID de cliente de OAuth"
3. Si te pide configurar pantalla de consentimiento:
   - Tipo: Externo
   - Nombre de la aplicación: `ReportGen`
   - Email de asistencia: tu email
   - Ámbitos: Agregar `../auth/gmail.send`
   - Guardar
4. Tipo de aplicación: "Aplicación web"
5. Nombre: `ReportGen Client`
6. URIs de redirección autorizados: `http://localhost:3000/oauth2callback`
7. Haz clic en "Crear"
8. **COPIA Y GUARDA:**
   - Client ID
   - Client Secret

#### Paso 3B.4: Obtener Refresh Token

Ejecuta este script Node.js una sola vez:

```javascript
// auth-gmail.js
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'TU_CLIENT_ID_AQUI';
const CLIENT_SECRET = 'TU_CLIENT_SECRET_AQUI';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Autoriza esta app visitando esta URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Ingresa el código de la URL de retorno: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error al obtener token:', err);
    console.log('Tu Refresh Token es:', token.refresh_token);
  });
});
```

Ejecutar:
```powershell
npm install googleapis
node auth-gmail.js
# Sigue las instrucciones
```

Guarda:
```
GMAIL_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=tu-client-secret
GMAIL_REFRESH_TOKEN=tu-refresh-token
```

---

## 4. Configuración del Backend

### Paso 4.1: Navegar al Directorio

```powershell
cd c:\Users\gguerrem\Downloads\BridgeX\agent-reportes
```

### Paso 4.2: Instalar Dependencias

```powershell
npm install
```

### Paso 4.3: Crear Archivo .env

Crea un archivo `.env` en `agent-reportes/`:

**Si usaste App Password (Opción A):**

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reports_db
DB_USER=reports_user
DB_PASS=TuPasswordSegura123!
DB_SSL=false
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=30000

# Gmail con App Password
GMAIL_EMAIL=tu-email@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx

# Server
PORT=3000
HOST=localhost
ENABLE_CRON=false
CRON_SCHEDULE=0 9 * * *

# Reports
DEFAULT_RECIPIENTS=tu-email@gmail.com
DEFAULT_REPORT_TYPE=ventas_diarias
```

**Si usaste OAuth2 (Opción B):**

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reports_db
DB_USER=reports_user
DB_PASS=TuPasswordSegura123!
DB_SSL=false
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=30000

# Gmail OAuth2
GMAIL_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=tu-client-secret
GMAIL_REFRESH_TOKEN=tu-refresh-token
GMAIL_REDIRECT_URI=http://localhost:3000/oauth2callback
GMAIL_EMAIL=tu-email@gmail.com

# Server
PORT=3000
HOST=localhost
ENABLE_CRON=false
CRON_SCHEDULE=0 9 * * *

# Reports
DEFAULT_RECIPIENTS=tu-email@gmail.com
DEFAULT_REPORT_TYPE=ventas_diarias
```

### Paso 4.4: Compilar y Ejecutar Backend

```powershell
# Compilar TypeScript
npm run build

# Ejecutar en modo desarrollo
npm run dev

# O en modo producción
npm start
```

### Paso 4.5: Verificar que Funciona

En otra terminal:

```powershell
curl http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-02T...",
  "version": "1.0.0"
}
```

---

## 5. Configuración del Frontend

### Paso 5.1: Navegar al Directorio

```powershell
cd c:\Users\gguerrem\Downloads\BridgeX\reportgen-frontend
```

### Paso 5.2: Instalar Dependencias

```powershell
npm install
```

### Paso 5.3: Verificar Archivo .env.local

El archivo `.env.local` ya debería existir con:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ReportGen
```

Si no existe, créalo.

### Paso 5.4: Ejecutar Frontend

```powershell
npm run dev
```

El frontend estará en: `http://localhost:3001`

---

## 6. Verificación y Pruebas

### Test 1: Verificar Dashboard

1. Abre http://localhost:3001
2. Deberías ver:
   - ✅ Dashboard con métricas
   - ✅ Estado de conexión MySQL (verde)
   - ✅ Estado de conexión Gmail (verde)
   - ✅ Tabla de reportes recientes

### Test 2: Generar Reporte de Prueba

1. Haz clic en "New Report"
2. Configuración:
   - Query: "Q4 Financial Performance Summary"
   - Date Range: "Last 7 Days"
   - Recipients: tu-email@gmail.com
   - Report Type: PDF
   - ✅ Include charts
   - ✅ Attach CSV
3. Haz clic en "Generate & Send"
4. Espera a que se complete el proceso
5. **VERIFICA TU EMAIL** - deberías recibir el reporte

### Test 3: Ver Settings

1. Ve a Settings
2. Verifica que las conexiones estén en verde
3. Prueba "Test Connection" para MySQL

---

## 7. Solución de Problemas

### ❌ Backend no inicia - Error de MySQL

**Error:** `Error: connect ECONNREFUSED`

**Solución:**
```powershell
# Verificar que MySQL esté corriendo
Get-Service -Name MySQL*

# Si no está corriendo:
Start-Service -Name MySQL80  # o el nombre de tu servicio

# Verificar conexión manual:
mysql -u reports_user -p -h localhost reports_db
```

### ❌ Backend no inicia - Error de Gmail

**Error:** `Error: Invalid credentials`

**Solución:**
1. Verifica que copiaste correctamente la App Password (sin espacios)
2. Verifica que la verificación en 2 pasos esté habilitada
3. Si usas OAuth2, regenera el refresh token

### ❌ Frontend muestra conexiones en rojo

**Causa:** El backend no está corriendo o está en puerto diferente

**Solución:**
```powershell
# Verificar backend:
curl http://localhost:3000/health

# Si no responde, reinicia el backend:
cd agent-reportes
npm run dev
```

### ❌ Email no se envía

**Verificar:**
1. El backend está corriendo
2. Las credenciales de Gmail son correctas
3. El email de destino es válido
4. Revisa los logs del backend en la terminal

### ❌ Datos no aparecen en reportes

**Causa:** La base de datos está vacía

**Solución:**
Ejecuta de nuevo los INSERT de datos de ejemplo (Paso 2.2)

---

## ✅ Checklist Final

Antes de reportar un problema, verifica:

- [ ] MySQL está corriendo y las credenciales son correctas
- [ ] La base de datos `reports_db` existe con datos
- [ ] Gmail está configurado (App Password o OAuth2)
- [ ] El backend está corriendo en `http://localhost:3000`
- [ ] El frontend está corriendo en `http://localhost:3001`
- [ ] Puedes acceder a `http://localhost:3000/health` y obtienes respuesta
- [ ] Las conexiones en Settings aparecen en verde
- [ ] Has probado generar un reporte de prueba

---

## 📝 Resumen de Credenciales Necesarias

Al final, necesitarás haber configurado:

### Backend (.env)
```
✅ DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
✅ GMAIL_EMAIL, GMAIL_APP_PASSWORD (o GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN)
✅ PORT=3000
```

### Frontend (.env.local)
```
✅ NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu sistema ReportGen debería estar funcionando completamente.

Para comenzar a usar:
1. Abre http://localhost:3001
2. Haz clic en "New Report"
3. Configura y genera tu primer reporte
4. Revisa tu email

**¿Preguntas?** Revisa la sección de Solución de Problemas o los README de cada proyecto.
