# Planificación: API REST de Lista de tareas

TP integrador del Bootcamp 5.0, módulo Node.js. Trabajo individual.

| Decisión | Elección |
| --- | --- |
| Temática | Lista de tareas |
| Modelos | `User` y `Task` |
| Base de datos | MongoDB Atlas con Mongoose |
| Stack | Node.js, Express y TypeScript |
| Autenticación | Bcrypt y JWT |
| Pruebas | Thunder Client |

## Fechas

La consigna se presentó el 2 de noviembre de 2026 y el plazo es de 2 semanas, sin extensión.
Las fechas de abajo son **estimadas**, porque las exactas las informa el docente. Confirmalas y ajustá este archivo si cambian.

| Hito | Fecha estimada | Qué se espera |
| --- | --- | --- |
| Punto de control | Domingo 8 de noviembre | Proyecto creado, conexión a la base y CRUD funcionando, sin autenticación |
| Entrega final | Domingo 15 de noviembre | Autenticación, rutas protegidas, validaciones, README y pruebas |
| Margen | Lunes 16 de noviembre | Solo para imprevistos |

## Cronograma

### Semana 1: base y CRUD

- [x] **Mié 4:** elegir temática y base de datos, conectar el repositorio, escribir esta planificación.
- [x] **Mié 4:** crear el cluster en Atlas, el usuario de la base y habilitar el acceso por IP.
- [x] **Jue 5:** iniciar el proyecto con TypeScript y Express, armar las carpetas por componentes y configurar `dotenv`.
- [x] **Jue 5:** conectar a Atlas y levantar el servidor sin errores.
- [x] **Vie 6:** escribir el modelo `Task`, el acceso a datos y el servicio.
- [x] **Sáb 7:** escribir el controlador y las rutas de los 5 endpoints, con try/catch en cada controlador.
- [x] **Dom 8:** probar el CRUD en Thunder Client, incluidos los 400, 404 y 500, y subir todo para el punto de control.

### Semana 2: autenticación, extras y entrega

- [ ] **Lun 9:** aplicar la devolución del punto de control.
- [x] **Lun 9:** escribir el modelo `User`.
- [x] **Mar 10:** implementar registro con Bcrypt y login con JWT.
- [x] **Mié 11:** escribir el middleware de JWT y proteger las rutas.
- [x] **Jue 12:** sumar los extras: relación entre modelos, filtros, roles y logging.
- [x] **Vie 13:** revisar validaciones y códigos de estado endpoint por endpoint.
- [x] **Sáb 14:** completar y exportar la colección de Thunder Client, y escribir el README.
- [ ] **Dom 15:** clonar el repositorio en una carpeta limpia, seguir el README desde cero, revisar la lista de control y entregar.

## Estructura

```text
src/
├── components/
│   ├── tasks/
│   │   ├── task.routes.ts       # Rutas
│   │   ├── task.controller.ts   # Lee la petición y responde
│   │   ├── task.service.ts      # Validaciones de negocio
│   │   ├── task.repository.ts   # Acceso a datos
│   │   └── task.model.ts        # Esquema de Mongoose
│   └── users/
│       ├── user.routes.ts
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       └── user.model.ts
├── config/
│   ├── database.ts              # Conexión a MongoDB
│   └── jwt.ts                   # Lee y valida la configuración de JWT
├── middlewares/
│   ├── auth.middleware.ts       # Verifica el JWT
│   ├── admin.middleware.ts      # Extra: roles
│   ├── error.middleware.ts      # Rutas inexistentes y errores
│   └── logger.middleware.ts     # Extra: logging
├── utils/
│   └── AppError.ts              # Error con código de estado
├── app.ts                       # Configura Express
└── server.ts                    # Conecta a la base y escucha
```

Cada capa solo conoce a la siguiente: rutas → controlador → servicio → acceso a datos.

## Modelos

### Task

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `title` | String | Obligatorio |
| `priority` | String | `baja`, `media` o `alta`; por defecto `media` |
| `dueDate` | Date | Obligatorio |
| `completed` | Boolean | Por defecto `false` |
| `user` | ObjectId → `User` | Se agrega en la semana 2; lo asigna el servidor a partir del token |

### User

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `name` | String | Obligatorio |
| `email` | String | Obligatorio y único |
| `password` | String | Obligatorio; se guarda solo el hash de Bcrypt |
| `role` | String | `user` o `admin`; por defecto `user` |

## Endpoints

