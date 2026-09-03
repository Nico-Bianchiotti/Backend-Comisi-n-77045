import usersService from "../services/users.service.js";
import { toUserListDTO } from "../dtos/user.dto.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAll();
    res.json({ status: "success", payload: toUserListDTO(users) });
  } catch (error) {
    next(error);
  }
};
