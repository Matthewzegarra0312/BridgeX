export interface KPI {
    label: string;
    value: string | number;
    format?: 'number' | 'currency' | 'percentage' | 'date';
    prefix?: string;
    suffix?: string;
}
export interface ReportData {
    columns: string[];
    rows: any[][];
    metadata?: {
        query: string;
        executionTime?: number;
        generatedAt: string;
    };
}
export interface ReportPeriod {
    start: string;
    end: string;
    label: string;
}
export interface ReportResult {
    reportType: string;
    period: ReportPeriod;
    kpis: KPI[];
    data: ReportData;
    csvContent: string;
    hasData: boolean;
    summary: string;
}
export declare class ReportGenerator {
    /**
     * Genera un reporte completo con KPIs y datos
     */
    static generateReport(reportType: string, period: ReportPeriod, data: ReportData, previousPeriodData?: ReportData): Promise<ReportResult>;
    /**
     * Calcula KPIs básicos de los datos
     */
    private static calculateKPIs;
    /**
     * Retorna KPIs vacíos para cuando no hay datos
     */
    private static getEmptyKPIs;
    /**
     * Detecta columnas numéricas en los datos
     */
    private static detectNumericColumns;
    /**
     * Calcula la suma de una columna numérica
     */
    private static calculateSum;
    /**
     * Obtiene los elementos más frecuentes/valiosos
     */
    private static getTopItems;
    /**
     * Detecta columnas categóricas (texto)
     */
    private static detectCategoricalColumns;
    /**
     * Formatea números para presentación
     */
    private static formatNumber;
    /**
     * Genera contenido CSV de los datos
     */
    private static generateCSV;
    /**
     * Genera un resumen textual del reporte
     */
    private static generateSummary;
    /**
     * Genera consultas SQL predefinidas para reportes comunes
     */
    static getReportQueries(): Record<string, {
        sql: string;
        description: string;
    }>;
}
//# sourceMappingURL=report-generator.d.ts.map