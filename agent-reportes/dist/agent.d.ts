import { type ReportPeriod } from './utils/report-generator.js';
import { type MySQLConfig } from './mcp/mysql-types.js';
import { type GmailConfig } from './mcp/gmail-types.js';
export interface AgentConfig {
    mysql: MySQLConfig;
    gmail: GmailConfig;
    server: {
        port: number;
        host: string;
        enableCron: boolean;
        cronSchedule: string;
    };
    reports: {
        defaultRecipients: string[];
        defaultReportType: string;
    };
}
export declare class ReportAgent {
    private app;
    private mysqlServer;
    private gmailServer;
    private config;
    private cronJobs;
    constructor(config: AgentConfig);
    private setupMiddleware;
    private setupRoutes;
    private setupCronJobs;
    /**
     * Genera un reporte basado en los parámetros proporcionados
     */
    generateReport(params: {
        query: string;
        period: ReportPeriod;
        recipients: string[];
        reportType?: string;
        includeComparison?: boolean;
    }): Promise<any>;
    /**
     * Ejecuta un reporte programado
     */
    runScheduledReport(reportType: string, recipients: string[]): Promise<any>;
    /**
     * Ejecuta una consulta MySQL (método helper)
     */
    private executeQuery;
    /**
     * Envía un email de reporte (método helper)
     */
    private sendReportEmail;
    /**
     * Calcula el período anterior para comparaciones
     */
    private calculatePreviousPeriod;
    /**
     * Inicia el servidor
     */
    start(): Promise<void>;
    /**
     * Detiene el servidor y limpia recursos
     */
    stop(): Promise<void>;
}
/**
 * Función helper para crear la configuración desde variables de entorno
 */
export declare function createConfigFromEnv(): AgentConfig;
//# sourceMappingURL=agent.d.ts.map