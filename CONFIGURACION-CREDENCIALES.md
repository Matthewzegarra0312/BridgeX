# 🎯 CONFIGURACIÓN FINAL - SOLO CREDENCIALES

## ✅ Sistema Completamente Preparado

Todo el código está funcionando y listo. **Solo necesitas agregar tus credenciales.**

---

## 📝 PASO 1: Configurar MySQL Local

### Edita: `agent-reportes/.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=reportes_db
DB_USER=tu_usuario_mysql
DB_PASS=tu_contraseña_mysql
```

### ¿No tienes MySQL instalado?

**Opción A: XAMPP (Recomendado para Windows)**
1. Descarga XAMPP: https://www.apachefriends.org/
2. Instala y arranca Apache + MySQL
3. Abre phpMyAdmin: http://localhost/phpmyadmin
4. Crea la base de datos:
   ```sql
   CREATE DATABASE reportes_db CHARACTER SET utf8mb4;
   ```

**Opción B: MySQL Installer**
1. Descarga: https://dev.mysql.com/downloads/installer/
2. Instala MySQL Server
3. Anota usuario (root) y contraseña
4. Crea la base de datos con MySQL Workbench

---

## 📧 PASO 2: Configurar Gmail con App Password

### Edita: `agent-reportes/.env`

```env
GMAIL_EMAIL=tucorreo@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### ¿Cómo obtener el App Password?

1. **Ve a tu cuenta de Google**: https://myaccount.google.com/security

2. **Activa la verificación en 2 pasos**:
   - Busca "Verificación en 2 pasos"
   - Sigue los pasos para activarla

3. **Genera App Password**:
   - Busca "Contraseñas de aplicaciones"
   - Selecciona "Correo" o "Otra (nombre personalizado)"
   - Escribe "Sistema de Reportes"
   - Copia los **16 caracteres** (sin espacios)

4. **Pega en `.env`**:
   ```env
   GMAIL_EMAIL=tucorreo@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

---

## 🚀 PASO 3: Iniciar el Sistema

### Opción A: Script Automático (Recomendado)

```powershell
.\start-reportgen.ps1
```

### Opción B: Manual (2 Terminales)

**Terminal 1 - Backend:**
```powershell
cd agent-reportes
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd reportgen-frontend
npm run dev
```

---

## ✅ PASO 4: Verificar que Funciona

### 1. Backend Health Check
Abre en tu navegador: http://localhost:3000/health

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "version": "1.0.0"
}
```

### 2. Frontend
Abre: http://localhost:3001

Deberías ver el Dashboard con:
- 4 tarjetas KPI
- Conexión MySQL
- Conexión Gmail
- Tabla de reportes recientes

### 3. Test de Conexiones
1. Ve a **Configuración** (Settings)
2. Tab "Conexiones"
3. Completa los datos de MySQL y Gmail
4. Haz clic en "Probar Conexión" en cada uno
5. Deberías ver ✅ "Conexión exitosa"

---

## 🔧 CONFIGURACIÓN AVANZADA (Opcional)

### Destinatarios por Defecto

Edita `agent-reportes/.env`:
```env
DEFAULT_RECIPIENTS=finanzas@empresa.com,gerencia@empresa.com
```

### Reportes Automáticos (Cron)

```env
ENABLE_CRON=true
CRON_SCHEDULE=0 9 * * *
```

Formatos de horario:
- `0 9 * * *` → Todos los días a las 9:00 AM
- `0 9 * * 1-5` → Lunes a viernes a las 9:00 AM
- `0 */6 * * *` → Cada 6 horas
- `0 0 * * 0` → Todos los domingos a medianoche

---

## 📂 Archivos de Configuración

### Backend
- **Archivo**: `agent-reportes/.env`
- **Contiene**: Credenciales de MySQL y Gmail

### Frontend
- **Archivo**: `reportgen-frontend/.env.local`
- **Contiene**: URL del backend (ya configurado)

---

## ❓ Problemas Comunes

### ❌ Error: "ECONNREFUSED" al conectar a MySQL
**Solución**: MySQL no está corriendo
```powershell
# Verifica el servicio
Get-Service -Name MySQL* | Format-Table -AutoSize

# Inicia MySQL (si está detenido)
# - En XAMPP: Abre XAMPP Control Panel y arranca MySQL
# - En Windows Service: net start MySQL80
```

### ❌ Error: "Invalid credentials" en Gmail
**Solución**: App Password incorrecto
- Verifica que copiaste los 16 caracteres sin espacios
- Genera un nuevo App Password si es necesario

### ❌ Frontend muestra "Failed to fetch"
**Solución**: Backend no está corriendo
- Verifica que `http://localhost:3000/health` responde
- Reinicia el backend: `cd agent-reportes && npm start`

### ❌ Puerto 3000 o 3001 ya en uso
**Solución**: Cambia el puerto
```env
# En agent-reportes/.env
PORT=3001

# En reportgen-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📊 Estructura de Base de Datos de Ejemplo

Si necesitas datos de prueba, ejecuta en MySQL:

```sql
CREATE DATABASE reportes_db CHARACTER SET utf8mb4;
USE reportes_db;

CREATE TABLE clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT,
  producto_id INT,
  monto DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insertar datos de prueba
INSERT INTO clientes (nombre, email, telefono) VALUES
  ('Juan Pérez', 'juan@example.com', '555-0101'),
  ('María García', 'maria@example.com', '555-0102'),
  ('Carlos López', 'carlos@example.com', '555-0103');

INSERT INTO productos (nombre, precio, categoria) VALUES
  ('Laptop Dell XPS', 1299.99, 'Electrónica'),
  ('iPhone 15 Pro', 999.99, 'Electrónica'),
  ('Escritorio Ergonómico', 349.99, 'Muebles');

INSERT INTO ventas (cliente_id, producto_id, monto) VALUES
  (1, 1, 1299.99),
  (2, 2, 999.99),
  (3, 3, 349.99);
```

---

## 🎉 ¡Listo!

Una vez configuradas las credenciales, el sistema estará **100% funcional**.

### URLs del Sistema
- 🔵 Frontend: http://localhost:3001
- 🟢 Backend: http://localhost:3000
- 💚 Health: http://localhost:3000/health

### Funcionalidades Disponibles
✅ Dashboard con KPIs en tiempo real
✅ Generar reportes personalizados
✅ Ver resultados con gráficos interactivos
✅ Programar reportes automáticos
✅ Gestionar conexiones y configuración
✅ Exportar datos a CSV
✅ Envío automático por email

---

**¿Necesitas ayuda?** Revisa la sección "Problemas Comunes" arriba.
