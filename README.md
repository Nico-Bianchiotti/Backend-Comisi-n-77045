# Plataforma de Eventos e Inscripciones

## Descripción

API REST para gestionar eventos e inscripciones. Proyecto de Backend II — arquitectura en capas (routes, controllers, services, repositories, dao, models, middlewares, utils).

## Temática

Plataforma de Eventos e Inscripciones: gestión de eventos, registro seguro de usuarios y autenticación con JWT vía cookie HttpOnly. En próximas entregas: Passport, roles y autorización por permisos, inscripciones y control de cupos.

## Tecnologías

- Node.js
- Express 5
- Mongoose (MongoDB)
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en base a `.env.example`:

```
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_a_mongodb
JWT_SECRET=tu_secreto_para_jwt
JWT_EXPIRES_IN=1h
```

`.env` **no** se sube al repositorio (está en `.gitignore`).

## Ejecutar

```bash
npm run dev
```

## Estructura de carpetas

```
src/
├── app.js                        # configura Express
├── server.js                     # levanta el servidor y conecta la DB
├── config/
│   └── db.js                     # conexión a MongoDB
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── services/
│   ├── events.service.js
│   └── sessions.service.js       # validación, normalización, hash
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js               # acceso directo a los modelos de Mongoose
├── models/
│   ├── Event.js
│   └── User.js                    # first_name, last_name, email, password, role
├── middlewares/
│   ├── error.middleware.js        # manejo global de errores y 404
│   └── auth.middleware.js         # verifica el JWT de la cookie y setea req.user
└── utils/
    ├── hash.js                    # helper de bcrypt reutilizable
    └── jwt.js                     # firma y verificación de JWT
```

## Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/health | Estado del servidor |
| GET | /api/events | Lista todos los eventos |
| GET | /api/events/:id | Obtiene un evento por id |
| POST | /api/events | Crea un evento |
| POST | /api/sessions/register | Registra un usuario de forma segura |
| POST | /api/sessions/login | Login: valida credenciales y setea cookie `currentUser` (JWT) |
| GET | /api/sessions/current | Devuelve el usuario autenticado a partir de la cookie (protegida) |
| POST | /api/sessions/logout | Elimina la cookie `currentUser` |

## Registro de usuarios — `POST /api/sessions/register`

### Campos que espera (body JSON)

| Campo | Tipo | Obligatorio | Detalle |
|---|---|---|---|
| `first_name` | string | Sí | — |
| `last_name` | string | Sí | — |
| `email` | string | Sí | Formato válido, se normaliza a minúsculas y sin espacios |
| `password` | string | Sí | Mínimo 8 caracteres |

El campo `role` **no se acepta desde el body**: siempre se asigna `"user"` por defecto a nivel de modelo. Los valores posibles (`user`, `organizer`, `admin`) solo se podrán asignar desde una lógica administrativa en entregas futuras.

### Cómo probarlo

Con `curl`:

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "Ana@Mail.com ",
    "password": "Secreta123"
  }'
```

O con Postman/Thunder Client: `POST http://localhost:8080/api/sessions/register`, body raw JSON con los mismos campos.

### Respuesta 201 (registro exitoso)

Email normalizado, **sin** el campo `password`:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

