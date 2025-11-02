# 📚 ÍNDICE DE DOCUMENTACIÓN - BridgeX

## 🎯 ¿POR DÓNDE EMPEZAR?

### 📌 **SI QUIERES INICIAR YA**
👉 Lee: **`LISTO-PARA-USAR.md`** (5 minutos)

Solo necesitas:
1. Editar una línea en `.env`
2. Ejecutar `.\start-reportgen.ps1`
3. ¡Listo!

---

### 📖 **DOCUMENTACIÓN POR TEMA**

#### 🚀 **Inicio Rápido**
| Documento | Propósito | Tiempo |
|-----------|----------|--------|
| `LISTO-PARA-USAR.md` | Estado actual y próximos pasos | 5 min |
| `CHECKLIST-RAPIDO.md` | Checklist de configuración | 5 min |
| `INICIO-RAPIDO.md` | Guía rápida de inicio | 10 min |

#### 🔐 **Configuración de Credenciales**
| Documento | Propósito | Tiempo |
|-----------|----------|--------|
| `CONFIGURACION-SERVICE-ACCOUNT.md` | **ESTA VERSIÓN**: OAuth2 + Service Account | 15 min |
| `CONFIGURACION-CREDENCIALES.md` | Configuración general (alternativo) | 15 min |
| `CONFIGURACION-PASO-A-PASO.md` | Setup detallado paso a paso | 20 min |

#### 📊 **Arquitectura Técnica**
| Documento | Propósito | Tiempo |
|-----------|----------|--------|
| `DOCUMENTACION-MCPs.md` | Especificación técnica de MCPs | 30 min |
| `RESUMEN-SERVICE-ACCOUNT.md` | Cambios realizados | 10 min |
| `RESUMEN-FINAL.md` | Resumen general del proyecto | 10 min |
| `ESTADO-PROYECTO.md` | Estado actual completo | 15 min |

#### 📁 **Archivos del Proyecto**
- `agent-reportes/` - Backend con MCPs
  - `.env` - Credenciales (EDITAR)
  - `.env.example` - Plantilla de variables
  - `package.json` - Dependencias
  - `src/mcp/gmail-server.ts` - Gmail MCP con OAuth2
  - `src/mcp/mysql-server.ts` - MySQL MCP
  - `README.md` - Documentación del backend

- `reportgen-frontend/` - Frontend con Next.js
  - `.env.local` - URL del backend
  - `package.json` - Dependencias
  - `src/` - Código fuente
  - `README.md` - Documentación del frontend

- `start-reportgen.ps1` - Script para iniciar ambos servidores

---

## 🎯 **FLUJOS TÍPICOS**

### Flujo 1: Quiero empezar YA
```
LISTO-PARA-USAR.md
  ↓ (edita una línea)
  ↓
./start-reportgen.ps1
  ↓
¡Funciona!
```

### Flujo 2: Quiero entender la arquitectura
```
RESUMEN-FINAL.md (visión general)
  ↓
DOCUMENTACION-MCPs.md (detalles técnicos)
  ↓
CONFIGURACION-SERVICE-ACCOUNT.md (cómo OAuth2)
  ↓
Código fuente
```

### Flujo 3: Tengo problemas
```
LISTO-PARA-USAR.md (problemas comunes)
  ↓
CONFIGURACION-SERVICE-ACCOUNT.md (troubleshooting)
  ↓
Logs en: agent-reportes/logs/
```

### Flujo 4: Quiero configuración detallada
```
CHECKLIST-RAPIDO.md (overview)
  ↓
CONFIGURACION-PASO-A-PASO.md (paso a paso)
  ↓
Verificar con: CONFIGURACION-SERVICE-ACCOUNT.md
```

---

## 🔍 **BUSCAR POR CONCEPTO**

### ¿Cómo configuro...?

- **...MySQL?**
  → `CONFIGURACION-CREDENCIALES.md` (Paso 1)

- **...Gmail con Service Account?**
  → `CONFIGURACION-SERVICE-ACCOUNT.md` (Paso 1-2)

- **...el email para impersonar?**
  → `LISTO-PARA-USAR.md` (Paso 1)

- **...el frontend?**
  → `reportgen-frontend/README.md`

