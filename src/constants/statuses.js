// Constantes de estados, separadas de los modelos para que cualquier capa
// (service, dto) pueda importarlas sin tener que importar un modelo de Mongoose.
export const EVENT_STATUSES = ["draft", "published", "cancelled", "finished"];
export const TICKET_STATUSES = ["confirmed", "pending", "cancelled"];
