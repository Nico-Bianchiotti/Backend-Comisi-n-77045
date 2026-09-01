import usersService from "../services/users.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    res.json({ status: "success", payload: users });
  } catch (error) {
    next(error);
  }
};
