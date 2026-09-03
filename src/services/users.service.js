import usersRepository from "../repositories/users.repository.js";

export class UsersService {
  async getAll() {
    return usersRepository.findAll();
  }
}

export default new UsersService();
