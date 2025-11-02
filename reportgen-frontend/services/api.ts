import axios from 'axios';
import type {
  GenerateReportRequest,
  GenerateReportResponse,
  ReportQuery,
  ConnectionStatus,
  ReportHistory,
} from '@/types/report.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 segundos para reportes largos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging
apiClient.interceptors.request.use(
  (config: any) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: any) => {
    console.log(`[API] Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error: any) => {
    console.error(`[API] Error from ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

// Health check
export const checkHealth = async (): Promise<any> => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Generate report
export const generateReport = async (
  request: GenerateReportRequest
): Promise<GenerateReportResponse> => {
  const response = await apiClient.post<GenerateReportResponse>('/generate-report', request);
  return response.data;
};

// Get available report queries
export const getReportQueries = async (): Promise<Record<string, ReportQuery>> => {
  const response = await apiClient.get<Record<string, ReportQuery>>('/report-queries');
  return response.data;
};

// Run scheduled report manually
export const runScheduledReport = async (
  reportType: string,
  recipients: string[]
): Promise<GenerateReportResponse> => {
  const response = await apiClient.post<GenerateReportResponse>('/run-scheduled-report', {
    reportType,
    recipients,
  });
  return response.data;
};

// Get connection status (mock for now)
export const getConnectionStatus = async (): Promise<ConnectionStatus> => {
  try {
    const health = await checkHealth();
    return {
      mysql: {
        connected: health.status === 'healthy',
        host: 'db.example.com',
        database: 'reports_db',
      },
      gmail: {
        authenticated: health.status === 'healthy',
        email: 'user.name@example.com',
      },
    };
  } catch (error) {
    return {
      mysql: {
        connected: false,
      },
      gmail: {
        authenticated: false,
      },
    };
  }
};

// Get report history (mock data for now)
export const getReportHistory = async (): Promise<ReportHistory[]> => {
  // En producción, esto vendría del backend
  return [
    {
      id: '1',
      reportName: 'Q3 Sales Performance',
      generationDate: 'Oct 28, 2023, 9:41 AM',
      type: 'PDF',
      status: 'success',
    },
    {
      id: '2',
      reportName: 'Weekly User Engagement',
      generationDate: 'Oct 25, 2023, 11:15 AM',
      type: 'CSV',
      status: 'failed',
    },
    {
      id: '3',
      reportName: 'Daily API Usage Summary',
      generationDate: 'Oct 24, 2023, 2:30 PM',
      type: 'Excel',
      status: 'success',
    },
    {
      id: '4',
      reportName: 'Monthly Financial Overview',
      generationDate: 'Oct 24, 2023, 8:00 AM',
      type: 'PDF',
      status: 'in-progress',
    },
    {
      id: '5',
      reportName: 'Customer Support Tickets',
      generationDate: 'Oct 23, 2023, 5:05 PM',
      type: 'CSV',
      status: 'success',
    },
  ];
};

export default apiClient;
