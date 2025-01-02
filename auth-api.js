const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// Middleware ensureAuthenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'No autorizado. Inicia sesión primero.' });
}

// Configuración de CORS con soporte para múltiples dominios o un dominio fijo.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN_NEW.split(',')
  : ['https://hidroxcajaherramientas.netlify.app']; // Fallback a dominio fijo

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes desde Postman (sin origen) o dominios permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS bloqueado para el origen: ${origin}`);
        callback(new Error('No autorizado por CORS'));
      }
    },
    credentials: true, // Permitir cookies y encabezados de autenticación
  })
);


// Prueba de ruta para verificar CORS
app.get('/test', (req, res) => {
  res.json({ message: 'CORS configurado correctamente' });
});


// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Clave secreta desde variables de entorno
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 horas
  })
);

// Inicializa Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación (pueden requerir protección)
app.use('/auth', authRoutes);

// Rutas de la API (sin protección de login)
app.use('/api', apiRoutes);

// Middleware global para manejar errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err.stack);

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: 'Algo salió mal en el servidor.',
    details: isProduction ? undefined : err.message, // Mostrar detalles solo en desarrollo
  });
});


// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Exportar ensureAuthenticated solo si es necesario en otros módulos
module.exports = { app, ensureAuthenticated };
