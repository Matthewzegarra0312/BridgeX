#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config();

console.log('[TEST] Environment variables loaded');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('GMAIL_SERVICE_ACCOUNT_EMAIL:', process.env.GMAIL_SERVICE_ACCOUNT_EMAIL);
console.log('GMAIL_IMPERSONATE_EMAIL:', process.env.GMAIL_IMPERSONATE_EMAIL);
console.log('PORT:', process.env.PORT);

console.log('[TEST] Importing config function...');
import('./src/agent.js').then((module) => {
  console.log('[TEST] Config function imported');
  try {
    const config = module.createConfigFromEnv();
    console.log('[TEST] Config created:', JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('[TEST] Error creating config:', error);
  }
}).catch((error) => {
  console.error('[TEST] Error importing:', error);
});
