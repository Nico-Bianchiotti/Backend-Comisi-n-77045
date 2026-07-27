import eventsDAO from "../dao/events.dao.js";

export class EventsRepository {
  async findAll() {
    return eventsDAO.getAll();
  }

  async findById(id) {
    return eventsDAO.getById(id);
  }

  async create(data) {
    return eventsDAO.create(data);
  }

  async update(id, data) {
    return eventsDAO.update(id, data);
  }

  async delete(id) {
    return eventsDAO.delete(id);
  }
}

export default new EventsRepository();
