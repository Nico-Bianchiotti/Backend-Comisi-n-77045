/**
 * DTO completo de un evento (para las respuestas de /events).
 */
export const toEventDTO = (event) => {
  if (!event) return null;

  return {
    id: event._id ?? event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    price: event.price,
    status: event.status,
    organizer: event.organizer,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
};

export const toEventListDTO = (events = []) => events.map(toEventDTO);

/**
 * Versión resumida del evento, para cuando viaja embebido dentro de otro
 * DTO (por ejemplo, el evento de un ticket vía populate). Filtra los datos
 * relacionados: aunque el populate de Mongoose ya limita los campos a nivel
 * de query, el DTO es la segunda barrera que garantiza que nunca se filtre
 * de más si en algún momento cambia la query.
 */
export const toEventSummaryDTO = (event) => {
  if (!event) return null;

  return {
    id: event._id ?? event.id,
    title: event.title,
    date: event.date,
    location: event.location,
  };
};
