import { generateToken } from "../utils/jwt.js";
import { toUserDTO, toCurrentUserDTO } from "../dtos/user.dto.js";

const COOKIE_NAME = "currentUser";
const COOKIE_MAX_AGE = 3600000; // 1 hora, en ms

export const register = async (req, res, next) => {
  try {
    // req.user lo dejó la estrategia "register" (ya validado y persistido)
    const user = req.user;
    res.status(201).json({ status: "success", payload: toUserDTO(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // req.user lo dejó la estrategia "login" (ya autenticado contra bcrypt)
    const user = req.user;

    // El JWT lo genera el controller, no la estrategia.
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ status: "success", message: "Login correcto" });
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    // req.user lo dejó la estrategia "current" (payload del JWT ya verificado)
    res.json({ status: "success", payload: toCurrentUserDTO(req.user) });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // El logout no pasa por Passport, solo limpia la cookie.
    res.clearCookie(COOKIE_NAME);
    res.json({ status: "success", message: "Sesión cerrada" });
  } catch (error) {
    next(error);
  }
};
