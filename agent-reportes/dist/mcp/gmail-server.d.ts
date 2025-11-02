import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { GmailConfig } from './gmail-types.js';
export declare class GmailMCPServer {
    private server;
    private config;
    private gmail;
    private auth;
    constructor(config: GmailConfig);
    private setupTools;
    private sendEmail;
    private sendReport;
    private checkAuthStatus;
    private buildEmailContent;
    private ensureAuthenticated;
    authenticate(): Promise<void>;
    getMCPServer(): McpServer;
    handleRequest(transport: StreamableHTTPServerTransport): Promise<void>;
}
//# sourceMappingURL=gmail-server.d.ts.map