| Método | Ruta | Acceso | Descripción | Éxito | Errores |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/users/register` | Público | Registra un usuario | 201 | 400, 500 |
| POST | `/api/users/login` | Público | Devuelve un JWT | 200 | 400, 401, 500 |
| GET | `/api/tasks` | Con token | Lista las tareas del usuario | 200 | 400, 401, 500 |
| GET | `/api/tasks/:id` | Con token | Devuelve una tarea | 200 | 400, 401, 404, 500 |
| POST | `/api/tasks` | Con token | Crea una tarea | 201 | 400, 401, 500 |
| PUT | `/api/tasks/:id` | Con token | Modifica una tarea | 200 | 400, 401, 404, 500 |
| DELETE | `/api/tasks/:id` | Solo admin | Elimina una tarea | 200 | 400, 401, 403, 404, 500 |

Filtros de `GET /api/tasks`: `?priority=alta` y `?completed=false`.

Un admin puede eliminar la tarea de cualquier usuario, pero para listar, ver y modificar tiene las mismas reglas que los demás: solo accede a las suyas. El rol viaja en el token, así que un usuario recién ascendido tiene que volver a hacer login.

## Validaciones de negocio

Van en la capa de servicio y responden 400. Se piden al menos 2; estas son las previstas:

1. La fecha límite no puede estar en el pasado.
2. La prioridad debe ser `baja`, `media` o `alta`.
3. El título no puede estar vacío ni tener solo espacios.

Otras reglas de la API:

- La fecha límite se envía como `AAAA-MM-DD`. Una tarea puede vencer el mismo día en que se crea.
- `PUT` modifica solo los campos enviados y necesita al menos uno.
- Una tarea vencida se puede seguir editando mientras no se cambie su fecha.
- La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes, el límite de Bcrypt.
- El email no distingue mayúsculas de minúsculas.
- `JWT_EXPIRES_IN` usa un formato como `30m`, `1h` o `7d`. Si está vacía, el token dura 1 hora.

## Códigos de estado

| Código | Cuándo |
| --- | --- |
| 200 | Lectura, modificación, eliminación o login correctos |
| 201 | Tarea o usuario creados |
| 400 | Datos inválidos, id con formato incorrecto o email ya registrado |
| 401 | Token ausente o inválido, o credenciales incorrectas |
| 403 | Usuario autenticado sin rol de admin (extra de roles) |
| 404 | La tarea no existe o pertenece a otro usuario |
| 500 | Error inesperado del servidor |

## Puntos a cuidar

- **Id inválido:** un id con formato incorrecto hace fallar a Mongoose con `CastError`. Hay que responder 400, no 500.
- **Token:** incluye solo el id y el rol, nunca la contraseña ni otros datos sensibles.
- **Respuestas:** el hash de la contraseña no se devuelve nunca.
- **Rol:** el registro ignora cualquier `role` del body. Si no, cualquiera podría registrarse como admin. El primer admin se asigna a mano en Atlas.
- **Dueño de la tarea:** `user` sale siempre del token, nunca del body, y `PUT` no lo puede cambiar.
- **Tareas ajenas:** se responde 404, para no revelar que la tarea existe.
- **Login:** el mismo 401 para email inexistente y contraseña incorrecta.
- **Secretos:** `.env` no se sube nunca. Revisá también que la colección exportada de Thunder Client no incluya tokens reales.

## Extras

Suman 2,5 puntos cada uno, hasta 10. Se hacen después de cumplir los requisitos mínimos.

| Extra | Implementación |
| --- | --- |
| Filtros | `req.query` en `GET /api/tasks` |
| Roles | Solo un `admin` puede eliminar |
| Relación entre modelos | Cada tarea pertenece a quien la creó, y cada usuario ve solo las suyas |
| Logging | Middleware que muestra el método y la URL de cada petición |

La consigna da este ejemplo de roles, así que un usuario común no puede borrar ni siquiera sus propias tareas. Conviene confirmarlo con el docente si preferís otra regla.

## Lista de control para la entrega

Requisitos mínimos (hay que cumplir los 10):

- [ ] 1. Node.js, Express y TypeScript, con estructura por componentes
- [ ] 2. MongoDB Atlas con Mongoose y los modelos `User` y `Task`
- [ ] 3. CRUD completo: GET todos, GET por id, POST, PUT y DELETE
- [ ] 4. Capas de rutas, controlador, servicio y acceso a datos
- [ ] 5. Al menos 2 validaciones de negocio en el servicio
- [ ] 6. Registro y login con Bcrypt y JWT
- [ ] 7. Rutas que crean, modifican o eliminan protegidas con middleware
- [ ] 8. Códigos 200, 201, 400, 401, 404 y 500 correctos
- [ ] 9. Todos los controladores con try/catch
- [ ] 10. `MONGO_URI` y `JWT_SECRET` en `.env`, ignorado por Git, con `.env.example` sin valores

Entregables:

- [ ] Repositorio de GitHub con el código
- [ ] README con instalación, ejecución y lista de endpoints
- [ ] Colección de Thunder Client o capturas de cada endpoint, incluidos los errores 400, 401 y 404

## Rúbrica

Se aprueba con 60 de 100 puntos.

| Criterio | Puntos | Se trabaja |
| --- | --- | --- |
| Estructura y capas | 20 | Semana 1 |
| CRUD | 20 | Semana 1 |
| Validaciones y errores | 20 | Ambas semanas |
| Autenticación | 25 | Semana 2 |
| Documentación y pruebas | 15 | Semana 2 |
| Extras (opcional) | +10 | Semana 2 |
