import crypto from "crypto";

import ticketsRepository from "../repositories/tickets.repository.js";
import eventsService from "./events.service.js";
import { sendMail } from "../utils/mailer.js";

export class TicketsService {
  generateReservationCode() {
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `TCK-${Date.now()}-${random}`;
  }

  /**
   * Inscribe a un usuario a un evento, con todas las validaciones de negocio.
   * @param {string} eventId
   * @param {string} userId
   * @param {string} userEmail - para mandar el email de confirmación
   * @param {number} quantity
   */
  async createTicket(eventId, userId, userEmail, quantity) {
    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      const error = new Error("quantity debe ser un número entero mayor a 0");
      error.status = 400;
      throw error;
    }

    // getById ya lanza 404 si el evento no existe o el id tiene formato inválido
    const event = await eventsService.getById(eventId);

    // Solo se puede inscribir a eventos "published". Esto ya excluye
    // draft, cancelled y finished en un solo chequeo.
    if (event.status !== "published") {
      const error = new Error(
        `No se puede inscribir a un evento en estado "${event.status}". El evento debe estar publicado.`
      );
      error.status = 400;
      throw error;
    }

    // Un usuario no puede tener dos tickets activos para el mismo evento
    const existingTicket = await ticketsRepository.findActiveByUserAndEvent(userId, eventId);
    if (existingTicket) {
      const error = new Error("Ya tenés una inscripción activa para este evento");
      error.status = 409;
      throw error;
    }

    // Cupos: solo cuentan tickets activos (confirmed/pending); cancelled nunca ocupa cupo
    const occupied = await ticketsRepository.sumActiveQuantityByEvent(eventId);
    const available = event.capacity - occupied;

    if (qty > available) {
      const error = new Error(
        `No hay cupos suficientes para esta inscripción. Cupos disponibles: ${available}.`
      );
      error.status = 400;
      throw error;
    }

    const ticket = await ticketsRepository.create({
      user: userId,
      event: eventId,
      status: "confirmed",
      quantity: qty,
      reservationCode: this.generateReservationCode(),
    });

    // El email no debe bloquear ni romper la inscripción si falla el envío.
    try {
      await sendMail({
        to: userEmail,
        subject: `Inscripción confirmada: ${event.title}`,
        html: `
          <h2>¡Tu inscripción fue confirmada!</h2>
          <p><strong>Evento:</strong> ${event.title}</p>
          <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Lugar:</strong> ${event.location}</p>
          <p><strong>Cantidad:</strong> ${qty}</p>
          <p><strong>Código de reserva:</strong> ${ticket.reservationCode}</p>
        `,
      });
    } catch (mailError) {
      console.error("No se pudo enviar el email de confirmación:", mailError.message);
    }

    return ticket;
  }

  async getMyTickets(userId) {
    return ticketsRepository.findByUser(userId);
  }

  /**
   * Lista los tickets de un evento. Solo el organizer dueño del evento o admin.
   */
  async getEventTickets(eventId, user) {
    const event = await eventsService.getById(eventId);

    if (user.role !== "admin" && event.organizer.toString() !== user.id) {
      const error = new Error("No tenés permisos para ver los tickets de este evento");
      error.status = 403;
      throw error;
    }

    return ticketsRepository.findByEvent(eventId);
  }

  async cancelTicket(ticketId, user) {
    // El DAO ya devuelve null tanto si el formato de id es inválido como
    // si el ticket no existe; para el service, ambos casos son "no encontrado".
    const ticket = await ticketsRepository.findById(ticketId);

    if (!ticket) {
      const error = new Error("Ticket no encontrado");
      error.status = 404;
      throw error;
    }

    if (user.role !== "admin" && ticket.user.toString() !== user.id) {
      const error = new Error("No podés cancelar un ticket que no te pertenece");
      error.status = 403;
      throw error;
    }

    if (ticket.status === "cancelled") {
      const error = new Error("El ticket ya está cancelado");
      error.status = 400;
      throw error;
    }

    // No se elimina: se cambia el status. Esto libera el cupo automáticamente,
    // porque sumActiveQuantityByEvent ya no lo va a contar.
    return ticketsRepository.update(ticketId, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
  }
}

export default new TicketsService();
