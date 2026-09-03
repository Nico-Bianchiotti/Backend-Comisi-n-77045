/**
 * DTO de usuario para respuestas de la API (registro, listado admin, etc).
 * Nunca incluye password, ni siquiera hasheada.
 */
export const toUserDTO = (user) => {
  if (!user) return null;

  return {
    id: user._id ?? user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
  };
};

export const toUserListDTO = (users = []) => users.map(toUserDTO);

/**
 * DTO para el usuario autenticado (payload del JWT, usado en /current).
 * El payload del token solo trae { id, email, role } - no hace falta más,
 * y nunca hay password en un JWT.
 */
export const toCurrentUserDTO = (payload) => {
  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
};
