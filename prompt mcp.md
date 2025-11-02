"# Reto 1 — Agente de Reportes (MCP ↔ MySQL ↔ Gmail)

**Objetivo:**
Desarrollar un agente que ejecute consultas en MySQL mediante un MCP, genere un reporte (tabla y métricas) y lo envíe por correo usando un MCP de Gmail.

## Alcance y entregables

1. **Configuración inicial:**
   * Un archivo `package.json` con dependencias mínimas para TypeScript, Node.js, MySQL y la API de Gmail.
   * Configuración `tsconfig.json` estándar para un proyecto Node.js.
   * Un archivo `.env` para gestionar credenciales y variables de entorno de forma segura:
     * `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
     * `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` o `GMAIL_APP_PASSWORD`

2. **Implementación del MCP de base de datos (mcp.mysql):**
   * Interface: `mcp.mysql.query`
     * Request: `{"sql": "SELECT ...", "params": {"desde": "2025-10-01", "hasta": "2025-10-31"}}`
     * Response: `{"columns": ["fecha", "importe"], "rows": [["2025-10-01", 100.5], ...]}`
   * Conexión segura con TLS si está disponible
   * Manejo de parámetros SQL para prevenir inyección

3. **Implementación del MCP de correo (mcp.gmail):**
   * Interface: `mcp.gmail.send`
     * Request: `{"to": ["analitica@empresa.com"], "subject": "Reporte Semanal", "body_html": "<p>Adjunto...</p>", "attachments": [{"filename": "reporte.csv", "content_base64": "..."}]}`
     * Response: `{"status": "sent", "message_id": "..."}`
   * Autenticación OAuth2 de Google para Gmail
   * Soporte para múltiples destinatarios y adjuntos

4. **Agente de orquestación:**
   * Código del agente con prompts en español
   * Flujo automatizado:
     1. Recibir prompt o disparo programado
     2. Ejecutar 1-2 consultas SQL parametrizadas por rango de fechas
     3. Transformar resultados: totales, promedio, top 5, variación % vs. periodo anterior
     4. Generar reporte en HTML (tabla + KPIs) y CSV adjunto
     5. Enviar correo con `mcp.gmail.send` a lista de destinatarios

5. **Plantilla del correo:**
   * Asunto configurable
   * Cuerpo HTML con al menos 3 KPIs y tabla con columnas alineadas
   * Adjunto CSV con datos del reporte
   * Caso especial para "sin resultados"

6. **Estructura del código:**
   * Separación lógica en módulos (ej. `mysql.ts`, `gmail.ts`, `agent.ts`, `report.ts`, `index.ts`)
   * Uso de `async/await` para operaciones asíncronas
   * Manejo robusto de errores: timeout DB, credenciales inválidas, consulta vacía
   * Reintento exponencial para errores de conexión

7. **Testing y documentación:**
   * Script de pruebas automatizadas con casos:
     * Rango con datos → KPIs > 0, top 5 presente
     * Rango sin datos → KPIs = 0, texto explicativo, sin fallo
     * Error de conexión → reintento exponencial y log legible
   * README.md con instrucciones completas de configuración y uso
   * Tabla(s) de ejemplo para consultas (ventas, usuarios, transacciones)

## Arquitectura sugerida

```text
[Usuario/CRON] -> [Agente LLM] -> [MCP mcp.mysql.query] -> [Transformación/Reporte] -> [MCP mcp.gmail.send]
```

## Ejemplo de prompt

"Genera el reporte semanal de ventas del 01 al 07 de octubre de 2025. Incluye KPIs y envíalo a `finanzas@empresa.com` y `gerencia@empresa.com`."

## Seguridad y cumplimiento

* No registrar datos sensibles (PII, contraseñas)
* Usar conexiones TLS a la base de datos si está disponible
* Almacenar secretos en variables de entorno, no en código
* Validación de entrada para prevenir inyección SQL

## Extensiones opcionales

* Programar ejecución (cron) y rotación de logs
* Generar gráfico embebido (base64) en el HTML