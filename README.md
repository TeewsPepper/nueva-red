# Proyecto Iglesia - API Backend

Resumen de las funcionalidades implementadas en el backend.

## Resumen
Esta API está pensada para una aplicación de gestión y comunidad de iglesia. Implementa autenticación, roles, feed social (posts y comentarios), notificaciones en tiempo real con Socket.io, ministerios, eventos, tareas, actividades (break), solicitudes de ministerio y pedidos de oración.

## Principales recursos y endpoints (base: `/api`)

- **Auth** (`/api/auth`)
  - `POST /register` — Registrar usuario (name, email, password, role, churchName, phone)
  - `POST /login` — Login (email, password) — devuelve cookie `token` y `token` en body
  - `POST /logout` — Logout (limpia cookie)
  - `GET /me` — Obtener perfil (protegido)
  - `GET /verify` — Verificar token (protegido)

- **Usuarios** (`/api/usuarios`)
  - `GET /` — Ver todos los usuarios (solo `pastor`)
  - `GET /lideres` — Lista de líderes y pastores
  - `GET /:id` — Ver perfil (propio o `pastor`)
  - `PUT /:id` — Actualizar perfil (propio o `pastor`)

- **Posts (Feed)** (`/api/posts`)
  - `GET /` — Listar posts
  - `POST /` — Crear post (protegido)
  - `GET /:id` — Obtener post
  - `PUT /:id` — Editar post (autor o `pastor`)
  - `DELETE /:id` — Eliminar post (autor o `pastor`, marca isActive=false)
  - `POST /:id/like` — Dar/quitar like (genera notificación si aplica)

- **Comments** (`/api/comments`)
  - `GET /post/:postId` — Comentarios de un post
  - `POST /` — Crear comentario (agrega al post, notificación)
  - `DELETE /:id` — Eliminar comentario (autor o `pastor`)
  - `POST /:id/like` — Like a comentario

- **Notifications** (`/api/notifications`)
  - `GET /` — Obtener notificaciones del usuario
  - `PUT /:id/read` — Marcar notificación como leída
  - `PUT /read-all` — Marcar todas como leídas
  - `DELETE /:id` — Eliminar (desactivar)

- **Prayers (Pedidos de oración)** (`/api/prayers`)
  - `GET /` — Listar pedidos
  - `POST /` — Crear pedido
  - `GET /:id` — Obtener pedido
  - `POST /:id/pray` — Unirse/retirar oración
  - `PUT /:id/answer` — Marcar como respondida (autor o pastor)
  - `DELETE /:id` — Eliminar pedido (autor o pastor)

- **Ministerios** (`/api/ministerios`)
  - `GET /` — Listar ministerios
  - `POST /` — Crear (pastor o líder)
  - `PUT /:id` — Editar (pastor o líder propietario)
  - `DELETE /:id` — Eliminar (pastor)

- **Eventos** (`/api/eventos`)
  - `GET /` — Listar eventos
  - `POST /` — Crear (pastor o líder)
  - `PUT /:id` — Editar (pastor o líder propietario)
  - `DELETE /:id` — Eliminar (pastor)

- **Tareas** (`/api/tareas`)
  - `GET /` — Listar tareas
  - `POST /` — Crear (pastor, líder, miembro)
  - `PUT /:id` — Editar (creador/asignado/pastor)
  - `PATCH /:id/completar` — Marcar completar/pendiente
  - `DELETE /:id` — Eliminar (creador o pastor)

- **Break / Actividades** (`/api/break/actividades`)
  - `GET /actividades` — Listar
  - `POST /actividades` — Crear y unirse (pastor,líder,miembro)
  - `POST /actividades/:id/unirse` — Unirse
  - `POST /actividades/:id/salir` — Salir
  - `PUT /actividades/:id` — Editar (creador o pastor)
  - `DELETE /actividades/:id` — Eliminar (creador o pastor)

- **Solicitudes de Ministerio** (`/api/solicitudes`)
  - `POST /` — Crear solicitud (miembros)
  - `GET /` — Listar solicitudes (pastor, líder)
  - `GET /:id` — Ver solicitud (pastor, líder correspondiente)
  - `PUT /:id/aprobar` — Aprobar y crear ministerio (pastor)
  - `PUT /:id/rechazar` — Rechazar (pastor)
  - `DELETE /:id` — Eliminar (creador o pastor)

## Modelos principales (resumen)
- `User` — name, email, password (hasheada), role (pastor|lider|miembro|visitante), churchName, phone, isActive
- `Post` — author, content, image, ministryId, likes[], comments[], isPublic, isActive
- `Comment` — postId, author, content, likes[], isActive
- `Notification` — user, type (like|comment|prayer|event|system), title, message, link, isRead
- `Ministerio` — nombre, descripcion, liderId, miembros[], horarios, ubicacion, creadoPor
- `Evento` — titulo, descripcion, fecha (string), horaInicio, horaFin, ubicacion, ministerioId
- `Tarea` — titulo, descripcion, prioridad, estado, fechaEntrega (string), asignadoA, creadoPor, completada
- `BreakActivity` — titulo, descripcion, fecha, horaInicio, horaFin, ubicacion, maxParticipantes, participantes[]
- `SolicitudMinisterio` — nombre, descripcion, liderPropuesto, creadorId, estado
- `PrayerRequest` — author, title, description, isAnonymous, prayers[], isAnswered

## Tiempo real (Socket.io)
Eventos emitidos desde el backend:
- `nuevo_post` — cuando se crea un post
- `nueva_notificacion` — cuando se crea una notificación relevante
- `nuevo_comentario` — cuando se crea un comentario
- `like_updated` — cuando cambia el conteo de likes de un post
- `comentario_like_updated` — cuando cambia el like en un comentario

El servidor inicializa Socket.io en `server.ts` y exporta `getIO()` para usar en rutas.

## Configuración y variables de entorno
Variables principales (archivo `.env`):
- `PORT` — puerto del servidor (por defecto 5000)
- `MONGODB_URI` — cadena de conexión a MongoDB
- `JWT_SECRET` — secreto para firmar tokens JWT
- `FRONTEND_URL` — URL del frontend para CORS y Socket.io

## Cómo ejecutar (backend)
Instalar dependencias y ejecutar en modo desarrollo:

```bash
cd backend
npm install
npm run dev
```

Construir y ejecutar en producción:

```bash
cd backend
npm run build
npm start
```

Script útil:
- `npm run create:admin` — crea un admin según `src/scripts/createAdmin.ts` (ver script)

## Notas y permisos
- El middleware `protect` usa cookie `token` o header `Authorization: Bearer <token>`.
- El sistema de roles (`pastor`, `lider`, `miembro`, `visitante`) protege acciones sensibles mediante `requireRole`.
- Muchas eliminaciones solo marcan `isActive = false` en lugar de borrar físicamente.

## Próximos pasos recomendados
- Añadir documentación OpenAPI/Swagger para los endpoints.
- Añadir tests automatizados para controladores críticos.
- Mejorar manejo de archivos (imágenes) si se requiere upload real.

---
Generado a partir del código presente en `backend/src`.
