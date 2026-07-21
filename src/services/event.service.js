import eventRepository from "../repositories/event.repository.js";

export class EventService {
  async getAll() {
    return eventRepository.findAll();
  }

  async getById(id) {
    const event = await eventRepository.findById(id);
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

    return eventRepository.create({ title, date, capacity });
  }

  async update(id, data) {
    await this.getById(id); // valida que exista, si no lanza 404
    return eventRepository.update(id, data);
  }

  async delete(id) {
    await this.getById(id);
    return eventRepository.delete(id);
  }
}

export default new EventService();