- **...el backend?**
  → `agent-reportes/README.md`

### ¿Cómo funciona...?

- **...el Gmail MCP?**
  → `DOCUMENTACION-MCPs.md` (Gmail MCP Server)

- **...el MySQL MCP?**
  → `DOCUMENTACION-MCPs.md` (MySQL MCP Server)

- **...OAuth2 con Service Account?**
  → `CONFIGURACION-SERVICE-ACCOUNT.md` (Sección "Flujo Completo")

- **...el Agent?**
  → `DOCUMENTACION-MCPs.md` (Sección "Agent")

### ¿Dónde está...?

- **...las credenciales?**
  → `agent-reportes/.env`

- **...el backend?**
  → `agent-reportes/src/`

- **...el frontend?**
  → `reportgen-frontend/src/`

- **...los logs?**
  → `agent-reportes/logs/`

---

## 📊 **MATRIZ DE DOCUMENTOS**

| Documento | Principiante | Intermedio | Avanzado | Producción |
|-----------|:---:|:---:|:---:|:---:|
| LISTO-PARA-USAR | ✅ | ✅ | ✅ | ✅ |
| CHECKLIST-RAPIDO | ✅ | ✅ | ✅ | - |
| INICIO-RAPIDO | ✅ | ✅ | - | - |
| CONFIGURACION-SERVICIO-ACCOUNT | ⏳ | ✅ | ✅ | ✅ |
| CONFIGURACION-PASO-A-PASO | - | ✅ | ✅ | ✅ |
| DOCUMENTACION-MCPs | - | ⏳ | ✅ | ✅ |
| RESUMEN-SERVICE-ACCOUNT | ⏳ | ✅ | ✅ | - |
| RESUMEN-FINAL | ⏳ | ✅ | ✅ | - |
| ESTADO-PROYECTO | - | ⏳ | ✅ | - |

**Leyenda:** ✅ Recomendado | ⏳ Útil | - No necesario

---

## 🎯 **CHECKLIST FINAL**

Antes de iniciar:
- [ ] He leído `LISTO-PARA-USAR.md`
- [ ] He editado `GMAIL_IMPERSONATE_EMAIL` en `.env`
- [ ] He verificado que MySQL está corriendo
- [ ] He verificado que tienes los 2 puertos libres (3000, 3001)
- [ ] He revisado las credenciales de Service Account

Después de iniciar:
- [ ] Frontend abre en http://localhost:3001
- [ ] Backend responde en http://localhost:3000/health
- [ ] Conexión a MySQL verifica correctamente
- [ ] Conexión a Gmail verifica correctamente
- [ ] Puedo generar un reporte de prueba

---

## 🚀 **COMANDOS ÚTILES**

```powershell
# Iniciar todo automáticamente
.\start-reportgen.ps1

# Iniciar backend
cd agent-reportes && npm start

# Iniciar frontend
cd reportgen-frontend && npm run dev

# Ver logs del backend
Get-Content agent-reportes/logs/*.log -Tail 50

# Compilar backend
cd agent-reportes && npm run build

# Ver estado de npm packages
npm list

# Ver puertos en uso
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

---

## 📞 **SOPORTE RÁPIDO**

### Error: Puerto 3000/3001 ya en uso
→ Cambiar puertos en `.env` y `.env.local`

### Error: "Cannot authenticate with Gmail"
→ Ver `CONFIGURACION-SERVICE-ACCOUNT.md` (Sección Troubleshooting)

### Error: "Connection refused" en MySQL
→ Verificar que MySQL está corriendo y credenciales son correctas

### Error: Compilación con TypeScript
→ No importa para `npm start`, solo afecta a `npm run build`

### ¿Dónde están los logs?
→ `agent-reportes/logs/`

### ¿Cómo reinicio todo?
→ Cierra ambas terminales y ejecuta nuevamente `.\start-reportgen.ps1`

---

## ✨ **SIGUIENTES PASOS**

1. **Hoy**: Configura y prueba el sistema
2. **Mañana**: Ajusta queries y destinatarios
3. **Esta semana**: Configura programación (cron)
4. **Próxima semana**: Deploy a producción

---

**¡Tu sistema está listo! Empieza por: `LISTO-PARA-USAR.md`**
