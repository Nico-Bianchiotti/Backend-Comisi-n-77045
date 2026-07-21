import UserModel from "../models/User.js";

export class UserDAO {
  async getAll() {
    return UserModel.find();
  }

  async getByEmail(email) {
    return UserModel.findOne({ email });
  }

  async create(data) {
    return UserModel.create(data);
  }
}

export default new UserDAO();
