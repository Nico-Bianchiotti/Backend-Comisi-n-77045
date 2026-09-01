import usersRepository from "../repositories/users.repository.js";

export class UsersService {
  async getAll() {
    const users = await usersRepository.findAll();

    // Minimización de datos: nunca devolver el hash de la contraseña,
    // ni siquiera en una ruta administrativa.
    return users.map((user) => ({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    }));
  }
}

export default new UsersService();
