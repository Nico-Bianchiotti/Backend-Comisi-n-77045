import express from "express";

import eventsRouter from "./routes/events.router.js";
import sessionsRouter from "./routes/sessions.router.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor funcionando"
  });
});

app.use("/api/events", eventsRouter);

app.use("/api/sessions", sessionsRouter);

export default app;