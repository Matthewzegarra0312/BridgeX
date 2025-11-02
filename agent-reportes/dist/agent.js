import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { MySQLMCPServer } from './mcp/mysql-server.js';
import { GmailMCPServer } from './mcp/gmail-server.js';
import { ReportGenerator } from './utils/report-generator.js';
import { MySQLConfigSchema } from './mcp/mysql-types.js';
import { GmailConfigSchema } from './mcp/gmail-types.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logError, logInfo } from './utils/logger.js';
import { retryWithExponentialBackoff } from './utils/retry.js';
// Cargar variables de entorno
dotenv.config();
export class ReportAgent {
    app;
    mysqlServer;
    gmailServer;
    config;
    cronJobs = new Map();
    constructor(config) {
        this.config = config;
        this.app = express();
        // Inicializar servidores MCP
        this.mysqlServer = new MySQLMCPServer(config.mysql);
        this.gmailServer = new GmailMCPServer(config.gmail);
        this.setupMiddleware();
        this.setupRoutes();
        this.setupCronJobs();
    }
    setupMiddleware() {
        // CORS para permitir acceso desde clientes MCP
        this.app.use(cors({
            origin: '*',
            exposedHeaders: ['Mcp-Session-Id'],
            allowedHeaders: ['Content-Type', 'mcp-session-id'],
        }));
        // Parsear JSON
        this.app.use(express.json({ limit: '10mb' }));
        // Logging de requests
        this.app.use((req, res, next) => {
            logInfo('HTTP Request', {
                method: req.method,
                path: req.path,
                userAgent: req.get('User-Agent'),
                ip: req.ip,
            });
            next();
        });
    }
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
            });
        });
        // Endpoint principal del agente para generar reportes
        this.app.post('/generate-report', async (req, res) => {
            try {
                const result = await this.generateReport(req.body);
                res.json(result);
            }
            catch (error) {
                logError('Report generation failed', error instanceof Error ? error : undefined, req.body);
                res.status(500).json({
                    error: 'Failed to generate report',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        // Endpoint para ejecutar reportes programados manualmente
        this.app.post('/run-scheduled-report', async (req, res) => {
            try {
                const { reportType, recipients } = req.body;
                const result = await this.runScheduledReport(reportType, recipients);
                res.json(result);
            }
            catch (error) {
                logError('Scheduled report execution failed', error instanceof Error ? error : undefined, req.body);
                res.status(500).json({
                    error: 'Failed to run scheduled report',
                    message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
        // Endpoints para los servidores MCP
        this.app.post('/mcp/mysql', async (req, res) => {
            try {
                const transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: undefined,
                    enableJsonResponse: true,
                });
                res.on('close', () => {
                    transport.close();
                });
                await this.mysqlServer.handleRequest(transport);
                await transport.handleRequest(req, res, req.body);
            }
            catch (error) {
                logError('MySQL MCP request failed', error instanceof Error ? error : undefined);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: 'Internal server error',
                        },
                        id: null,
                    });
                }
            }
        });
        this.app.post('/mcp/gmail', async (req, res) => {
            try {
                const transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: undefined,
                    enableJsonResponse: true,
                });
                res.on('close', () => {
                    transport.close();
                });
                await this.gmailServer.handleRequest(transport);
                await transport.handleRequest(req, res, req.body);
            }
            catch (error) {
                logError('Gmail MCP request failed', error instanceof Error ? error : undefined);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: 'Internal server error',
                        },
                        id: null,
                    });
                }
            }
        });
        // Endpoint para listar consultas de reporte disponibles
        this.app.get('/report-queries', (req, res) => {
            const queries = ReportGenerator.getReportQueries();
            res.json(queries);
        });
    }
    setupCronJobs() {
        if (!this.config.server.enableCron) {
            logInfo('Cron jobs disabled');
            return;
        }
        // Tarea programada para reporte diario
        const dailyJob = cron.schedule(this.config.server.cronSchedule, async () => {
            try {
                logInfo('Running scheduled daily report');
                await this.runScheduledReport('ventas_diarias', this.config.reports.defaultRecipients);
            }
            catch (error) {
                logError('Scheduled daily report failed', error instanceof Error ? error : undefined);
            }
        }, {
            scheduled: false,
            timezone: 'America/Mexico_City',
        });
        this.cronJobs.set('daily', dailyJob);
        dailyJob.start();
        logInfo('Cron jobs configured', {
            schedule: this.config.server.cronSchedule,
            timezone: 'America/Mexico_City',
        });
    }
    /**
     * Genera un reporte basado en los parámetros proporcionados
     */
    async generateReport(params) {
        try {
            logInfo('Generating report', params);
            // 1. Ejecutar consulta MySQL
            const queryParams = {
                desde: params.period.start,
                hasta: params.period.end,
            };
            const queryResult = await retryWithExponentialBackoff(async () => {
                // Simular llamada al MySQL MCP Server
                // En implementación real, esto sería una llamada HTTP al endpoint /mcp/mysql
                return await this.executeQuery(params.query, queryParams);
            }, 3, 1000);
            const reportData = {
                columns: queryResult.columns,
                rows: queryResult.rows,
                metadata: {
                    query: params.query,
                    executionTime: queryResult.executionTime,
                    generatedAt: new Date().toISOString(),
                },
            };
            // 2. Obtener datos del período anterior para comparación (si se solicita)
            let previousPeriodData;
            if (params.includeComparison) {
                const previousPeriod = this.calculatePreviousPeriod(params.period);
                const previousQueryParams = {
                    desde: previousPeriod.start,
                    hasta: previousPeriod.end,
                };
                const previousResult = await this.executeQuery(params.query, previousQueryParams);
                previousPeriodData = {
                    columns: previousResult.columns,
                    rows: previousResult.rows,
                };
            }
            // 3. Generar reporte con KPIs
            const report = await ReportGenerator.generateReport(params.reportType || this.config.reports.defaultReportType, params.period, reportData, previousPeriodData);
            // 4. Enviar por email
            const emailResult = await retryWithExponentialBackoff(async () => {
                return await this.sendReportEmail({
                    to: params.recipients,
                    reportType: report.reportType,
                    date: new Date().toLocaleDateString('es-ES'),
                    period: params.period.label,
                    kpis: report.kpis.map(kpi => ({
                        label: kpi.label,
                        value: String(kpi.value),
                    })),
                    tableHeaders: report.data.columns,
                    tableData: report.data.rows,
                    csvContent: report.csvContent,
                    hasData: report.hasData,
                });
            }, 3, 2000);
            const result = {
                success: true,
                report: {
                    type: report.reportType,
                    period: params.period,
                    summary: report.summary,
                    kpis: report.kpis,
                    dataRows: report.data.rows.length,
                    hasData: report.hasData,
                },
                email: {
                    status: emailResult.status,
                    messageId: emailResult.message_id,
                    recipients: params.recipients,
                    sentAt: emailResult.sent_at,
                },
                generatedAt: new Date().toISOString(),
            };
            logInfo('Report generated and sent successfully', {
                reportType: report.reportType,
                recipients: params.recipients.length,
                dataRows: report.data.rows.length,
                hasData: report.hasData,
            });
            return result;
        }
        catch (error) {
            logError('Report generation failed', error instanceof Error ? error : undefined, params);
            throw error;
        }
    }
    /**
     * Ejecuta un reporte programado
     */
    async runScheduledReport(reportType, recipients) {
        const queries = ReportGenerator.getReportQueries();
        const queryInfo = queries[reportType];
        if (!queryInfo) {
            throw new Error(`Unknown report type: ${reportType}`);
        }
        // Calcular período (último día completo)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        const period = {
            start: `${dateStr} 00:00:00`,
            end: `${dateStr} 23:59:59`,
            label: `${yesterday.toLocaleDateString('es-ES')}`,
        };
        return await this.generateReport({
            query: queryInfo.sql,
            period,
            recipients,
            reportType,
            includeComparison: true,
        });
    }
    /**
     * Ejecuta una consulta MySQL (método helper)
     */
    async executeQuery(sql, params) {
        // En implementación real, esto haría una llamada HTTP al MySQL MCP Server
        // Por ahora, simulamos conectándose directamente
        const mysqlServer = this.mysqlServer.getMCPServer();
        // Esta es una simulación - en el mundo real se haría vía HTTP
        const result = await mysqlServer.callTool('mysql_query', {
            sql,
            params,
        });
        return result.structuredContent;
    }
    /**
     * Envía un email de reporte (método helper)
     */
    async sendReportEmail(params) {
        // En implementación real, esto haría una llamada HTTP al Gmail MCP Server
        const gmailServer = this.gmailServer.getMCPServer();
        // Esta es una simulación - en el mundo real se haría vía HTTP
        const result = await gmailServer.callTool('gmail_send_report', params);
        return result.structuredContent;
    }
    /**
     * Calcula el período anterior para comparaciones
     */
    calculatePreviousPeriod(period) {
        const start = new Date(period.start);
        const end = new Date(period.end);
        const duration = end.getTime() - start.getTime();
        const previousStart = new Date(start.getTime() - duration);
        const previousEnd = new Date(end.getTime() - duration);
        return {
            start: previousStart.toISOString().replace('T', ' ').split('.')[0],
            end: previousEnd.toISOString().replace('T', ' ').split('.')[0],
            label: `Período anterior`,
        };
    }
    /**
     * Inicia el servidor
     */
    async start() {
        try {
            // Conectar a los servicios
            await this.mysqlServer.connect();
            await this.gmailServer.authenticate();
            // Iniciar servidor HTTP
            this.app.listen(this.config.server.port, this.config.server.host, () => {
                logInfo('Report Agent started', {
                    port: this.config.server.port,
                    host: this.config.server.host,
                    cronEnabled: this.config.server.enableCron,
                });
            });
        }
        catch (error) {
            logError('Failed to start Report Agent', error instanceof Error ? error : undefined);
            throw error;
        }
    }
    /**
     * Detiene el servidor y limpia recursos
     */
    async stop() {
        try {
            // Detener cron jobs
            this.cronJobs.forEach((job, name) => {
                job.stop();
                logInfo(`Stopped cron job: ${name}`);
            });
            this.cronJobs.clear();
            // Desconectar servicios
            await this.mysqlServer.disconnect();
            logInfo('Report Agent stopped successfully');
        }
        catch (error) {
            logError('Error stopping Report Agent', error instanceof Error ? error : undefined);
            throw error;
        }
    }
}
/**
 * Función helper para crear la configuración desde variables de entorno
 */
export function createConfigFromEnv() {
    const mysqlConfig = MySQLConfigSchema.parse({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        ssl: process.env.DB_SSL === 'true',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
        acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
        timeout: parseInt(process.env.DB_TIMEOUT || '30000'),
    });
    const gmailConfig = GmailConfigSchema.parse({
        serviceAccountEmail: process.env.GMAIL_SERVICE_ACCOUNT_EMAIL,
        serviceAccountPrivateKey: process.env.GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        impersonateEmail: process.env.GMAIL_IMPERSONATE_EMAIL,
    });
    return {
        mysql: mysqlConfig,
        gmail: gmailConfig,
        server: {
            port: parseInt(process.env.PORT || '3000'),
            host: process.env.HOST || 'localhost',
            enableCron: process.env.ENABLE_CRON !== 'false',
            cronSchedule: process.env.CRON_SCHEDULE || '0 9 * * *', // 9 AM diario
        },
        reports: {
            defaultRecipients: (process.env.DEFAULT_RECIPIENTS || '').split(',').filter(Boolean),
            defaultReportType: process.env.DEFAULT_REPORT_TYPE || 'ventas_diarias',
        },
    };
}
//# sourceMappingURL=agent.js.map