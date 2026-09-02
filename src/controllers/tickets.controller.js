import ticketsService from "../services/tickets.service.js";

export const createTicket = async (req, res, next) => {
  try {
    // req.user lo dejó currentAuth (id, email, role del JWT)
    const { eid } = req.params;
    const { quantity } = req.body;

    const ticket = await ticketsService.createTicket(eid, req.user.id, req.user.email, quantity);
    res.status(201).json({ status: "success", payload: ticket });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getMyTickets(req.user.id);
    res.json({ status: "success", payload: tickets });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getEventTickets(req.params.eid, req.user);
    res.json({ status: "success", payload: tickets });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.cancelTicket(req.params.tid, req.user);
    res.json({ status: "success", payload: ticket });
  } catch (error) {
    next(error);
  }
};
