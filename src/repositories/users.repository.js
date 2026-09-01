import usersDAO from "../dao/users.dao.js";

export class UsersRepository {
  async findAll() {
    return usersDAO.getAll();
  }

  async findByEmail(email) {
    return usersDAO.getByEmail(email);
  }

  async create(data) {
    return usersDAO.create(data);
  }
}

export default new UsersRepository();
