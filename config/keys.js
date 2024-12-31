const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const dotenv = require('dotenv');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Asegúrate de que las variables necesarias están definidas
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.SESSION_SECRET) {
  throw new Error('Faltan variables de entorno. Asegúrate de que GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y SESSION_SECRET están configurados en el archivo .env.');
}

// Configuración de Passport con Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile); // Aquí puedes manejar el usuario como prefieras
    }
  )
);

// Serialización y deserialización del usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
