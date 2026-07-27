import eventsService from "../services/events.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getAll();
    res.json({ status: "success", payload: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getById(req.params.id);
    res.json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.create(req.body);
    res.status(201).json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};
