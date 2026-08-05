import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import usersRepository from "../repositories/users.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Extrae el JWT desde la cookie "currentUser" en vez del header Authorization.
 * passport-jwt lo usa para saber de dónde sacar el token.
 */
const cookieExtractor = (req) => {
  return req?.cookies?.currentUser || null;
};

// ─── Estrategia "register" ───────────────────────────────────────────────
// Toda la validación, normalización, hash y chequeo de duplicados que antes
// vivía en sessions.service.js ahora vive acá, dentro de la estrategia.
passport.use(
  "register",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name } = req.body;

        if (!first_name || !last_name || !email || !password) {
          return done(null, false, {
            message: "Faltan campos obligatorios: first_name, last_name, email, password",
            status: 400,
          });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!EMAIL_REGEX.test(normalizedEmail)) {
          return done(null, false, { message: "El formato del email no es válido", status: 400 });
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
          return done(null, false, {
            message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
            status: 400,
          });
        }

        const existing = await usersRepository.findByEmail(normalizedEmail);
        if (existing) {
          return done(null, false, { message: "El email ya está registrado", status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        // El rol nunca llega del body: Mongoose aplica el default "user".
        const newUser = await usersRepository.create({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ─── Estrategia "login" ──────────────────────────────────────────────────
// Busca al usuario y compara la contraseña. Nunca revela cuál de las dos falló.
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        if (!email || !password) {
          return done(null, false, { message: "Credenciales inválidas", status: 401 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await usersRepository.findByEmail(normalizedEmail);

        if (!user) {
          return done(null, false, { message: "Credenciales inválidas", status: 401 });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Credenciales inválidas", status: 401 });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ─── Estrategia "current" ────────────────────────────────────────────────
// Lee el JWT desde la cookie, passport-jwt verifica la firma y expiración
// automáticamente contra JWT_SECRET antes de llamar a este callback.
passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // El payload del token ya es { id, email, role, iat, exp } -
        // no hace falta volver a golpear la base de datos acá.
        return done(null, payload);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Este archivo queda como el único lugar donde se registran estrategias.
// Para sumar Google/GitHub en el futuro, se agrega un passport.use(new GoogleStrategy(...))
// acá mismo, sin tocar app.js ni las rutas.

export default passport;
