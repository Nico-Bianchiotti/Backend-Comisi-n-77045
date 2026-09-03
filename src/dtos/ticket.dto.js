import { toEventSummaryDTO } from "./event.dto.js";

/**
 * Detecta si `event` viene populado (es un documento con más campos que
 * solo el id) o si sigue siendo la referencia sin resolver (ObjectId/string).
 */
const isPopulatedEvent = (event) => {
  return Boolean(event) && typeof event === "object" && "title" in event;
};

export const toTicketDTO = (ticket) => {
  if (!ticket) return null;

  const eventField = ticket.event;

  return {
    id: ticket._id ?? ticket.id,
    user: ticket.user,
    event: isPopulatedEvent(eventField) ? toEventSummaryDTO(eventField) : eventField,
    status: ticket.status,
    quantity: ticket.quantity,
    reservationCode: ticket.reservationCode,
    cancelledAt: ticket.cancelledAt,
    createdAt: ticket.createdAt,
  };
};

export const toTicketListDTO = (tickets = []) => tickets.map(toTicketDTO);
