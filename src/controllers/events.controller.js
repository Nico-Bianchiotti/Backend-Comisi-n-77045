import eventsService from "../services/events.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const { data, page, limit, total, totalPages } = await eventsService.getAll(req.query);
    res.json({ status: "success", data, page, limit, total, totalPages });
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
    // req.user lo dejó currentAuth; el organizer siempre sale del token, nunca del body.
    const event = await eventsService.create(req.body, req.user.id);
    res.status(201).json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.update(req.params.id, req.body, req.user);
    res.json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const event = await eventsService.updateStatus(req.params.id, req.body.status, req.user);
    res.json({ status: "success", payload: event });
  } catch (error) {
    next(error);
  }
};
