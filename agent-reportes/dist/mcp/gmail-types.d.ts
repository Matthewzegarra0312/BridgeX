import { z } from 'zod';
export declare const GmailAttachmentSchema: z.ZodObject<{
    filename: z.ZodString;
    content_base64: z.ZodString;
    mimeType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    filename: string;
    mimeType: string;
    content_base64: string;
}, {
    filename: string;
    content_base64: string;
    mimeType?: string | undefined;
}>;
export declare const GmailSendRequestSchema: z.ZodEffects<z.ZodObject<{
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    body_text: z.ZodOptional<z.ZodString>;
    body_html: z.ZodOptional<z.ZodString>;
    attachments: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content_base64: z.ZodString;
        mimeType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        mimeType: string;
        content_base64: string;
    }, {
        filename: string;
        content_base64: string;
        mimeType?: string | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    to: string[];
    subject: string;
    attachments: {
        filename: string;
        mimeType: string;
        content_base64: string;
    }[];
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    body_text?: string | undefined;
    body_html?: string | undefined;
}, {
    to: string[];
    subject: string;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    body_text?: string | undefined;
    body_html?: string | undefined;
    attachments?: {
        filename: string;
        content_base64: string;
        mimeType?: string | undefined;
    }[] | undefined;
}>, {
    to: string[];
    subject: string;
    attachments: {
        filename: string;
        mimeType: string;
        content_base64: string;
    }[];
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    body_text?: string | undefined;
    body_html?: string | undefined;
}, {
    to: string[];
    subject: string;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    body_text?: string | undefined;
    body_html?: string | undefined;
    attachments?: {
        filename: string;
        content_base64: string;
        mimeType?: string | undefined;
    }[] | undefined;
}>;
export declare const GmailSendResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["sent", "failed"]>;
    message_id: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    recipients_count: z.ZodNumber;
    sent_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "sent" | "failed";
    recipients_count: number;
    sent_at: string;
    error?: string | undefined;
    message_id?: string | undefined;
}, {
    status: "sent" | "failed";
    recipients_count: number;
    sent_at: string;
    error?: string | undefined;
    message_id?: string | undefined;
}>;
export type GmailAttachment = z.infer<typeof GmailAttachmentSchema>;
export type GmailSendRequest = z.infer<typeof GmailSendRequestSchema>;
export type GmailSendResponse = z.infer<typeof GmailSendResponseSchema>;
export declare const GmailConfigSchema: z.ZodObject<{
    serviceAccountEmail: z.ZodString;
    serviceAccountPrivateKey: z.ZodString;
    impersonateEmail: z.ZodString;
}, "strip", z.ZodTypeAny, {
    serviceAccountEmail: string;
    serviceAccountPrivateKey: string;
    impersonateEmail: string;
}, {
    serviceAccountEmail: string;
    serviceAccountPrivateKey: string;
    impersonateEmail: string;
}>;
export type GmailConfig = z.infer<typeof GmailConfigSchema>;
export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}
export declare const EmailTemplateSchema: z.ZodObject<{
    subject: z.ZodString;
    htmlTemplate: z.ZodString;
    textTemplate: z.ZodOptional<z.ZodString>;
    variables: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    subject: string;
    htmlTemplate: string;
    variables: Record<string, any>;
    textTemplate?: string | undefined;
}, {
    subject: string;
    htmlTemplate: string;
    textTemplate?: string | undefined;
    variables?: Record<string, any> | undefined;
}>;
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;
export declare class GmailError extends Error {
    code?: string | undefined;
    statusCode?: number | undefined;
    constructor(message: string, code?: string | undefined, statusCode?: number | undefined);
}
export declare class GmailAuthError extends GmailError {
    constructor(message: string, originalError?: Error);
}
export declare class GmailSendError extends GmailError {
    recipients: string[];
    constructor(message: string, recipients: string[], originalError?: Error);
}
export declare const DEFAULT_REPORT_TEMPLATE: EmailTemplate;
//# sourceMappingURL=gmail-types.d.ts.map