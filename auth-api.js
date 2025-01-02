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

// // Configuración de CORS
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN.split(','), // Soporta múltiples URLs
//     credentials: true,
//   })
// );


// Configuración de CORS
app.use(
  cors({
    origin: 'https://hidroxcajaherramientas.netlify.app', // Dominio permitido
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
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Exportar ensureAuthenticated solo si es necesario en otros módulos
module.exports = { app, ensureAuthenticated };
