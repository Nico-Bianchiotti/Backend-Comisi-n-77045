import eventService from "../services/event.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAll();
    res.json({ status: "success", payload: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getById(req.params.id);
    res.json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.create(req.body);
    res.status(201).json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};
