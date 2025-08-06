// ============================================================================
// EXPRESS CONFIG - CONFIGURACIÓN SIMPLIFICADA
// ============================================================================

import express, { Application } from 'express';
import { getCorsMiddleware } from './config/cors';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE BÁSICO
// ============================================================================

// CORS - MUY PERMISIVO
app.use(getCorsMiddleware());

// Middleware manual adicional para asegurar CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // En desarrollo, permitir TODO
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH,HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Responder a OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helmet con configuración MUY permisiva (solo para desarrollo)
if (process.env.NODE_ENV === 'development') {
  // Helmet desactivado en desarrollo para evitar problemas
  console.log('⚠️  Helmet desactivado en desarrollo');
} else {
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP
    crossOriginEmbedderPolicy: false
  }));
}

// ============================================================================
// RUTAS BÁSICAS
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test DB (si existe conexión)
app.get('/api/test-db', async (req, res) => {
  try {
    // Aquí irían las pruebas de BD
    res.json({
      success: true,
      message: 'Endpoint de prueba disponible',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en prueba de BD',
      error: error.message
    });
  }
});

// Catch-all para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableRoutes: ['/api/health', '/api/test-db']
  });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🎉 ¡Servidor iniciado con CORS arreglado!');
  console.log('=====================================');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`💓 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ CORS: Completamente permisivo');
  console.log('✅ CSP: Desactivado');
  console.log('');
});

export default app;
