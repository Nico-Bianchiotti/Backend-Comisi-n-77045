import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";
import { EVENT_STATUSES } from "../models/Event.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export class EventsService {
  /**
   * Listado con filtros, paginación y ordenamiento.
   * query soporta: status, category, location, dateFrom, dateTo, page, limit, sort
   */
  async getAll(query = {}) {
    const { status, category, location, dateFrom, dateTo, page, limit, sort } = query;

    const filter = {};

    if (status) {
      if (!EVENT_STATUSES.includes(status)) {
        const error = new Error(`status inválido. Valores permitidos: ${EVENT_STATUSES.join(", ")}`);
        error.status = 400;
        throw error;
      }
      filter.status = status;
    }

    if (category) filter.category = category;
    if (location) filter.location = location;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(parseInt(page, 10) || DEFAULT_PAGE, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // sort=date → ascendente; sort=-date → descendente
    let sortOption = { date: 1 };
    if (sort) {
      const direction = sort.startsWith("-") ? -1 : 1;
      const field = sort.replace(/^-/, "");
      sortOption = { [field]: direction };
    }

    const { data, total } = await eventsRepository.findAll(filter, {
      skip,
      limit: limitNum,
      sort: sortOption,
    });

    return {
      data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    };
  }

  async getById(id) {
    // Si el id no tiene el formato válido de ObjectId, Mongoose tira un
    // CastError antes de llegar a la base. Lo atajamos acá para responder
    // 404 en vez de dejar que explote como 500.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Evento no encontrado");
      error.status = 404;
      throw error;
    }

    const event = await eventsRepository.findById(id);
    if (!event) {
      const error = new Error("Evento no encontrado");
      error.status = 404;
      throw error;
    }
    return event;
  }

  async create(data, organizerId) {
    const { title, description, category, date, location, capacity, price } = data;

    if (!title || !description || !category || !location) {
      const error = new Error(
        "Faltan campos obligatorios: title, description, category, location"
      );
      error.status = 400;
      throw error;
    }

    if (!date) {
      const error = new Error("El campo date es obligatorio");
      error.status = 400;
      throw error;
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      const error = new Error("El campo date no es una fecha válida");
      error.status = 400;
      throw error;
    }

    if (eventDate.getTime() < Date.now()) {
      const error = new Error("No se puede crear un evento con fecha pasada");
      error.status = 400;
      throw error;
    }

    if (capacity === undefined || capacity <= 0) {
      const error = new Error("capacity debe ser mayor a 0");
      error.status = 400;
      throw error;
    }

    const eventPrice = price === undefined ? 0 : price;
    if (eventPrice < 0) {
      const error = new Error("price no puede ser negativo");
      error.status = 400;
      throw error;
    }

    // organizer siempre viene del usuario autenticado, nunca del body.
    return eventsRepository.create({
      title,
      description,
      category,
      date: eventDate,
      location,
      capacity,
      price: eventPrice,
      organizer: organizerId,
    });
  }

  /**
   * admin siempre puede; organizer solo si es el dueño del evento.
   */
  assertOwnership(event, user) {
    if (user.role === "admin") return;

    if (event.organizer.toString() !== user.id) {
      const error = new Error("No podés modificar un evento que no te pertenece");
      error.status = 403;
      throw error;
    }
  }

  assertNotCancelled(event) {
    if (event.status === "cancelled") {
      const error = new Error("No se puede modificar un evento cancelado");
      error.status = 400;
      throw error;
    }
  }

  async update(id, data, user) {
    const event = await this.getById(id);
    this.assertOwnership(event, user);
    this.assertNotCancelled(event);

    // organizer y status no se tocan por este endpoint: organizer nunca cambia
    // de dueño así, y para status existe PATCH /:id/status con sus propias reglas.
    const { organizer, status, ...allowedUpdates } = data;

    if (allowedUpdates.capacity !== undefined && allowedUpdates.capacity <= 0) {
      const error = new Error("capacity debe ser mayor a 0");
      error.status = 400;
      throw error;
    }

    if (allowedUpdates.price !== undefined && allowedUpdates.price < 0) {
      const error = new Error("price no puede ser negativo");
      error.status = 400;
      throw error;
    }

    if (allowedUpdates.date !== undefined) {
      const newDate = new Date(allowedUpdates.date);
      if (isNaN(newDate.getTime())) {
        const error = new Error("El campo date no es una fecha válida");
        error.status = 400;
        throw error;
      }
      allowedUpdates.date = newDate;
    }

    return eventsRepository.update(id, allowedUpdates);
  }

  /**
   * Cambia el status del evento (draft/published/cancelled/finished).
   * "Cancelar" un evento es simplemente pasar status a "cancelled" - nunca se borra.
   */
  async updateStatus(id, newStatus, user) {
    if (!EVENT_STATUSES.includes(newStatus)) {
      const error = new Error(`status inválido. Valores permitidos: ${EVENT_STATUSES.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const event = await this.getById(id);
    this.assertOwnership(event, user);
    this.assertNotCancelled(event);

    if (newStatus === "published" && event.status === "finished") {
      const error = new Error("No se puede publicar un evento ya finalizado");
      error.status = 400;
      throw error;
    }

    return eventsRepository.update(id, { status: newStatus });
  }
}

export default new EventsService();
