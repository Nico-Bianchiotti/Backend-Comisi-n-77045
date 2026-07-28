import jwt from "jsonwebtoken";

/**
 * Firma un JWT con el payload mínimo del usuario.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

/**
 * Verifica un JWT. Lanza si es inválido o expiró.
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, iat: number, exp: number }}
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
