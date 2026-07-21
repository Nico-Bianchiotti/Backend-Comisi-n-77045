import sessionService from "../services/session.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await sessionService.register(req.body);
    res.status(201).json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await sessionService.login(req.body);
    res.json({ status: "success", payload: result });
  } catch (error) {
    next(error);
  }
};
