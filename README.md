# Plataforma de Eventos e Inscripciones

## Descripción

API REST para gestionar eventos e inscripciones. Proyecto de Backend II — arquitectura en capas (routes, controllers, services, repositories, dao, models, middlewares, utils).

## Temática

Plataforma de Eventos e Inscripciones: gestión completa de eventos (creación, edición, cambio de estado, listado con filtros/paginación/orden), registro seguro de usuarios, autenticación con JWT vía cookie HttpOnly (centralizada con Passport.js) y autorización por roles. En próximas entregas: inscripciones y control de cupos.

## Tecnologías

- Node.js
- Express 5
- Mongoose (MongoDB)
- bcrypt
- jsonwebtoken
- passport, passport-local, passport-jwt
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
├── app.js                        # configura Express + passport.initialize()
├── server.js                     # levanta el servidor y conecta la DB
├── config/
│   ├── db.js                     # conexión a MongoDB
│   └── passport.config.js        # estrategias "register", "login" y "current"
├── routes/
│   ├── events.router.js          # aplica currentAuth + authorize en rutas sensibles
│   ├── sessions.router.js        # delega en passport.authenticate(...)
│   └── users.router.js           # ruta administrativa (solo admin)
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js    # arma la respuesta; el login genera el JWT y setea la cookie
│   └── users.controller.js
├── services/
│   ├── events.service.js         # valida propiedad del evento (organizer vs admin)
│   └── users.service.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js               # acceso directo a los modelos de Mongoose
├── models/
│   ├── Event.js                   # title, description, category, date, location, capacity, price, status, organizer (ref User)
│   └── User.js                    # first_name, last_name, email, password, role
├── middlewares/
│   ├── error.middleware.js        # manejo global de errores y 404
│   ├── passport.middleware.js     # wrappers de passport.authenticate — autenticación (401)
│   └── authorize.middleware.js    # autorización por roles — recibe roles permitidos (403)
└── utils/
    ├── hash.js                    # helper de bcrypt reutilizable
    └── jwt.js                     # firma del JWT (usada por el controller de login)
