import eventsDAO from "../dao/events.dao.js";

export class EventsRepository {
  async findAll(filter, options) {
    return eventsDAO.getAll(filter, options);
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
}

export default new EventsRepository();
