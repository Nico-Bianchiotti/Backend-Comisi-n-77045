import usersRepository from "../repositories/users.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export class SessionsService {
  async register(data) {
    // Solo se toman estos 4 campos del body. El rol NUNCA se lee de acá,
    // así se evita que alguien se registre como "admin" manipulando el JSON.
    const { first_name, last_name, email, password } = data;

    // 1. Validar presencia de campos obligatorios
    if (!first_name || !last_name || !email || !password) {
      const error = new Error("Faltan campos obligatorios: first_name, last_name, email, password");
      error.status = 400;
      throw error;
    }

    // 2. Normalizar email (trim + lowercase) ANTES de validar formato y buscar duplicados
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validar formato de email
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      const error = new Error("El formato del email no es válido");
      error.status = 400;
      throw error;
    }

    // 4. Validar longitud mínima de contraseña
    if (password.length < MIN_PASSWORD_LENGTH) {
      const error = new Error(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
      error.status = 400;
      throw error;
    }

    // 5. Rechazar si el email ya existe
    const existing = await usersRepository.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error("El email ya está registrado");
      error.status = 409;
      throw error;
    }

    // 6. Hashear la contraseña (nunca se guarda en texto plano)
    const hashedPassword = await hashPassword(password);

    // 7. Persistir. El rol no llega del body: Mongoose aplica el default "user".
    const newUser = await usersRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 8. Minimización de datos: la respuesta se arma campo por campo,
    // así es imposible filtrar el hash aunque el modelo cambie en el futuro.
    return {
      id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role,
    };
  }

  async login(data) {
    const { email, password } = data;

    // 1. Validar presencia de campos
    if (!email || !password) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Buscar usuario por email
    const user = await usersRepository.findByEmail(normalizedEmail);

    // 3. Mensaje genérico: nunca revelar si falló el email o la contraseña
    if (!user) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      throw error;
    }

    // 4. Comparar contraseña con el hash guardado
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      throw error;
    }

    // 5. Generar JWT con payload mínimo (nunca la contraseña)
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return { token };
  }
}

export default new SessionsService();
