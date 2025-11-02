#!/usr/bin/env node

/**
 * EJEMPLO DE USO DEL AGENTE DE REPORTES
 * 
 * Este script demuestra cómo usar el Agente de Reportes para:
 * 1. Generar reportes de ventas
 * 2. Enviar reportes por email
 * 3. Programar reportes automáticos
 */

import dotenv from 'dotenv';
import { ReportAgent, createConfigFromEnv } from '../src/index.js';

// Cargar configuración
dotenv.config();

async function ejemploReporteVentas() {
  console.log('🚀 Iniciando ejemplo de Agente de Reportes...\n');

  try {
    // 1. Crear configuración
    const config = createConfigFromEnv();
    
    // 2. Inicializar el agente
    const agent = new ReportAgent(config);
    
    console.log('📋 Configuración cargada:');
    console.log(`   - Base de datos: ${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`);
    console.log(`   - Email: OAuth2 configurado`);
    console.log(`   - Servidor: ${config.server.host}:${config.server.port}`);
    console.log(`   - Cron habilitado: ${config.server.enableCron}\n`);

    // 3. Iniciar el agente
    await agent.start();
    console.log('✅ Agente iniciado correctamente\n');

    // 4. Generar reporte de ejemplo
    console.log('📊 Generando reporte de ventas...');
    
    const reportParams = {
      query: `
        SELECT 
          DATE(fecha) as fecha,
          COUNT(*) as total_transacciones,
          SUM(monto) as total_ventas,
          AVG(monto) as promedio_venta
        FROM ventas 
        WHERE fecha BETWEEN :desde AND :hasta
        GROUP BY DATE(fecha)
        ORDER BY fecha DESC
      `,
      period: {
        start: '2024-11-01 00:00:00',
        end: '2024-11-01 23:59:59',
        label: '1 de noviembre de 2024',
      },
      recipients: ['test@example.com'],
      reportType: 'Ventas Diarias',
      includeComparison: true,
    };

    const reportResult = await agent.generateReport(reportParams);
    
    console.log('✅ Reporte generado exitosamente:');
    console.log(`   - Tipo: ${reportResult.report.type}`);
    console.log(`   - Período: ${reportResult.report.period.label}`);
    console.log(`   - Filas de datos: ${reportResult.report.dataRows}`);
    console.log(`   - Tiene datos: ${reportResult.report.hasData}`);
    console.log(`   - KPIs generados: ${reportResult.report.kpis.length}`);
    
    if (reportResult.report.kpis.length > 0) {
      console.log('\n📈 KPIs principales:');
      reportResult.report.kpis.slice(0, 3).forEach(kpi => {
        console.log(`   - ${kpi.label}: ${kpi.value}`);
      });
    }

    console.log(`\n📧 Email enviado:`)
    console.log(`   - Estado: ${reportResult.email.status}`);
    console.log(`   - Destinatarios: ${reportResult.email.recipients.join(', ')}`);
    console.log(`   - ID del mensaje: ${reportResult.email.messageId || 'N/A'}`);

    // 5. Ejemplo de reporte programado
    console.log('\n⏰ Ejecutando reporte programado...');
    
    const scheduledResult = await agent.runScheduledReport(
      'ventas_diarias',
      ['manager@empresa.com', 'analytics@empresa.com']
    );
    
    console.log('✅ Reporte programado ejecutado:');
    console.log(`   - Resumen: ${scheduledResult.report.summary}`);

    console.log('\n🎉 Ejemplo completado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Configurar variables de entorno reales en .env');
    console.log('   2. Crear base de datos con examples/database-setup.sql');
    console.log('   3. Configurar credenciales de Gmail OAuth2');
    console.log('   4. Ejecutar: npm start');

    // Detener el agente
    await agent.stop();

  } catch (error) {
    console.error('❌ Error en el ejemplo:', error);
    
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Sugerencias:');
      console.log('   - Verificar configuración de base de datos en .env');
      console.log('   - Asegurar que MySQL esté ejecutándose');
      console.log('   - Crear la base de datos con examples/database-setup.sql');
    }
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      console.log('\n💡 Sugerencias para Gmail:');
      console.log('   - Configurar OAuth2 en Google Cloud Console');
      console.log('   - Verificar GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET y GMAIL_REFRESH_TOKEN');
      console.log('   - O usar App Password como alternativa');
    }
  }
}

