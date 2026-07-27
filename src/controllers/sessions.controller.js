import sessionsService from "../services/sessions.service.js";

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
    const result = await sessionsService.login(req.body);
    res.json({ status: "success", payload: result });
  } catch (error) {
    next(error);
  }
};
