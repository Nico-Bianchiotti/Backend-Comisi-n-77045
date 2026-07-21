import eventDAO from "../dao/event.dao.js";

export class EventRepository {
  async findAll() {
    return eventDAO.getAll();
  }

  async findById(id) {
    return eventDAO.getById(id);
  }

  async create(data) {
    return eventDAO.create(data);
  }

  async update(id, data) {
    return eventDAO.update(id, data);
  }

  async delete(id) {
    return eventDAO.delete(id);
  }
}

export default new EventRepository();
