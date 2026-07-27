import eventsRepository from "../repositories/events.repository.js";

export class EventsService {
  async getAll() {
    return eventsRepository.findAll();
  }

  async getById(id) {
    const event = await eventsRepository.findById(id);
    if (!event) {
      const error = new Error("Evento no encontrado");
      error.status = 404;
      throw error;
    }
    return event;
  }

  async create(data) {
    const { title, date, capacity } = data;

    if (!title || !date || !capacity) {
      const error = new Error("Faltan campos obligatorios: title, date, capacity");
      error.status = 400;
      throw error;
    }

    if (capacity <= 0) {
      const error = new Error("La capacidad debe ser mayor a 0");
      error.status = 400;
      throw error;
    }

    return eventsRepository.create({ title, date, capacity });
  }

  async update(id, data) {
    await this.getById(id);
    return eventsRepository.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    return eventsRepository.delete(id);
  }
}

export default new EventsService();
