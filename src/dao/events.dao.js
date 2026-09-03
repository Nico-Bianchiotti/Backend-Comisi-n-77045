import mongoose from "mongoose";
import EventModel from "../models/Event.js";

export class EventsDAO {
  /**
   * @param {object} filter - filtro de Mongoose (status, category, location, rango de fechas)
   * @param {{ skip: number, limit: number, sort: object }} options
   */
  async getAll(filter, options) {
    const { skip, limit, sort } = options;

    const [data, total] = await Promise.all([
      EventModel.find(filter).sort(sort).skip(skip).limit(limit),
      EventModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async getById(id) {
    // Si el id no tiene formato válido de ObjectId, ni siquiera se consulta:
    // se trata como "no encontrado" en vez de dejar que Mongoose tire un CastError.
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return EventModel.findById(id);
  }

  async create(data) {
    return EventModel.create(data);
  }

  async update(id, data) {
    return EventModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}

export default new EventsDAO();
