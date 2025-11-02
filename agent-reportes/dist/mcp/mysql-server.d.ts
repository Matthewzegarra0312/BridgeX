import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MySQLConfig } from './mysql-types.js';
export declare class MySQLMCPServer {
    private server;
    private pool;
    private config;
    constructor(config: MySQLConfig);
    private setupTools;
    private executeQuery;
    private getSchema;
    private ping;
    private ensureConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getMCPServer(): McpServer;
    handleRequest(transport: StreamableHTTPServerTransport): Promise<void>;
}
//# sourceMappingURL=mysql-server.d.ts.map