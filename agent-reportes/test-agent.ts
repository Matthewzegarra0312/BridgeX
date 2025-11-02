#!/usr/bin/env node

import dotenv from 'dotenv';
import { ReportAgent, createConfigFromEnv } from './src/agent.js';

dotenv.config();

console.log('[TEST] Starting test...');

try {
  console.log('[TEST] Creating config...');
  const config = createConfigFromEnv();
  console.log('[TEST] Config created');

  console.log('[TEST] Creating ReportAgent...');
  const agent = new ReportAgent(config);
  console.log('[TEST] ReportAgent created');

  console.log('[TEST] Starting agent...');
  await agent.start();
  console.log('[TEST] Agent started!');

  // Mantener el proceso abierto por 10 segundos
  console.log('[TEST] Keeping process alive for 10 seconds...');
  setTimeout(() => {
    console.log('[TEST] Closing...');
    process.exit(0);
  }, 10000);

} catch (error) {
  console.error('[TEST] Error:', error);
  process.exit(1);
}
