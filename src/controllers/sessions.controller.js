import sessionsService from "../services/sessions.service.js";

const COOKIE_NAME = "currentUser";
const COOKIE_MAX_AGE = 3600000; // 1 hora, en ms

export const register = async (req, res, next) => {
  try {
    const user = await sessionsService.register(req.body);
    res.status(201).json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { token } = await sessionsService.login(req.body);

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
    // req.user lo setea el middleware "auth" a partir del JWT verificado
    const { id, email, role } = req.user;
    res.json({ status: "success", payload: { id, email, role } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie(COOKIE_NAME);
    res.json({ status: "success", message: "Sesión cerrada" });
  } catch (error) {
    next(error);
  }
};
