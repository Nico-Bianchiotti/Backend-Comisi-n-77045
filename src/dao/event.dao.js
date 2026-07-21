import EventModel from "../models/Event.js";

export class EventDAO {
  async getAll() {
    return EventModel.find();
  }

  async getById(id) {
    return EventModel.findById(id);
  }

  async create(data) {
    return EventModel.create(data);
  }

  async update(id, data) {
    return EventModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return EventModel.findByIdAndDelete(id);
  }
}

export default new EventDAO();
