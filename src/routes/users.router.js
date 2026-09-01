import { Router } from "express";

import { getUsers } from "../controllers/users.controller.js";
import { currentAuth } from "../middlewares/passport.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Ver todos los usuarios: ruta administrativa, solo admin.
router.get("/", currentAuth, authorize("admin"), getUsers);

export default router;
