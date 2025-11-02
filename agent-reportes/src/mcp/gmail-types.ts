import { z } from 'zod';

// Esquemas de validación para Gmail MCP
export const GmailAttachmentSchema = z.object({
  filename: z.string().min(1, 'Filename cannot be empty'),
  content_base64: z.string().min(1, 'Content cannot be empty'),
  mimeType: z.string().optional().default('application/octet-stream'),
});

export const GmailSendRequestSchema = z.object({
  to: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient required'),
  cc: z.array(z.string().email('Invalid email address')).optional(),
  bcc: z.array(z.string().email('Invalid email address')).optional(),
  subject: z.string().min(1, 'Subject cannot be empty'),
  body_text: z.string().optional(),
  body_html: z.string().optional(),
  attachments: z.array(GmailAttachmentSchema).optional().default([]),
}).refine(
  (data: { body_text?: string; body_html?: string }) => data.body_text || data.body_html,
  {
    message: 'Either body_text or body_html must be provided',
    path: ['body_text'],
  }
);

export const GmailSendResponseSchema = z.object({
  status: z.enum(['sent', 'failed']),
  message_id: z.string().optional(),
  error: z.string().optional(),
  recipients_count: z.number(),
  sent_at: z.string().datetime(),
});

// Tipos TypeScript
export type GmailAttachment = z.infer<typeof GmailAttachmentSchema>;
export type GmailSendRequest = z.infer<typeof GmailSendRequestSchema>;
export type GmailSendResponse = z.infer<typeof GmailSendResponseSchema>;

// Configuración de Gmail con Service Account (Gmail API)
export const GmailConfigSchema = z.object({
  serviceAccountEmail: z.string().email('Service Account Email inválido'),
  serviceAccountPrivateKey: z.string().min(1, 'Private Key es requerida'),
  impersonateEmail: z.string().email('Email para impersonar es requerido'),
});

export type GmailConfig = z.infer<typeof GmailConfigSchema>;

// Configuración SMTP
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Información de plantilla de email
export const EmailTemplateSchema = z.object({
  subject: z.string(),
  htmlTemplate: z.string(),
  textTemplate: z.string().optional(),
  variables: z.record(z.any()).optional().default({}),
});

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

// Errores específicos de Gmail
export class GmailError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GmailError';
  }
}

export class GmailAuthError extends GmailError {
  constructor(message: string, originalError?: Error) {
    super(`Authentication failed: ${message}`);
    this.name = 'GmailAuthError';
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

export class GmailSendError extends GmailError {
  constructor(
    message: string,
    public recipients: string[],
    originalError?: Error
  ) {
    super(`Send failed: ${message}`);
    this.name = 'GmailSendError';
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

// Configuración predeterminada para plantillas
export const DEFAULT_REPORT_TEMPLATE: EmailTemplate = {
  subject: 'Reporte Automático - {{reportType}} - {{date}}',
  variables: {},
  htmlTemplate: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{{subject}}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .kpi-container { display: flex; justify-content: space-around; margin: 20px 0; }
        .kpi { text-align: center; padding: 15px; background-color: #e9ecef; border-radius: 5px; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .kpi-label { font-size: 12px; color: #6c757d; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>{{reportType}}</h1>
        <p>Fecha: {{date}}</p>
        <p>Período: {{period}}</p>
      </div>
      
      {{#if hasData}}
        <div class="kpi-container">
          {{#each kpis}}
            <div class="kpi">
              <div class="kpi-value">{{value}}</div>
              <div class="kpi-label">{{label}}</div>
            </div>
          {{/each}}
        </div>
        
        {{#if tableData}}
          <h3>Datos Detallados</h3>
          <table class="table">
            <thead>
              <tr>
                {{#each tableHeaders}}
                  <th>{{this}}</th>
                {{/each}}
              </tr>
            </thead>
            <tbody>
              {{#each tableData}}
                <tr>
                  {{#each this}}
                    <td>{{this}}</td>
                  {{/each}}
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{/if}}
      {{else}}
        <div style="text-align: center; padding: 40px; background-color: #fff3cd; border-radius: 5px;">
          <h2>Sin Resultados</h2>
          <p>No se encontraron datos para el período solicitado.</p>
        </div>
      {{/if}}
      
      <div class="footer">
        <p>Este reporte fue generado automáticamente por el sistema de reportes.</p>
        <p>Adjunto encontrará los datos en formato CSV para análisis adicional.</p>
      </div>
    </body>
    </html>
  `,
  textTemplate: `
    {{reportType}}
    Fecha: {{date}}
    Período: {{period}}
    
    {{#if hasData}}
      KPIs:
      {{#each kpis}}
        - {{label}}: {{value}}
      {{/each}}
      
      {{#if tableData}}
        Datos adjuntos en formato CSV.
      {{/if}}
    {{else}}
      Sin resultados para el período solicitado.
    {{/if}}
    
    Este reporte fue generado automáticamente.
  `,
};