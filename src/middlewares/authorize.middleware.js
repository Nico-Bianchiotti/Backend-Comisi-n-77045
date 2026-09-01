/**
 * Middleware de autorización reutilizable: recibe los roles permitidos
 * y compara contra req.user.role (que ya dejó el middleware de autenticación).
 *
 * Uso: router.post("/", currentAuth, authorize("organizer", "admin"), createEvent)
 *
 * Diferencia clave con la autenticación:
 * - Si no hay sesión válida → responsabilidad de currentAuth, responde 401.
 * - Si hay sesión pero el rol no alcanza → responsabilidad de este middleware, responde 403.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // No debería pasar si currentAuth corre antes, pero cubre el caso
      // de que alguien use authorize() sin autenticación previa.
      const error = new Error("No autenticado");
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("No tenés permisos para realizar esta acción");
      error.status = 403;
      return next(error);
    }

    next();
  };
};
