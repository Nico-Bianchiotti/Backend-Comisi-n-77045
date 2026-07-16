import { Router } from "express";

import { login } from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", login);

export default router;