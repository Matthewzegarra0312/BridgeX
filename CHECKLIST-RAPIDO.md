# ✅ CHECKLIST RÁPIDO - 5 MINUTOS

## 📝 Antes de Empezar

### Prerrequisitos
- [ ] Node.js instalado (v18+)
- [ ] MySQL instalado y corriendo
- [ ] Cuenta de Gmail con verificación en 2 pasos

---

## 🔧 Configuración (5 pasos)

### ✅ Paso 1: Configurar MySQL (2 min)
1. Abre `agent-reportes/.env`
2. Edita estas líneas:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASS=tu_contraseña
   DB_NAME=reportes_db
   ```
3. Guarda el archivo

### ✅ Paso 2: Crear Base de Datos (1 min)
Ejecuta en MySQL:
```sql
CREATE DATABASE reportes_db CHARACTER SET utf8mb4;
```

### ✅ Paso 3: Configurar Gmail (2 min)
1. Ve a: https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una para "Correo"
5. Copia los 16 caracteres
6. Abre `agent-reportes/.env`
7. Edita:
   ```
   GMAIL_EMAIL=tucorreo@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
8. Guarda el archivo

### ✅ Paso 4: Iniciar Sistema (30 seg)
Ejecuta:
```powershell
.\start-reportgen.ps1
```

O manualmente (2 terminales):
```powershell
# Terminal 1
cd agent-reportes
npm start

# Terminal 2
cd reportgen-frontend
npm run dev
```

### ✅ Paso 5: Verificar (1 min)
1. Backend: http://localhost:3000/health
   - ✅ Debe mostrar: `{"status":"healthy",...}`

2. Frontend: http://localhost:3001
   - ✅ Debe mostrar el Dashboard

3. Probar conexiones:
   - Ve a Configuración → Tab "Conexiones"
   - Completa datos MySQL y Gmail
   - Haz clic en "Probar Conexión"
   - ✅ Ambas deben mostrar "Conexión exitosa"

---

## 🎉 ¡Listo!

Si todos los pasos tienen ✅, tu sistema está funcionando.

### Ahora puedes:
- 📊 Ver el Dashboard
- 📝 Generar reportes
- 📅 Programar reportes automáticos
- ⚙️ Configurar queries y destinatarios

---

## ❌ Si algo falla

| Problema | Solución |
|----------|----------|
| MySQL no conecta | Verifica que MySQL esté corriendo |
| Gmail falla | Genera un nuevo App Password |
| Puerto ocupado | Cambia PORT en `.env` |
| Error 404 | Verifica que backend esté corriendo |

**Ver más detalles en**: `CONFIGURACION-CREDENCIALES.md`
