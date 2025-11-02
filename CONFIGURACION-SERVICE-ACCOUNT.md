# 🔐 CONFIGURACIÓN CON SERVICE ACCOUNT DE GOOGLE CLOUD

## ✅ Estado Actual

Tu sistema está configurado para usar **OAuth2 con Service Account**, que es lo especificado en el prompt original.

**Ya completado:**
- ✅ Service Account Email: `sundai-latam@sundai-latam.iam.gserviceaccount.com`
- ✅ Private Key: Configurada en `.env`
- ⏳ Email para impersonar: **REQUIERE CONFIGURACIÓN**

---

## 📝 PASO 1: Edita `agent-reportes/.env`

Cambia esta línea:
```env
GMAIL_IMPERSONATE_EMAIL=tu_email_corporativo@empresa.com
```

Por el email del usuario de Google Workspace a través del cual enviarás los reportes:
```env
GMAIL_IMPERSONATE_EMAIL=gerencia@tuempresa.com
```

---

## ✅ PASO 2: Verificar Configuración en Google Cloud

### Opción A: Si tienes acceso a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Selecciona el proyecto: `sundai-latam`
3. Ve a: **APIs y servicios** → **Biblioteca**
4. Busca: **Gmail API**
5. Haz clic en "HABILITAR"

### Opción B: Verificar delegación de dominio (si usas Google Workspace)

Si tu organizaci ón usa Google Workspace, necesitas permitir que el service account impersone usuarios:

1. Ve a: Google Cloud Console → Service Accounts
2. Selecciona: `sundai-latam@sundai-latam.iam.gserviceaccount.com`
3. Copia el **Client ID** (number format, ej: 114967740305806547274)
4. En Google Workspace Admin:
   - Ve a: **Controles de aplicaciones** → **Configuración SMTP/Gmail**
   - O: **Seguridad** → **Configuración de autenticación**
   - Agrega el Client ID del service account con permisos para:
     - Enviar correos
     - Acceder a Gmail

---

## 📊 Verificación de Dependencias

El sistema ya tiene instalado:
- ✅ `googleapis@^144.0.0` - Gmail API
- ✅ Todas las demás dependencias

---

## 🚀 PASO 3: Iniciar el Sistema

### Opción A: Script automático
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

### 1. Health Check
```
http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T...",
  "version": "1.0.0"
}
```

### 2. Verificar Autenticación de Gmail
En el frontend:
1. Ve a **Configuración** (Settings)
2. Tab "Conexiones"
3. En la sección Gmail, haz clic en "Probar Conexión"
4. Deberías ver: ✅ "Conexión exitosa"

Si falla:
- Verifica que `GMAIL_IMPERSONATE_EMAIL` es correcto
- Verifica que tienes permisos en Google Workspace

### 3. Generar tu primer reporte
1. Ve a **Generar Reporte**
2. Selecciona una query
3. Elige el rango de fechas
4. Agrega destinatarios
5. Haz clic en "Generar y Enviar"

---

## 🔧 Flujo Completo de OAuth2

```
┌─────────────────────────────────────────────────────────────┐
│                      Tu Aplicación                          │
│                  (Backend Agent)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Usa Service Account
                       │ (serviceAccountEmail + privateKey)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Google OAuth2 Token Endpoint                   │
│         (https://oauth2.googleapis.com/token)              │
│                                                             │
│  Intercambia credenciales por TOKEN de acceso              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Token de acceso
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Gmail API                                │
│           (https://gmail.googleapis.com/gmail/v1)          │
│                                                             │
│  Impersona: GMAIL_IMPERSONATE_EMAIL                        │
│  Envía emails como: gerencia@tuempresa.com                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🆘 Problemas Comunes

### ❌ Error: "Cannot authenticate with Gmail API"

**Causa**: Gmail API no habilitada o credenciales incorrectas

**Solución**:
1. Ve a Google Cloud Console
2. Habilita Gmail API en el proyecto
3. Verifica que la Private Key está correcta en `.env`

### ❌ Error: "Permission denied"

**Causa**: El service account no tiene permiso para impersonar el usuario

**Solución**:
1. En Google Workspace Admin:
   - Ve a **Controles de aplicaciones**
   - Agrega el Client ID del service account
   - Dale permisos para enviar emails
2. O configura Domain-wide Delegation en Google Cloud

### ❌ Error: "Invalid user"

**Causa**: `GMAIL_IMPERSONATE_EMAIL` no existe o es incorrecto

**Solución**:
1. Verifica que el email existe en tu dominio de Google Workspace
2. Verifica la ortografía exacta
3. El email debe ser un usuario del dominio

### ❌ Gmail API no responde

**Causa**: Problema de conectividad o timeout

**Solución**:
1. Verifica conexión a internet
2. Reinicia el backend: `npm start`
3. Verifica logs en `logs/` directorio

---

## 📚 Documentación Técnica de MCP Gmail

El Gmail MCP implementa:

### Herramientas:
- `gmail_send` - Envía email individual
- `gmail_send_report` - Envía reporte con plantilla
- `gmail_auth_status` - Verifica autenticación

### Características:
- ✅ Autenticación OAuth2 con Service Account
- ✅ Impersonación de usuarios (domain-wide delegation)
- ✅ Múltiples destinatarios (To, Cc, Bcc)
- ✅ Adjuntos en base64
- ✅ Soporte para HTML y texto plano
- ✅ Reintentos automáticos
- ✅ Logging completo

---

## 🔐 Seguridad

### ✅ Buenas Prácticas Implementadas:
- Private Key almacenada en `.env` (no en código)
- Validación de emails con Zod
- Reintentos exponenciales para fallos de red
- Logging sin datos sensibles (PII)
- TLS automático con Gmail API

### ⚠️ Recomendaciones Adicionales:
- Usa variables de entorno seguros en producción
- Rota regularmente las claves del service account
- Monitora los logs de acceso a Gmail
- Restringe permisos del service account al mínimo necesario

---

## 📞 Soporte

Para más información:
- Google Cloud Documentation: https://cloud.google.com/docs
- Gmail API Docs: https://developers.google.com/gmail/api
- Service Account Setup: https://cloud.google.com/iam/docs/service-accounts

---

## ✅ Checklist Final

- [ ] `GMAIL_IMPERSONATE_EMAIL` configurado en `.env`
- [ ] Gmail API habilitada en Google Cloud Console
- [ ] Service account con permisos en Google Workspace
- [ ] Backend iniciado correctamente
- [ ] Health check responde ✅
- [ ] Conexión a Gmail verifica exitosamente ✅
- [ ] Primer reporte enviado correctamente ✅
