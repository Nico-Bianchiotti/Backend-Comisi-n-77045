// "dotenv/config" carga el .env como efecto secundario apenas se importa.
// Al ser el primer import del archivo, se evalúa antes que "./app.js",
// así que cuando passport.config.js lee process.env.JWT_SECRET, ya está seteado.
import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer();
