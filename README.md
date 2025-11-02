# BridgeX - Sistema de Reportes Automatizados

Sistema completo de generación y distribución de reportes automatizados que integra MySQL y Gmail mediante Model Context Protocol (MCP).

## 📁 Estructura del Proyecto

```
BridgeX/
├── agent-reportes/          # Backend MCP (Node.js + TypeScript)
│   ├── src/
│   │   ├── mcp/
│   │   │   ├── mysql-server.ts     # MCP Server para MySQL
│   │   │   ├── gmail-server.ts     # MCP Server para Gmail
│   │   │   └── ...
│   │   ├── agent.ts                # Agente principal
│   │   └── utils/                  # Utilidades (logger, retry, etc.)
│   └── package.json
│
└── reportes-frontend/       # Frontend React
    ├── src/
    │   ├── components/             # Componentes React
    │   ├── pages/                  # Páginas de la aplicación
    │   ├── hooks/                  # Custom hooks
    │   ├── services/               # API y clientes
    │   └── types/                  # Tipos TypeScript
    └── package.json
```

## 🚀 Inicio Rápido

### Backend (Agent MCP)

```bash
cd agent-reportes
npm install
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend

```bash
cd reportes-frontend
npm install
cp .env.example .env.local  # Configurar variables de entorno
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🌟 Características

### Backend
- **MCP MySQL**: Conexión a base de datos y ejecución de consultas
- **MCP Gmail**: Envío de emails con reportes HTML y adjuntos
- **Sistema de Reportes**: Generación automática de reportes con datos en tiempo real
- **WebSocket**: Comunicación en tiempo real para progreso de reportes
- **Reintentos automáticos**: Sistema robusto con manejo de errores
- **Logging completo**: Registro detallado de todas las operaciones

### Frontend
- **Dashboard Interactivo**: Métricas y estado de conexiones
- **Generación de Reportes**: Interfaz intuitiva para crear reportes personalizados
- **Reportes Programados**: Gestión de tareas automáticas con cron
- **Configuración**: Administración de conexiones MySQL y Gmail
- **Tiempo Real**: Seguimiento del progreso de generación vía WebSocket
- **Responsive Design**: Adaptable a dispositivos móviles y desktop

## 📝 Configuración

### Variables de Entorno - Backend

Crear archivo `.env` en `agent-reportes/`:

```env
# MySQL Connection
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=reports_db

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Variables de Entorno - Frontend

Crear archivo `.env.local` en `reportes-frontend/`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Sistema de Reportes
```

## 🔧 Tecnologías

### Backend
- Node.js + TypeScript
- Model Context Protocol (MCP)
- MySQL2
- Nodemailer
- Express (para API REST)
- Socket.io (para WebSocket)
- Winston (logging)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router
- Socket.io-client
- Recharts
- Axios

## 📖 Documentación

- [Documentación Backend](./agent-reportes/README.md)
- [Documentación Frontend](./reportes-frontend/README.md)
- [Prompt Backend MCP](./prompt%20mcp.md)
- [Prompt Frontend](./prompt-frontend-reportes.md)

## 🔐 Seguridad

- Autenticación OAuth2 para Gmail
- Variables de entorno para credenciales sensibles
- Validación de datos en frontend y backend
- Sanitización de queries SQL
- Rate limiting en API

## 🧪 Testing

### Backend
```bash
cd agent-reportes
npm test
```

### Frontend
```bash
cd reportes-frontend
npm test
```

## 📦 Build para Producción

### Backend
```bash
cd agent-reportes
npm run build
npm start
```

### Frontend
```bash
cd reportes-frontend
npm run build
npm run preview
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Equipo

Proyecto desarrollado como parte del sistema BridgeX.

## 📧 Contacto

Para más información, contacta al equipo de desarrollo.