```

## Rutas disponibles

| Método | Ruta | Descripción | Requiere |
|---|---|---|---|
| GET | /api/health | Estado del servidor | — |
| GET | /api/events | Lista eventos con filtros, paginación y orden | — (público) |
| GET | /api/events/:id | Obtiene un evento por id | — (público) |
| POST | /api/events | Crea un evento | Sesión + rol `organizer` o `admin` |
| PUT | /api/events/:id | Modifica un evento (no permite cambiar `status` ni `organizer`) | Sesión + dueño del evento o `admin` |
| PATCH | /api/events/:id/status | Cambia el estado del evento (incluye "cancelar") | Sesión + dueño del evento o `admin` |
| POST | /api/sessions/register | Registra un usuario de forma segura | — |
| POST | /api/sessions/login | Login: valida credenciales y setea cookie `currentUser` (JWT) | — |
| GET | /api/sessions/current | Devuelve el usuario autenticado a partir de la cookie | Sesión |
| POST | /api/sessions/logout | Elimina la cookie `currentUser` | — |
| GET | /api/users | Lista todos los usuarios (sin password) | Sesión + rol `admin` |

## Autenticación centralizada con Passport.js

A partir de esta entrega, la autenticación pasa por **estrategias de Passport** centralizadas en `src/config/passport.config.js`. El contrato externo de la API (rutas, requests, responses) **no cambió** respecto de la entrega anterior — lo que cambió es la organización interna.

| Estrategia | Tipo | Qué hace |
|---|---|---|
| `register` | `passport-local` (con `passReqToCallback`) | Valida campos, normaliza el email, hashea la contraseña con bcrypt, chequea duplicados y crea el usuario |
| `login` | `passport-local` | Busca el usuario por email y compara la contraseña con bcrypt. Nunca revela cuál de los dos falló |
| `current` | `passport-jwt` | Extrae el JWT de la cookie `currentUser` (en vez del header `Authorization`) y verifica su firma/expiración contra `JWT_SECRET` |

**División de responsabilidades:**
- Las **estrategias** deciden si las credenciales son válidas (autenticación).
- El **controller** decide qué hacer después: en `login`, es el controller (no la estrategia) el que genera el JWT con `generateToken()` y lo guarda en la cookie `currentUser` (`httpOnly: true`).
- `src/middlewares/passport.middleware.js` envuelve `passport.authenticate(...)` para poder devolver el status y mensaje específico de cada caso (400, 409, 401) en vez del 401 genérico que da Passport por defecto.
- `POST /api/sessions/logout` no pasa por Passport: solo limpia la cookie.

**Preparado para más providers:** `passport.config.js` es el único lugar donde se registran estrategias (`passport.use(...)`). Para sumar login con Google o GitHub en el futuro, alcanza con agregar una nueva estrategia ahí mismo — no hace falta tocar `app.js` ni las rutas.

## Entidad `Event`

### Campos del modelo

| Campo | Tipo | Obligatorio | Detalle |
|---|---|---|---|
| `title` | string | Sí | — |
| `description` | string | Sí | — |
| `category` | string | Sí | — |
| `date` | Date | Sí | No puede ser una fecha pasada al crear el evento |
| `location` | string | Sí | — |
| `capacity` | number | Sí | Debe ser mayor a 0 |
| `price` | number | No (default `0`) | No puede ser negativo |
| `status` | string | No (default `draft`) | Uno de: `draft`, `published`, `cancelled`, `finished` |
| `organizer` | ObjectId (ref `User`) | Se asigna solo | **Nunca** viene del body: siempre es `req.user.id`, el usuario autenticado que crea el evento |

### `POST /api/events` — crear evento

Solo `organizer` o `admin`. El `organizer` del evento se toma del JWT, nunca del body — si el body incluye un campo `organizer`, se ignora.

**Validaciones (en `events.service.js`, no en la ruta ni el controller):**
- Todos los campos obligatorios presentes
- `date` no puede ser una fecha pasada
- `capacity` debe ser mayor a 0
- `price` no puede ser negativo

**Respuesta 201:**
```json
{
  "status": "success",
  "payload": {
    "id": "6690...",
    "title": "Congreso Tech 2026",
    "description": "...",
    "category": "workshop",
    "date": "2026-11-15T00:00:00.000Z",
    "location": "Buenos Aires",
    "capacity": 100,
    "price": 500,
    "status": "draft",
    "organizer": "665f2a..."
  }
}
```

### `PUT /api/events/:id` — modificar evento

Requiere ser el dueño (`organizer`) del evento o `admin`. No permite cambiar `organizer` ni `status` desde este endpoint (ese campo se ignora si viene en el body; para cambiar el estado existe el endpoint dedicado). Un evento con `status: "cancelled"` no puede modificarse por acá.

### `PATCH /api/events/:id/status` — cambiar estado (incluye "cancelar")

Mismo criterio de propiedad que `PUT`. **Cancelar un evento es cambiar su `status` a `"cancelled"` — nunca se elimina físicamente de la base.**

**Reglas:**
- Un evento ya `cancelled` no puede volver a cambiar de estado.
- No se puede pasar a `published` un evento que ya está `finished`.

**Request:**
```json
{ "status": "cancelled" }
```

### `GET /api/events` — listado con filtros, paginación y orden

Ruta pública. Query params soportados:

| Param | Ejemplo | Descripción |
|---|---|---|
| `status` | `?status=published` | Filtra por estado exacto |
| `category` | `?category=workshop` | Filtra por categoría exacta |
| `location` | `?location=Buenos%20Aires` | Filtra por ubicación exacta |
| `dateFrom` | `?dateFrom=2026-01-01` | Eventos desde esta fecha (inclusive) |
| `dateTo` | `?dateTo=2026-12-31` | Eventos hasta esta fecha (inclusive) |
| `page` | `?page=2` | Página del listado (default `1`) |
| `limit` | `?limit=5` | Resultados por página (default `10`, máximo `100`) |
| `sort` | `?sort=date` / `?sort=-date` | Orden ascendente/descendente por campo (default `date` ascendente) |

Ejemplo combinado: `GET /api/events?status=published&category=workshop&page=2&limit=5`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [ { "id": "...", "title": "...", "...": "..." } ],
  "page": 2,
  "limit": 5,
  "total": 23,
  "totalPages": 5
}
```

### `GET /api/events/:id` — detalle

Ruta pública. Responde **404** `"Evento no encontrado"` si el `id` no existe.

## Roles y autorización

### Roles disponibles

El campo `role` del modelo `User` acepta `user`, `organizer` o `admin`, con `user` como valor por defecto. El registro público (`POST /api/sessions/register`) **nunca** permite asignar `organizer` ni `admin` desde el body — ese campo se ignora y Mongoose siempre aplica `"user"`.

### Matriz de permisos

| Acción | `user` | `organizer` | `admin` |
|---|---|---|---|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Cambiar estado de eventos propios (incluye cancelar) | ❌ | ✅ | ✅ |
| Modificar/cancelar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

### Middlewares (reutilizables, separados de las rutas)

- **`currentAuth`** (`middlewares/passport.middleware.js`) — middleware de **autenticación**: lee el JWT desde la cookie `currentUser`, lo valida vía la estrategia `current` de Passport y puebla `req.user`. Si no hay sesión válida, responde **401**.
- **`authorize(...roles)`** (`middlewares/authorize.middleware.js`) — middleware de **autorización**: recibe los roles permitidos como parámetro y compara contra `req.user.role`. Si el rol no está en la lista, responde **403**. Se usa así en las rutas:

  ```js
  router.post("/", currentAuth, authorize("organizer", "admin"), createEvent);
  router.get("/", currentAuth, authorize("admin"), getUsers);
  ```

  Ningún rol queda hardcodeado dentro de una ruta o un controller — siempre se pasa como parámetro al middleware.

