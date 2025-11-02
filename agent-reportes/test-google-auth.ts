import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function testGoogleAuthentication() {
  try {
    console.log('🔍 Iniciando prueba de autenticación Google...\n');

    const serviceAccountEmail = process.env.GMAIL_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY;

    console.log('📋 Configuración detectada:');
    console.log(`  Service Account Email: ${serviceAccountEmail}`);
    console.log(`  Clave privada: ${privateKey ? '✓ Configurada' : '✗ Faltante'}\n`);

    if (!serviceAccountEmail || !privateKey) {
      console.error('❌ Error: Falta configurar GMAIL_SERVICE_ACCOUNT_EMAIL o GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY');
      process.exit(1);
    }

    // Paso 1: Validar que la clave privada sea válida
    console.log('🔐 Paso 1: Validando formato de clave privada...');
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    
    if (!formattedKey.includes('BEGIN PRIVATE KEY') || !formattedKey.includes('END PRIVATE KEY')) {
      console.error('❌ Clave privada con formato inválido');
      process.exit(1);
    }
    console.log('✓ Formato de clave privada válido\n');

    // Paso 2: Crear cliente JWT
    console.log('🔐 Paso 2: Creando cliente JWT...');
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/userinfo.profile'],
    });
    console.log('✓ Cliente JWT creado\n');

    // Paso 3: Obtener token de acceso
    console.log('🔐 Paso 3: Obteniendo token de acceso...');
    const token = await auth.getAccessToken();
    console.log('✓ Token obtenido exitosamente');
    console.log(`  Token (primeros 50 chars): ${(token.token as string).substring(0, 50)}...\n`);

    // Paso 4: Probar con servicios disponibles
    console.log('🔐 Paso 4: Probando acceso a Google APIs...');
    
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth });
      const userinfo = await oauth2.userinfo.get();
      console.log('✓ OAuth2 Info accesible');
      console.log(`  Email verificado: ${userinfo.data.email}\n`);
    } catch (e: any) {
      console.log('ℹ️ OAuth2 info no disponible (normal para Service Accounts)\n');
    }

    // Paso 5: Información sobre Gmail
    console.log('📊 Información sobre la configuración:\n');
    console.log('✅ AUTENTICACIÓN CORRECTA');
    console.log('   Las credenciales de Service Account son válidas\n');
    
    console.log('⚠️  NOTA IMPORTANTE:');
    console.log('   El error "Precondition check failed" indica que:');
    console.log('   1. El Service Account NO está delegado en Google Workspace');
    console.log('   2. No tiene permisos para acceder a Gmail de otros usuarios\n');
    
    console.log('🔧 PRÓXIMOS PASOS:');
    console.log('   1. Ve a Google Cloud Console');
    console.log('   2. Habilita la API de Gmail para este proyecto');
    console.log('   3. Si quieres impersonar usuarios, configura delegación de dominio');
    console.log('   4. O proporciona el email de usuario a impersonar\n');

  } catch (error: any) {
    console.error('❌ Error durante la autenticación:\n');
    console.error('Mensaje:', error.message);
    console.error('\nDetalles:', error.errors?.[0] || error.config?.data || 'Sin detalles adicionales');
    process.exit(1);
  }
}

testGoogleAuthentication();
