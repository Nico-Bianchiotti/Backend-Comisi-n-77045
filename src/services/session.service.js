import userRepository from "../repositories/user.repository.js";

export class SessionService {
  // TODO (próxima entrega): hashear password con bcrypt y firmar JWT con process.env.JWT_SECRET
  async register(data) {
    const { name, email, password } = data;

    if (!name || !email || !password) {
      const error = new Error("Faltan campos obligatorios: name, email, password");
      error.status = 400;
      throw error;
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const error = new Error("El email ya está registrado");
      error.status = 409;
      throw error;
    }

    return userRepository.create({ name, email, password });
  }

  async login(data) {
    // Estructura preparada para la próxima entrega (JWT, hashing, etc.)
    return { message: "Ruta de sesiones lista, autenticación pendiente de implementar" };
  }
}

export default new SessionService();
