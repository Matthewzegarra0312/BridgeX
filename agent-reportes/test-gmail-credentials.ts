import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function testGmailCredentials() {
  try {
    console.log('🔍 Iniciando prueba de credenciales de Gmail...\n');

    const serviceAccountEmail = process.env.GMAIL_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY;
    const impersonateEmail = process.env.GMAIL_IMPERSONATE_EMAIL;

    console.log('📋 Configuración detectada:');
    console.log(`  Email: ${serviceAccountEmail}`);
    console.log(`  Impersonate: ${impersonateEmail}`);
    console.log(`  Clave privada: ${privateKey ? '✓ Configurada' : '✗ Faltante'}\n`);

    if (!serviceAccountEmail || !privateKey) {
      console.error('❌ Error: Falta configurar GMAIL_SERVICE_ACCOUNT_EMAIL o GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY');
      process.exit(1);
    }

    // Crear cliente JWT
    // Nota: Para Service Account sin impersonación, usamos el mismo email
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/admin.directory.user'],
      subject: serviceAccountEmail, // Usar el service account email directamente
    });

    console.log('🔐 Autenticando con Google...');
    const token = await auth.getAccessToken();
    console.log('✓ Token de acceso obtenido exitosamente\n');

    // Crear cliente de Gmail
    const gmail = google.gmail({ version: 'v1', auth });

    console.log('📧 Obteniendo perfil de Gmail...');
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log('✓ Perfil obtenido exitosamente\n');

    console.log('📊 Información del perfil:');
    console.log(`  Email: ${profile.data.emailAddress}`);
    console.log(`  Mensajes totales: ${profile.data.messagesTotal}`);
    console.log(`  Etiquetas: ${profile.data.labelsTotal}\n`);

    // Intentar listar algunos emails
    console.log('📬 Intentando leer últimos emails...');
    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 3,
    });

    if (messages.data.messages && messages.data.messages.length > 0) {
      console.log(`✓ Se encontraron ${messages.data.messages.length} emails recientes\n`);
      console.log('✅ CREDENCIALES VÁLIDAS - Gmail está correctamente configurado');
    } else {
      console.log('⚠️ No hay emails recientes, pero las credenciales son válidas\n');
      console.log('✅ CREDENCIALES VÁLIDAS - Gmail está correctamente configurado');
    }

  } catch (error: any) {
    console.error('❌ Error en la prueba:\n');
    console.error('Mensaje:', error.message);
    
    if (error.code === 401 || error.message.includes('Unauthorized')) {
      console.error('\n⚠️ Problema de autenticación:');
      console.error('- Verifica que el Service Account esté correctamente configurado');
      console.error('- Asegúrate de que la clave privada es válida');
      console.error('- Si usas impersonación, verifica que el email existe en tu dominio Google Workspace');
    } else if (error.message.includes('Invalid JWT')) {
      console.error('\n⚠️ Problema con la clave privada:');
      console.error('- La clave privada puede estar mal formateada');
      console.error('- Intenta copiar la clave nuevamente del JSON descargado');
    }
    
    process.exit(1);
  }
}

testGmailCredentials();
