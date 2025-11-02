import express, { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export function createConfigRouter(): Router {
  const router = express.Router();

  // GET configuration status
  router.get('/status', (_req: Request, res: Response) => {
    try {
      const envPath = path.join(process.cwd(), '.env');
      const envContent = fs.readFileSync(envPath, 'utf-8');
      
      // Parse .env file
      const envVars: Record<string, string> = {};
      envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });

      res.json({
        mysql: {
          host: envVars['DB_HOST'],
          port: envVars['DB_PORT'],
          database: envVars['DB_NAME'],
          user: envVars['DB_USER'],
        },
        gmail: {
          serviceAccountEmail: envVars['GMAIL_SERVICE_ACCOUNT_EMAIL'],
          impersonateEmail: envVars['GMAIL_IMPERSONATE_EMAIL'],
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read configuration' });
    }
  });

  // POST save MySQL configuration
  router.post('/mysql', (req: Request, res: Response) => {
    try {
      const { host, port, database, user, password } = req.body;
      
      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf-8');

      // Update or create environment variables
      const updates: Record<string, string> = {
        'DB_HOST': host,
        'DB_PORT': port,
        'DB_NAME': database,
        'DB_USER': user,
        'DB_PASS': password,
      };

      Object.entries(updates).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });

      fs.writeFileSync(envPath, envContent);
      
      // Reload environment variables
      dotenv.config({ override: true });

      res.json({ success: true, message: 'MySQL configuration saved. Please restart the backend.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: `Failed to save MySQL configuration: ${message}` });
    }
  });

  // POST save Gmail configuration
  router.post('/gmail', (req: Request, res: Response): void => {
    try {
      const { serviceAccountEmail, serviceAccountPrivateKey, impersonateEmail } = req.body;
      
      if (!serviceAccountEmail || !serviceAccountPrivateKey || !impersonateEmail) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const envPath = path.join(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf-8');

      // Escape newlines in private key for .env format
      const escapedPrivateKey = serviceAccountPrivateKey.replace(/\n/g, '\\n');

      const updates: Record<string, string> = {
        'GMAIL_SERVICE_ACCOUNT_EMAIL': serviceAccountEmail,
        'GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY': escapedPrivateKey,
        'GMAIL_IMPERSONATE_EMAIL': impersonateEmail,
      };

      Object.entries(updates).forEach(([key, value]) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });

      fs.writeFileSync(envPath, envContent);
      
      // Reload environment variables
      dotenv.config({ override: true });

      res.json({ success: true, message: 'Gmail configuration saved. Please restart the backend.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: `Failed to save Gmail configuration: ${message}` });
    }
  });

  // POST test MySQL connection
  router.post('/test/mysql', async (req: Request, res: Response) => {
    try {
      const { host, port, database, user, password } = req.body;
      
      // Test connection using mysql2
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host,
        port: parseInt(port),
        database,
        user,
        password,
      });

      await connection.ping();
      await connection.end();

      res.json({ success: true, message: 'MySQL connection successful' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: `MySQL connection failed: ${message}` });
    }
  });

  // POST test Gmail connection
  router.post('/test/gmail', async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceAccountEmail, serviceAccountPrivateKey, impersonateEmail } = req.body;
      
      if (!serviceAccountEmail || !serviceAccountPrivateKey || !impersonateEmail) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { google } = require('googleapis');

      // Create JWT auth
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: serviceAccountPrivateKey,
        scopes: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.readonly',
        ],
        subject: impersonateEmail,
      });

      // Initialize Gmail API
      const gmail = google.gmail({ version: 'v1', auth });

      // Try to get profile
      if (!impersonateEmail.includes('.iam.gserviceaccount.com')) {
        await gmail.users.getProfile({ userId: impersonateEmail });
      }

      res.json({ 
        success: true, 
        message: 'Gmail authentication successful',
        email: impersonateEmail,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: `Gmail authentication failed: ${message}` });
    }
  });

  return router;
}
