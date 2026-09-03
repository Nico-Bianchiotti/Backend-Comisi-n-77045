import mongoose from "mongoose";
import TicketModel from "../models/Ticket.js";

// Estados que "ocupan" cupo: cancelled nunca cuenta.
const ACTIVE_STATUSES = ["confirmed", "pending"];

export class TicketsDAO {
  async create(data) {
    return TicketModel.create(data);
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return TicketModel.findById(id);
  }

  async getActiveByUserAndEvent(userId, eventId) {
    return TicketModel.findOne({
      user: userId,
      event: eventId,
      status: { $in: ACTIVE_STATUSES },
    });
  }

  /**
   * Suma la cantidad de lugares ocupados por tickets activos de un evento.
   * Los tickets cancelados nunca cuentan para el cupo.
   */
  async sumActiveQuantityByEvent(eventId) {
    const result = await TicketModel.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          status: { $in: ACTIVE_STATUSES },
        },
      },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    return result[0]?.total || 0;
  }

  async getByUser(userId) {
    return TicketModel.find({ user: userId })
      .populate("event", "title date location")
      .sort({ createdAt: -1 });
  }

  async getByEvent(eventId) {
    return TicketModel.find({ event: eventId }).sort({ createdAt: -1 });
  }

  async update(id, data) {
    return TicketModel.findByIdAndUpdate(id, data, { new: true });
  }
}

export default new TicketsDAO();
