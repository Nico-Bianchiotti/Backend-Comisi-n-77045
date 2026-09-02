import { Router } from "express";

import { getMyTickets, cancelTicket } from "../controllers/tickets.controller.js";
import { currentAuth } from "../middlewares/passport.middleware.js";

const router = Router();

// Mis tickets: cualquier usuario autenticado, solo ve los propios
router.get("/my-tickets", currentAuth, getMyTickets);

// Cancelar: dueño del ticket o admin — se valida en el service
router.patch("/:tid/cancel", currentAuth, cancelTicket);

export default router;
