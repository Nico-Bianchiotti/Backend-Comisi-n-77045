# Plataforma de Eventos e Inscripciones

## Descripción

API REST para gestionar eventos e inscripciones. Proyecto de Backend II — arquitectura en capas (routes, controllers, services, repositories, dao, models, middlewares, utils).

## Temática

Plataforma de Eventos e Inscripciones: gestión de eventos y registro seguro de usuarios. En próximas entregas: login con JWT, cookies, ruta `current`, Passport, roles y autorización.

## Tecnologías

- Node.js
- Express 5
- Mongoose (MongoDB)
- bcrypt
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
│   └── error.middleware.js        # manejo global de errores y 404
└── utils/
    └── hash.js                    # helper de bcrypt reutilizable
```

## Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/health | Estado del servidor |
| GET | /api/events | Lista todos los eventos |
| GET | /api/events/:id | Obtiene un evento por id |
| POST | /api/events | Crea un evento |
| POST | /api/sessions/register | Registra un usuario de forma segura |
| POST | /api/sessions/login | Login (autenticación pendiente de implementar) |

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

## Casos probados antes de la entrega

- [x] Registro exitoso
- [x] Campos faltantes
- [x] Email con formato inválido
- [x] Email ya registrado (mismo email, incluso con mayúsculas/espacios distintos, por la normalización)
- [x] La contraseña se guarda hasheada en MongoDB (verificado en Compass/Atlas: el campo `password` es un hash bcrypt, no texto plano)
- [x] La respuesta del endpoint nunca incluye el campo `password`

## Evidencia de las pruebas

Capturas de cada caso probado con Postman y MongoDB Atlas:

| Caso | Captura |
|---|---|
| Registro exitoso (201) | ![Registro exitoso](docs/01-registro-exitoso.png) |
| Campos faltantes (400) | ![Campos faltantes](docs/02-campos-faltantes.png) |
| Email inválido (400) | ![Email inválido](docs/03-email-invalido.png) |
| Email duplicado (409) | ![Email duplicado](docs/04-email-duplicado.png) |
| Password hasheado en MongoDB | ![Password hasheado](docs/05-password-hasheado-mongodb.png) |

## Estado actual

CRUD de eventos y registro seguro de usuarios funcionando de punta a punta. Login con JWT, cookies, ruta `current`, Passport y control de roles quedan para las próximas entregas.
