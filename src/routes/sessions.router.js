import { Router } from "express";

import { register, login, current, logout } from "../controllers/sessions.controller.js";
import { registerAuth, loginAuth, currentAuth } from "../middlewares/passport.middleware.js";

const router = Router();

router.post("/register", registerAuth, register);
router.post("/login", loginAuth, login);
router.get("/current", currentAuth, current);
router.post("/logout", logout);

export default router;
