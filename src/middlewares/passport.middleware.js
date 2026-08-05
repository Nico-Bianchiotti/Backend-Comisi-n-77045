import passport from "passport";

/**
 * Envuelve passport.authenticate("register", ...) para poder devolver
 * el status y mensaje específicos que arma la estrategia (400 o 409),
 * en vez del 401 genérico que da Passport por defecto.
 */
export const registerAuth = (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const error = new Error(info?.message || "Error de registro");
      error.status = info?.status || 400;
      return next(error);
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Igual que registerAuth, pero para login: siempre 401 con mensaje genérico.
 */
export const loginAuth = (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const error = new Error(info?.message || "Credenciales inválidas");
      error.status = info?.status || 401;
      return next(error);
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware para rutas protegidas: usa la estrategia "current" (JWT en cookie).
 * Sin cookie, o con token inválido/expirado, responde 401 "No autenticado".
 */
export const currentAuth = (req, res, next) => {
  passport.authenticate("current", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      const error = new Error("No autenticado");
      error.status = 401;
      return next(error);
    }
    req.user = user;
    next();
  })(req, res, next);
};
