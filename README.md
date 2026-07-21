# Plataforma de Eventos e Inscripciones

## Descripción

API REST para gestionar eventos e inscripciones. Proyecto de Backend II — pre-entrega con arquitectura en capas (routes, controllers, services, repositories, dao, models, middlewares).

## Temática

Plataforma de Eventos e Inscripciones: gestión de eventos y, en próximas entregas, registro/login de usuarios, inscripciones y control de cupos.

## Tecnologías

- Node.js
- Express
- Mongoose (MongoDB)
- dotenv

## Instalación

```
npm install
```

## Variables de entorno

Crear un archivo `.env` en base a `.env.example` con:

```
PORT=8080
NODE_ENV=development
MONGO_URL=tu_cadena_de_conexion_a_mongodb
JWT_SECRET=tu_secreto_para_jwt
```

## Ejecutar

```
npm run dev
```

## Estructura de carpetas

```
src/
├── app.js              # configura Express
├── server.js           # levanta el servidor y conecta la DB
├── config/              # conexión a MongoDB
├── routes/              # definición de endpoints
├── controllers/         # reciben req/res, delegan a services
├── services/             # lógica de negocio
├── repositories/         # intermediario entre services y dao
├── dao/                  # acceso directo a los modelos de Mongoose
├── models/               # esquemas de MongoDB (User, Event)
├── middlewares/           # manejo global de errores
└── utils/
```

## Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/health | Estado del servidor |
| GET | /api/events | Lista todos los eventos |
| GET | /api/events/:id | Obtiene un evento por id |
| POST | /api/events | Crea un evento |
| POST | /api/sessions/register | Registra un usuario |
| POST | /api/sessions/login | Login (autenticación pendiente de implementar) |

## Estado actual

Conexión a MongoDB y CRUD básico de eventos funcionando de punta a punta. Autenticación con JWT, roles y control de cupos quedan para las próximas entregas.
