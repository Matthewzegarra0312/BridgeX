import { ReportGenerator, type ReportData, type ReportPeriod } from '../src/utils/report-generator.js';

describe('ReportGenerator', () => {
  const mockPeriod: ReportPeriod = {
    start: '2024-11-01 00:00:00',
    end: '2024-11-01 23:59:59',
    label: '1 de noviembre de 2024',
  };

  const mockDataWithResults: ReportData = {
    columns: ['fecha', 'producto', 'cantidad', 'total'],
    rows: [
      ['2024-11-01', 'iPhone 14', 2, 51998.00],
      ['2024-11-01', 'Samsung Galaxy S23', 1, 22999.00],
      ['2024-11-01', 'Laptop Dell XPS 13', 1, 35999.00],
    ],
    metadata: {
      query: 'SELECT * FROM ventas WHERE fecha BETWEEN ? AND ?',
      executionTime: 150,
      generatedAt: '2024-11-01T10:00:00.000Z',
    },
  };

  const mockDataEmpty: ReportData = {
    columns: ['fecha', 'producto', 'cantidad', 'total'],
    rows: [],
    metadata: {
      query: 'SELECT * FROM ventas WHERE fecha BETWEEN ? AND ?',
      executionTime: 50,
      generatedAt: '2024-11-01T10:00:00.000Z',
    },
  };

  describe('generateReport', () => {
    test('should generate report with data successfully', async () => {
      const result = await ReportGenerator.generateReport(
        'Ventas Diarias',
        mockPeriod,
        mockDataWithResults
      );

      expect(result).toBeDefined();
      expect(result.reportType).toBe('Ventas Diarias');
      expect(result.period).toEqual(mockPeriod);
      expect(result.hasData).toBe(true);
      expect(result.kpis).toHaveLength(4); // Total registros, Total, Promedio, Top 5
      expect(result.csvContent).toContain('fecha,producto,cantidad,total');
      expect(result.summary).toContain('Ventas Diarias');
    });

    test('should generate report with empty data', async () => {
      const result = await ReportGenerator.generateReport(
        'Ventas Diarias',
        mockPeriod,
        mockDataEmpty
      );

      expect(result).toBeDefined();
      expect(result.reportType).toBe('Ventas Diarias');
      expect(result.hasData).toBe(false);
      expect(result.kpis).toHaveLength(3); // KPIs vacíos
      expect(result.kpis[0].value).toBe(0);
      expect(result.csvContent).toContain('Sin datos disponibles');
      expect(result.summary).toContain('no contiene datos');
    });

    test('should calculate KPIs correctly', async () => {
      const result = await ReportGenerator.generateReport(
        'Ventas Diarias',
        mockPeriod,
        mockDataWithResults
      );

      const totalRecords = result.kpis.find(kpi => kpi.label === 'Total de Registros');
      expect(totalRecords?.value).toBe(3);

      const totalAmount = result.kpis.find(kpi => kpi.label.includes('Total'));
      expect(totalAmount?.value).toBeDefined();
    });

    test('should include comparison with previous period', async () => {
      const previousPeriodData: ReportData = {
        columns: ['fecha', 'producto', 'cantidad', 'total'],
        rows: [
          ['2024-10-31', 'iPhone 14', 1, 25999.00],
        ],
      };

      const result = await ReportGenerator.generateReport(
        'Ventas Diarias',
        mockPeriod,
        mockDataWithResults,
        previousPeriodData
      );

      const variationKPI = result.kpis.find(kpi => kpi.label.includes('Variación'));
      expect(variationKPI).toBeDefined();
      expect(variationKPI?.format).toBe('percentage');
    });
  });

  describe('CSV generation', () => {
    test('should generate valid CSV content', async () => {
      const result = await ReportGenerator.generateReport(
        'Ventas Diarias',
        mockPeriod,
        mockDataWithResults
      );

      expect(result.csvContent).toContain('fecha,producto,cantidad,total');
      expect(result.csvContent).toContain('iPhone 14');
      expect(result.csvContent).toContain('51998');
      expect(result.csvContent).toContain('# Reporte generado en');
      expect(result.csvContent).toContain('# Total de registros: 3');
    });

    test('should handle empty data in CSV', async () => {
      const result = await ReportGenerator.generateReport(
        'Ventas Diarias',
        mockPeriod,
        mockDataEmpty
      );

      expect(result.csvContent).toContain('Sin datos disponibles');
      expect(result.csvContent).toContain('# Reporte generado en');
    });
  });

  describe('getReportQueries', () => {
    test('should return predefined report queries', () => {
      const queries = ReportGenerator.getReportQueries();

      expect(queries).toBeDefined();
      expect(queries.ventas_diarias).toBeDefined();
      expect(queries.ventas_diarias.sql).toContain('SELECT');
      expect(queries.ventas_diarias.description).toBeDefined();

      expect(queries.productos_top).toBeDefined();
      expect(queries.clientes_activos).toBeDefined();
      expect(queries.resumen_mensual).toBeDefined();
    });

    test('should have valid SQL queries', () => {
      const queries = ReportGenerator.getReportQueries();

      Object.values(queries).forEach(query => {
        expect(query.sql).toContain('SELECT');
        expect(query.sql).toContain(':desde');
        expect(query.sql).toContain(':hasta');
        expect(query.description).toBeTruthy();
      });
    });
  });
});

describe('ReportGenerator edge cases', () => {
  test('should handle null values in data', async () => {
    const dataWithNulls: ReportData = {
      columns: ['fecha', 'producto', 'cantidad', 'total'],
      rows: [
        ['2024-11-01', null, 1, 100.00],
        [null, 'Producto', null, null],
        ['2024-11-01', 'Producto 2', 2, 200.00],
      ],
    };

    const period: ReportPeriod = {
      start: '2024-11-01',
      end: '2024-11-01',
      label: 'Test',
    };

    const result = await ReportGenerator.generateReport(
      'Test Report',
      period,
      dataWithNulls
    );

    expect(result.hasData).toBe(true);
    expect(result.kpis).toBeDefined();
    expect(result.csvContent).toBeDefined();
  });

  test('should handle very large numbers', async () => {
    const dataWithLargeNumbers: ReportData = {
      columns: ['id', 'amount'],
      rows: [
        [1, 1000000000], // 1 billion
        [2, 5000000],    // 5 million
        [3, 50000],      // 50 thousand
      ],
    };

    const period: ReportPeriod = {
      start: '2024-11-01',
      end: '2024-11-01',
      label: 'Test',
    };

    const result = await ReportGenerator.generateReport(
      'Large Numbers Test',
      period,
      dataWithLargeNumbers
    );

    expect(result.hasData).toBe(true);
    const totalKPI = result.kpis.find(kpi => kpi.label.includes('Total'));
    expect(totalKPI?.value).toContain('B'); // Should format to billions
  });
});