async function ejemploConsultasDisponibles() {
  console.log('\n📋 Consultas de reporte disponibles:');
  
  const queries = {
    ventas_diarias: {
      sql: `
        SELECT 
          DATE(fecha) as fecha,
          COUNT(*) as total_transacciones,
          SUM(monto) as total_ventas,
          AVG(monto) as promedio_venta
        FROM ventas 
        WHERE fecha BETWEEN :desde AND :hasta
        GROUP BY DATE(fecha)
        ORDER BY fecha DESC
      `,
      description: 'Reporte de ventas agrupadas por día',
    },
    productos_top: {
      sql: `
        SELECT 
          p.nombre as producto,
          COUNT(v.id) as cantidad_vendida,
          SUM(v.monto) as total_ventas,
          AVG(v.monto) as precio_promedio
        FROM ventas v
        JOIN productos p ON v.producto_id = p.id
        WHERE v.fecha BETWEEN :desde AND :hasta
        GROUP BY p.id, p.nombre
        ORDER BY total_ventas DESC
        LIMIT 10
      `,
      description: 'Top 10 productos más vendidos',
    },
    clientes_activos: {
      sql: `
        SELECT 
          c.nombre as cliente,
          COUNT(v.id) as total_compras,
          SUM(v.monto) as total_gastado,
          MAX(v.fecha) as ultima_compra
        FROM clientes c
        JOIN ventas v ON c.id = v.cliente_id
        WHERE v.fecha BETWEEN :desde AND :hasta
        GROUP BY c.id, c.nombre
        ORDER BY total_gastado DESC
        LIMIT 20
      `,
      description: 'Top 20 clientes más activos',
    },
  };

  Object.entries(queries).forEach(([key, query]) => {
    console.log(`\n🔍 ${key}:`);
    console.log(`   Descripción: ${query.description}`);
    console.log(`   Parámetros: :desde, :hasta`);
  });
}

async function ejemploHTTPClient() {
  console.log('\n🌐 Ejemplo de uso vía HTTP API:');
  
  const exampleRequest = {
    method: 'POST',
    url: 'http://localhost:3000/generate-report',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      query: `
        SELECT 
          DATE(fecha) as fecha,
          SUM(monto) as total_ventas,
          COUNT(*) as transacciones
        FROM ventas 
        WHERE fecha BETWEEN :desde AND :hasta
        GROUP BY DATE(fecha)
      `,
      period: {
        start: '2024-11-01 00:00:00',
        end: '2024-11-07 23:59:59',
        label: 'Semana del 1-7 nov 2024',
      },
      recipients: ['finanzas@empresa.com', 'gerencia@empresa.com'],
      reportType: 'Reporte Semanal',
      includeComparison: true,
    },
  };

  console.log('Curl ejemplo:');
  console.log(`curl -X POST http://localhost:3000/generate-report \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '${JSON.stringify(exampleRequest.body, null, 2)}'`);

  console.log('\n📋 Otros endpoints disponibles:');
  console.log('   GET  /health - Estado del servicio');
  console.log('   GET  /report-queries - Consultas predefinidas');
  console.log('   POST /run-scheduled-report - Ejecutar reporte programado');
  console.log('   POST /mcp/mysql - Servidor MCP MySQL');
  console.log('   POST /mcp/gmail - Servidor MCP Gmail');
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--queries')) {
    await ejemploConsultasDisponibles();
    return;
  }
  
  if (args.includes('--http')) {
    await ejemploHTTPClient();
    return;
  }

  if (args.includes('--help')) {
    console.log('📖 Uso del ejemplo:');
    console.log('   node examples/usage-example.js          # Ejecutar ejemplo completo');
    console.log('   node examples/usage-example.js --queries # Mostrar consultas disponibles');
    console.log('   node examples/usage-example.js --http    # Ejemplos de API HTTP');
    console.log('   node examples/usage-example.js --help    # Mostrar esta ayuda');
    return;
  }

  await ejemploReporteVentas();
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}