### 401 vs 403 — la diferencia importa

| Código | Cuándo se usa | Ejemplo |
|---|---|---|
| **401 Unauthorized** | No hay sesión válida (sin cookie, cookie inválida o expirada) | `GET /api/sessions/current` sin cookie |
| **403 Forbidden** | Hay sesión válida, pero el rol no tiene permiso para esa acción | `POST /api/events` con un usuario de rol `user` |

Nunca se usa 401 y 403 de forma intercambiable, ni se devuelve un 500 genérico para estos casos — cada middleware lanza el status y mensaje que le corresponde, y el `error.middleware.js` los propaga tal cual.

### Propiedad de recursos (eventos)

Cada evento se crea con un campo `organizer` que guarda el `id` del usuario autenticado que lo creó (`req.user.id`, tomado del JWT). En `PUT /api/events/:id` y `PATCH /api/events/:id/status`:

- Si `req.user.role === "admin"` → puede modificar/cambiar el estado de cualquier evento.
- Si `req.user.role === "organizer"` → el service compara `event.organizer` contra `req.user.id`; si no coincide, responde **403** `"No podés modificar un evento que no te pertenece"`.
- Un evento con `status: "cancelled"` no admite más modificaciones, sin importar el rol.

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
- [x] `POST /api/events` con rol `user` → 403
- [x] `POST /api/events` con rol `organizer` → éxito (201)
- [x] Ruta administrativa (`GET /api/users`) con rol `organizer` → 403
- [x] Ruta administrativa (`GET /api/users`) con rol `admin` → éxito (200)
- [x] Cualquier ruta privada sin cookie → 401
- [x] `organizer` intentando modificar un evento ajeno → 403
- [x] Crear evento con rol `user` → 403
- [x] Crear evento con fecha pasada → error de validación (400)
- [x] Crear evento con `capacity: 0` → error de validación (400)
- [x] `organizer` modifica evento propio → éxito
- [x] `admin` modifica evento de otro organizador → éxito
- [x] Cambiar estado de un evento cancelado → error (400)
- [x] Listar con filtros: `?status=published&category=workshop&page=2&limit=5`
- [x] Consultar evento inexistente → 404

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
| Login con `user1` (rol `user`) | ![Login user1](docs/14-login-user1.png) |
| `POST /events` con rol `user` → 403 | ![Events user 403](docs/15-events-user-403.png) |
| Login con `organizer1` (rol `organizer`) | ![Login organizer1](docs/16-login-organizer1.png) |
| `POST /events` con rol `organizer` → 201 | ![Events organizer 201](docs/17-events-organizer-201.png) |
| `GET /users` con rol `organizer` → 403 | ![Users organizer 403](docs/18-users-organizer-403.png) |
| `GET /users` con rol `admin` → 200 | ![Users admin 200](docs/19-users-admin-200.png) |
| Ruta privada sin cookie → 401 | ![Sin cookie 401](docs/20-privada-sin-cookie-401.png) |
| `organizer` modificando evento ajeno → 403 | ![Evento ajeno 403](docs/21-organizer-evento-ajeno-403.png) |
| Crear evento válido (201) | ![Crear evento](docs/22-events-create-nuevo-201.png) |
| `organizer` modifica su propio evento → 200 | ![Organizer modifica propio](docs/23-events-organizer-propio-200.png) |
| `admin` modifica evento de otro organizador → 200 | ![Admin modifica ajeno](docs/24-events-admin-modifica-200.png) |
| Cancelar evento (`PATCH /status`) → 200 | ![Cancelar evento](docs/25-events-status-cancelled-200.png) |
| Cambiar estado de evento ya cancelado → 400 | ![Estado cancelado error](docs/26-events-status-cancelado-error-400.png) |
| Listado con filtros y paginación → 200 | ![Filtros y paginación](docs/27-events-filtros-200.png) |
| Consultar evento inexistente → 404 | ![Evento inexistente](docs/28-events-inexistente-404.png) |
| Crear evento con `capacity: 0` → 400 | ![Capacity inválida](docs/29-events-capacity0-400.png) |
| Crear evento con fecha pasada → 400 | ![Fecha pasada](docs/30-events-fecha-pasada-400.png) |

## Estado actual

CRUD completo de eventos (crear, listar con filtros/paginación/orden, consultar, modificar, cambiar estado/cancelar) con reglas de negocio en la capa de servicios, registro seguro de usuarios y autenticación completa (login con JWT en cookie HttpOnly, `/current`, logout) centralizada mediante Passport.js, más autorización por roles y validación de propiedad de recursos. Inscripciones y control de cupos quedan para las próximas entregas.
