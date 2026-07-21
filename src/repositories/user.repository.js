import userDAO from "../dao/user.dao.js";

export class UserRepository {
  async findByEmail(email) {
    return userDAO.getByEmail(email);
  }

  async create(data) {
    return userDAO.create(data);
  }
}

export default new UserRepository();
