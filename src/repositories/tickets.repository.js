import ticketsDAO from "../dao/tickets.dao.js";

export class TicketsRepository {
  async create(data) {
    return ticketsDAO.create(data);
  }

  async findById(id) {
    return ticketsDAO.getById(id);
  }

  async findActiveByUserAndEvent(userId, eventId) {
    return ticketsDAO.getActiveByUserAndEvent(userId, eventId);
  }

  async sumActiveQuantityByEvent(eventId) {
    return ticketsDAO.sumActiveQuantityByEvent(eventId);
  }

  async findByUser(userId) {
    return ticketsDAO.getByUser(userId);
  }

  async findByEvent(eventId) {
    return ticketsDAO.getByEvent(eventId);
  }

  async update(id, data) {
    return ticketsDAO.update(id, data);
  }
}

export default new TicketsRepository();
