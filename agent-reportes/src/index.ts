#!/usr/bin/env node

import { ReportAgent, createConfigFromEnv } from './agent.js';
import { logError, logInfo } from './utils/logger.js';

async function main() {
  console.log('[DEBUG] Starting main function...');
  try {
    // Cargar configuración desde variables de entorno
    console.log('[DEBUG] Loading configuration...');
    const config = createConfigFromEnv();
    console.log('[DEBUG] Configuration loaded:', JSON.stringify({
      mysql: { host: config.mysql.host, database: config.mysql.database },
      server: { port: config.server.port }
    }));
    
    logInfo('Starting Report Agent', {
      mysql: {
        host: config.mysql.host,
        database: config.mysql.database,
        user: config.mysql.user,
      },
      server: {
        port: config.server.port,
        host: config.server.host,
        enableCron: config.server.enableCron,
      },
    });

    // Crear e iniciar el agente
    console.log('[DEBUG] Creating ReportAgent...');
    const agent = new ReportAgent(config);
    
    // Manejar señales de terminación para limpieza
    process.on('SIGINT', async () => {
      logInfo('Received SIGINT, shutting down gracefully...');
      try {
        await agent.stop();
        process.exit(0);
      } catch (error) {
        logError('Error during shutdown', error instanceof Error ? error : undefined);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      logInfo('Received SIGTERM, shutting down gracefully...');
      try {
        await agent.stop();
        process.exit(0);
      } catch (error) {
        logError('Error during shutdown', error instanceof Error ? error : undefined);
        process.exit(1);
      }
    });

    // Manejar errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      logError('Unhandled Rejection', new Error(String(reason)), { promise });
    });

    process.on('uncaughtException', (error) => {
      logError('Uncaught Exception', error);
      process.exit(1);
    });

    // Iniciar el agente
    console.log('[DEBUG] Starting agent...');
    await agent.start();
    
    console.log('[DEBUG] Agent started successfully!');
    logInfo('Report Agent is running successfully');
    
  } catch (error) {
    console.error('[ERROR] Failed to start:', error);
    logError('Failed to start Report Agent', error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

// Verificar si este archivo se está ejecutando directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ReportAgent, createConfigFromEnv };