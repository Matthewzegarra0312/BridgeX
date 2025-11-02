import { stringify } from 'csv-stringify/sync';
import { logger } from '../utils/logger.js';
export class ReportGenerator {
    /**
     * Genera un reporte completo con KPIs y datos
     */
    static async generateReport(reportType, period, data, previousPeriodData) {
        try {
            logger.info('Generating report', { reportType, period, rowCount: data.rows.length });
            const hasData = data.rows.length > 0;
            // Generar KPIs
            const kpis = hasData
                ? this.calculateKPIs(data, previousPeriodData)
                : this.getEmptyKPIs();
            // Generar contenido CSV
            const csvContent = this.generateCSV(data);
            // Generar resumen
            const summary = this.generateSummary(reportType, period, kpis, hasData);
            const result = {
                reportType,
                period,
                kpis,
                data,
                csvContent,
                hasData,
                summary,
            };
            logger.info('Report generated successfully', {
                reportType,
                kpisCount: kpis.length,
                dataRows: data.rows.length,
                hasData,
            });
            return result;
        }
        catch (error) {
            logger.error('Failed to generate report', { error, reportType, period });
            throw new Error(`Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Calcula KPIs básicos de los datos
     */
    static calculateKPIs(data, previousData) {
        const kpis = [];
        if (data.rows.length === 0) {
            return this.getEmptyKPIs();
        }
        // KPI 1: Total de registros
        kpis.push({
            label: 'Total de Registros',
            value: data.rows.length,
            format: 'number',
        });
        // Intentar detectar columnas numéricas para KPIs adicionales
        const numericColumns = this.detectNumericColumns(data);
        if (numericColumns.length > 0) {
            // KPI 2: Suma total de la primera columna numérica
            const firstNumericCol = numericColumns[0];
            const sum = this.calculateSum(data, firstNumericCol.index);
            kpis.push({
                label: `Total ${firstNumericCol.name}`,
                value: this.formatNumber(sum),
                format: 'currency',
            });
            // KPI 3: Promedio de la primera columna numérica
            const average = sum / data.rows.length;
            kpis.push({
                label: `Promedio ${firstNumericCol.name}`,
                value: this.formatNumber(average),
                format: 'currency',
            });
            // KPI 4: Variación vs período anterior (si hay datos previos)
            if (previousData && previousData.rows.length > 0) {
                const previousSum = this.calculateSum(previousData, firstNumericCol.index);
                const variation = ((sum - previousSum) / previousSum) * 100;
                kpis.push({
                    label: 'Variación vs Período Anterior',
                    value: `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`,
                    format: 'percentage',
                });
            }
        }
        // KPI adicional: Top 5 si hay datos categóricos
        const topItems = this.getTopItems(data, 5);
        if (topItems.length > 0) {
            kpis.push({
                label: 'Top 5 Elementos',
                value: topItems.length,
                format: 'number',
            });
        }
        return kpis;
    }
    /**
     * Retorna KPIs vacíos para cuando no hay datos
     */
    static getEmptyKPIs() {
        return [
            {
                label: 'Total de Registros',
                value: 0,
                format: 'number',
            },
            {
                label: 'Total Ventas',
                value: 0,
                format: 'currency',
            },
            {
                label: 'Promedio',
                value: 0,
                format: 'currency',
            },
        ];
    }
    /**
     * Detecta columnas numéricas en los datos
     */
    static detectNumericColumns(data) {
        const numericColumns = [];
        if (data.rows.length === 0)
            return numericColumns;
        for (let i = 0; i < data.columns.length; i++) {
            const column = data.columns[i];
            const sampleValues = data.rows.slice(0, Math.min(10, data.rows.length)).map(row => row[i]);
            const isNumeric = sampleValues.every(value => value === null || value === undefined || !isNaN(Number(value)));
            if (isNumeric && sampleValues.some(value => value !== null && value !== undefined)) {
                numericColumns.push({ name: column || `Column_${i}`, index: i });
            }
        }
        return numericColumns;
    }
    /**
     * Calcula la suma de una columna numérica
     */
    static calculateSum(data, columnIndex) {
        return data.rows.reduce((sum, row) => {
            const value = Number(row[columnIndex]) || 0;
            return sum + value;
        }, 0);
    }
    /**
     * Obtiene los elementos más frecuentes/valiosos
     */
    static getTopItems(data, limit = 5) {
        if (data.rows.length === 0)
            return [];
        // Si hay columnas que parecen categorías, agrupar por ellas
        const categoricalColumns = this.detectCategoricalColumns(data);
        if (categoricalColumns.length > 0) {
            const firstCatCol = categoricalColumns[0];
            const counts = new Map();
            data.rows.forEach(row => {
                const category = String(row[firstCatCol.index] || 'Sin categoría');
                counts.set(category, (counts.get(category) || 0) + 1);
            });
            return Array.from(counts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([category, count]) => ({ category, count }));
        }
        return [];
    }
    /**
     * Detecta columnas categóricas (texto)
     */
    static detectCategoricalColumns(data) {
        const categoricalColumns = [];
        if (data.rows.length === 0)
            return categoricalColumns;
        for (let i = 0; i < data.columns.length; i++) {
            const column = data.columns[i];
            const sampleValues = data.rows.slice(0, Math.min(10, data.rows.length)).map(row => row[i]);
            const isTextual = sampleValues.some(value => typeof value === 'string' && isNaN(Number(value)));
            if (isTextual) {
                categoricalColumns.push({ name: column || `Column_${i}`, index: i });
            }
        }
        return categoricalColumns;
    }
    /**
     * Formatea números para presentación
     */
    static formatNumber(value) {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toFixed(2);
    }
    /**
     * Genera contenido CSV de los datos
     */
    static generateCSV(data) {
        try {
            if (data.rows.length === 0) {
                return `# Reporte generado en ${new Date().toISOString()}\n# Sin datos disponibles para el período solicitado\n`;
            }
            const csvData = [data.columns, ...data.rows];
            const csv = stringify(csvData, {
                header: false,
                delimiter: ',',
                quote: '"',
                escape: '"',
                record_delimiter: '\n',
            });
            // Agregar metadata como comentarios
            let result = `# Reporte generado en ${new Date().toISOString()}\n`;
            if (data.metadata?.query) {
                result += `# Consulta: ${data.metadata.query}\n`;
            }
            if (data.metadata?.executionTime) {
                result += `# Tiempo de ejecución: ${data.metadata.executionTime}ms\n`;
            }
            result += `# Total de registros: ${data.rows.length}\n\n`;
            result += csv;
            return result;
        }
        catch (error) {
            logger.error('Failed to generate CSV', { error, data });
            return `# Error generando CSV: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        }
    }
    /**
     * Genera un resumen textual del reporte
     */
    static generateSummary(reportType, period, kpis, hasData) {
        if (!hasData) {
            return `El reporte de ${reportType} para el período ${period.label} no contiene datos.`;
        }
        const kpiSummary = kpis
            .slice(0, 3) // Primeros 3 KPIs más importantes
            .map(kpi => `${kpi.label}: ${kpi.value}`)
            .join(', ');
        return `Resumen del ${reportType} para ${period.label}: ${kpiSummary}.`;
    }
    /**
     * Genera consultas SQL predefinidas para reportes comunes
     */
    static getReportQueries() {
        return {
            ventas_diarias: {
                sql: `
          SELECT 
            DATE(fecha) as fecha,
            COUNT(*) as total_transacciones,
            SUM(monto) as total_ventas,
            AVG(monto) as promedio_venta
          FROM ventas 
          WHERE fecha BETWEEN :desde AND :hasta
          GROUP BY DATE(fecha)
          ORDER BY fecha DESC
        `,
                description: 'Reporte de ventas agrupadas por día',
            },
            productos_top: {
                sql: `
          SELECT 
            p.nombre as producto,
            COUNT(v.id) as cantidad_vendida,
            SUM(v.monto) as total_ventas,
            AVG(v.monto) as precio_promedio
          FROM ventas v
          JOIN productos p ON v.producto_id = p.id
          WHERE v.fecha BETWEEN :desde AND :hasta
          GROUP BY p.id, p.nombre
          ORDER BY total_ventas DESC
          LIMIT 10
        `,
                description: 'Top 10 productos más vendidos',
            },
            clientes_activos: {
                sql: `
          SELECT 
            c.nombre as cliente,
            COUNT(v.id) as total_compras,
            SUM(v.monto) as total_gastado,
            MAX(v.fecha) as ultima_compra
          FROM clientes c
          JOIN ventas v ON c.id = v.cliente_id
          WHERE v.fecha BETWEEN :desde AND :hasta
          GROUP BY c.id, c.nombre
          ORDER BY total_gastado DESC
          LIMIT 20
        `,
                description: 'Top 20 clientes más activos',
            },
            resumen_mensual: {
                sql: `
          SELECT 
            YEAR(fecha) as año,
            MONTH(fecha) as mes,
            COUNT(*) as total_transacciones,
            SUM(monto) as total_ventas,
            COUNT(DISTINCT cliente_id) as clientes_unicos,
            AVG(monto) as ticket_promedio
          FROM ventas
          WHERE fecha BETWEEN :desde AND :hasta
          GROUP BY YEAR(fecha), MONTH(fecha)
          ORDER BY año DESC, mes DESC
        `,
                description: 'Resumen de ventas por mes',
            },
        };
    }
}
//# sourceMappingURL=report-generator.js.map