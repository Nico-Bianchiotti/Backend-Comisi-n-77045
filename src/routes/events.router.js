import { Router } from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
} from "../controllers/events.controller.js";
import { currentAuth } from "../middlewares/passport.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Públicas: cualquiera puede consultar eventos, con o sin sesión
router.get("/", getEvents);
router.get("/:id", getEventById);

// Crear: solo organizer o admin
router.post("/", currentAuth, authorize("organizer", "admin"), createEvent);

// Modificar: dueño del evento (organizer) o admin — la propiedad se valida en el service
router.put("/:id", currentAuth, authorize("organizer", "admin"), updateEvent);

// Cambiar estado (incluye "cancelar"): mismo criterio de propiedad que PUT
router.patch("/:id/status", currentAuth, authorize("organizer", "admin"), updateEventStatus);

export default router;
