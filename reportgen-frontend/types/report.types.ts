// Report Types
export interface ReportPeriod {
  start: string;
  end: string;
  label: string;
}

export interface ReportKPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ReportData {
  columns: string[];
  rows: any[][];
  metadata?: {
    query?: string;
    executionTime?: number;
    generatedAt?: string;
  };
}

export interface GenerateReportRequest {
  query: string;
  period: ReportPeriod;
  recipients: string[];
  reportType?: string;
  includeComparison?: boolean;
  includeCharts?: boolean;
  attachCSV?: boolean;
}

export interface GenerateReportResponse {
  success: boolean;
  report: {
    type: string;
    period: ReportPeriod;
    summary: string;
    kpis: ReportKPI[];
    dataRows: number;
    hasData: boolean;
  };
  email: {
    status: string;
    messageId?: string;
    recipients: string[];
    sentAt: string;
  };
  generatedAt: string;
}

export interface ReportQuery {
  id: string;
  name: string;
  sql: string;
  description?: string;
}

export interface ConnectionStatus {
  mysql: {
    connected: boolean;
    host?: string;
    database?: string;
  };
  gmail: {
    authenticated: boolean;
    email?: string;
  };
}

export interface ScheduledReport {
  id: string;
  taskName: string;
  frequency: string;
  nextExecution: string;
  status: 'active' | 'inactive';
  reportType: string;
  recipients: string[];
}

export interface ReportHistory {
  id: string;
  reportName: string;
  generationDate: string;
  type: string;
  status: 'success' | 'failed' | 'in-progress';
}
