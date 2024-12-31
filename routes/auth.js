const express = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const router = express.Router();

// Verificar que las variables de entorno necesarias estén configuradas
if (!process.env.GOOGLE_CLIENT_ID) throw new Error('Falta GOOGLE_CLIENT_ID en el archivo .env');
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error('Falta GOOGLE_CLIENT_SECRET en el archivo .env');
if (!process.env.GOOGLE_CALLBACK_URL) throw new Error('Falta GOOGLE_CALLBACK_URL en el archivo .env');

// Configuración dinámica de Google OAuth
const callbackURL =
  process.env.NODE_ENV === 'production'
    ? process.env.GOOGLE_CALLBACK_URL
    : 'http://localhost:5000/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('Usuario autenticado:', profile);
      return done(null, profile);
    }
  )
);

// Serialización y deserialización del usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Ruta para iniciar sesión con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google OAuth
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    if (req.headers['content-type'] === 'application/json') {
      return res.json({ message: 'Autenticación exitosa', user: req.user });
    }
    res.redirect('https://hidroxcajaherramientas.netlify.app/dashboard'); // Redirige al frontend
  }
);

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      if (req.headers['content-type'] === 'application/json') {
        return res.status(500).json({ error: 'Error al cerrar sesión.' });
      }
      return res.status(500).send('Error al cerrar sesión.');
    }
    if (req.headers['content-type'] === 'application/json') {
      return res.json({ message: 'Cierre de sesión exitoso' });
    }
    res.redirect('https://hidroxcajaherramientas.netlify.app/index');
  });
});

module.exports = router;
