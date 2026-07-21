import express from "express";

import eventsRouter from "./routes/events.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor activo",
  });
});

app.use("/api/events", eventsRouter);
app.use("/api/sessions", sessionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