### Respuesta 400 (campos faltantes)

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios: first_name, last_name, email, password"
}
```

### Respuesta 400 (email con formato inválido)

```json
{
  "status": "error",
  "message": "El formato del email no es válido"
}
```

### Respuesta 400 (contraseña muy corta)

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

### Respuesta 409 (email ya registrado)

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

## Autenticación — Login, `/current` y Logout

### `POST /api/sessions/login`

**Request:**

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Busca al usuario por email y compara la contraseña contra el hash guardado con bcrypt. Si todo coincide, genera un JWT con payload `{ id, email, role }` (nunca `password`), firmado con `JWT_SECRET` y expiración configurable por `JWT_EXPIRES_IN`. El token se guarda en una cookie `currentUser`:

- `httpOnly: true` — no accesible desde JavaScript del navegador
- `sameSite: 'lax'`
- `maxAge: 3600000` (1 hora)
- `secure: true` solo cuando `NODE_ENV === 'production'`

**Respuesta 200 (login correcto, además setea la cookie):**

```json
{ "status": "success", "message": "Login correcto" }
```

**Respuesta 401 (email inexistente o contraseña incorrecta — mensaje siempre genérico):**

```json
{ "status": "error", "message": "Credenciales inválidas" }
```

No se distingue entre "el email no existe" y "la contraseña es incorrecta", para no darle pistas a un atacante sobre qué emails están registrados.

### `GET /api/sessions/current`

Ruta protegida por el middleware `auth`, que lee la cookie `currentUser`, verifica el JWT y arma `req.user` con el payload.

**Respuesta 200 (con cookie válida):**

```json
{
  "status": "success",
  "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" }
}
```

**Respuesta 401 (sin cookie, o token inválido/expirado):**

```json
{ "status": "error", "message": "No autenticado" }
```

### `POST /api/sessions/logout`

Elimina la cookie `currentUser`.

**Respuesta 200:**

```json
{ "status": "success", "message": "Sesión cerrada" }
```

### Cómo probarlo con curl

```bash
# 1. Login (guarda la cookie en cookies.txt)
curl -c cookies.txt -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"Secreta123"}'

# 2. Consultar el usuario autenticado usando la cookie guardada
curl -b cookies.txt http://localhost:8080/api/sessions/current

# 3. Logout
curl -b cookies.txt -X POST http://localhost:8080/api/sessions/logout

# 4. /current vuelve a fallar porque la cookie ya no es válida
curl -b cookies.txt http://localhost:8080/api/sessions/current
```

En Postman/Thunder Client alcanza con tener "cookies" habilitado en el cliente: después del login, la cookie viaja sola en las siguientes requests al mismo host.

## Casos probados antes de la entrega

- [x] Registro exitoso
- [x] Campos faltantes
- [x] Email con formato inválido
- [x] Email ya registrado (mismo email, incluso con mayúsculas/espacios distintos, por la normalización)
- [x] La contraseña se guarda hasheada en MongoDB (verificado en Compass/Atlas: el campo `password` es un hash bcrypt, no texto plano)
- [x] La respuesta del endpoint nunca incluye el campo `password`
- [x] Registro exitoso → login → `/current` → logout → `/current` devuelve 401
- [x] Login con email inexistente
- [x] Login con contraseña incorrecta
- [x] `/current` sin cookie

## Evidencia de las pruebas

Capturas de cada caso probado con Postman y MongoDB Atlas:

| Caso | Captura |
|---|---|
| Registro exitoso (201) | ![Registro exitoso](docs/01-registro-exitoso.png) |
| Campos faltantes (400) | ![Campos faltantes](docs/02-campos-faltantes.png) |
| Email inválido (400) | ![Email inválido](docs/03-email-invalido.png) |
| Email duplicado (409) | ![Email duplicado](docs/04-email-duplicado.png) |
| Password hasheado en MongoDB | ![Password hasheado](docs/05-password-hasheado-mongodb.png) |
| Login exitoso, cookie `currentUser` seteada | ![Login exitoso](docs/06-login-exitoso.png) |
| `/current` con cookie válida (200) | ![Current autenticado](docs/07-current-200-con-cookie.png) |
| `/current` después de logout (401) | ![Current tras logout](docs/08-current-401-despues-logout.png) |
| Login con email inexistente (401) | ![Login email inexistente](docs/09-login-email-inexistente.png) |
| Login con contraseña incorrecta (401) | ![Login password incorrecta](docs/10-login-password-incorrecta.png) |
| Logout (200) | ![Logout](docs/11-logout.png) |
| `/current` sin cookie (401) | ![Current sin cookie](docs/12-current-401-sin-cookie.png) |
| Confirmación: sin cookies guardadas en el cliente | ![Panel de cookies vacío](docs/13-current-sin-cookies-panel.png) |

## Estado actual

CRUD de eventos, registro seguro de usuarios y autenticación completa (login con JWT en cookie HttpOnly, `/current`, logout) funcionando de punta a punta. Passport, autorización por roles, inscripciones y control de cupos quedan para las próximas entregas.
