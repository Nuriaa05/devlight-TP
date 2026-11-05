# API REST de lista de tareas

Trabajo práctico integrador del Bootcamp 5.0, módulo Node.js. Es una API donde cada usuario se registra, inicia sesión y administra sus propias tareas.

Está hecha con Node.js, Express, TypeScript, MongoDB Atlas con Mongoose, Bcrypt y JWT.

## Requisitos

- Node.js 22 o superior
- Una base de datos en [MongoDB Atlas](https://www.mongodb.com/atlas), con un usuario y tu IP habilitada en **Network Access**
- [Thunder Client](https://www.thunderclient.com), para ejecutar las pruebas

## Instalación

1. Cloná el repositorio y entrá a la carpeta:

```bash
git clone https://github.com/Nuriaa05/devlight-TP.git
```

```bash
cd devlight-TP
```

2. Instalá las dependencias:

```bash
npm install
```

3. Creá tu archivo de variables de entorno:

```bash
cp .env.example .env
```

4. Generá un secreto para firmar los tokens:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Completá `.env`:

```env
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:CONTRASEÑA@TU-CLUSTER.mongodb.net/devlight-tp
JWT_SECRET=el-valor-que-generaste
JWT_EXPIRES_IN=1h
```

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `PORT` | No | Puerto del servidor. Por defecto, `3000` |
| `MONGO_URI` | Sí | Cadena de conexión a MongoDB Atlas |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens |
| `JWT_EXPIRES_IN` | No | Duración del token, como `30m`, `1h` o `7d`. Por defecto, `1h` |

El archivo `.env` está en el `.gitignore`: nunca lo subas al repositorio.

## Ejecución

En desarrollo, con reinicio automático:

```bash
npm run dev
```

En producción:

```bash
npm run build
```

```bash
npm start
```

Si todo está bien, la consola muestra `Conectado a MongoDB` y `Servidor escuchando en http://localhost:3000`.

Para comprobarlo, abrí http://localhost:3000/api/health. Tiene que responder `{"status":"ok"}`.

## Endpoints

La dirección base es `http://localhost:3000`.

| Método | Ruta | Acceso | Descripción | Éxito | Errores |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/health` | Público | Comprueba que el servidor responde | 200 | 500 |
| POST | `/api/users/register` | Público | Registra un usuario | 201 | 400, 500 |
| POST | `/api/users/login` | Público | Inicia sesión y devuelve un token | 200 | 400, 401, 500 |
| GET | `/api/tasks` | Con token | Lista las tareas del usuario | 200 | 400, 401, 500 |
| GET | `/api/tasks/:id` | Con token | Devuelve una tarea del usuario | 200 | 400, 401, 404, 500 |
| POST | `/api/tasks` | Con token | Crea una tarea | 201 | 400, 401, 500 |
| PUT | `/api/tasks/:id` | Con token | Modifica una tarea del usuario | 200 | 400, 401, 404, 500 |
| DELETE | `/api/tasks/:id` | Solo admin | Elimina una tarea | 200 | 400, 401, 403, 404, 500 |

Las rutas con token necesitan este encabezado:

```text
Authorization: Bearer TU_TOKEN
```

Los errores responden con un mensaje:

```json
{ "message": "Tarea no encontrada" }
```

### Registrar un usuario

`POST /api/users/register`

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "password": "una-clave-de-prueba"
}
```

Responde `201` con el usuario, sin la contraseña:

```json
{
  "id": "6aeb9e7c08af64ee04f2b7a6",
  "name": "Ana",
  "email": "ana@example.com",
  "role": "user"
}
```

### Iniciar sesión

`POST /api/users/login`

```json
{
  "email": "ana@example.com",
  "password": "una-clave-de-prueba"
}
```

Responde `200` con el token:

```json
{ "token": "eyJhbGciOi..." }
```

### Crear una tarea

`POST /api/tasks`

```json
{
  "title": "Estudiar Node",
  "priority": "alta",
  "dueDate": "2030-12-01"
}
```

| Campo | Tipo | Obligatorio | Valores |
| --- | --- | --- | --- |
| `title` | Texto | Sí | No puede estar vacío |
| `dueDate` | Fecha | Sí | Formato `AAAA-MM-DD`; no puede estar en el pasado |
| `priority` | Texto | No | `baja`, `media` o `alta`. Por defecto, `media` |
| `completed` | Booleano | No | `true` o `false`. Por defecto, `false` |

Responde `201` con la tarea creada:

```json
{
  "_id": "6aebc08f2c2aa943b73cb768",
  "title": "Estudiar Node",
  "priority": "alta",
  "dueDate": "2030-12-01T00:00:00.000Z",
  "completed": false,
  "user": "6aeb9e7c08af64ee04f2b7a6",
  "createdAt": "2026-11-05T01:30:00.000Z",
  "updatedAt": "2026-11-05T01:30:00.000Z"
}
```

### Modificar una tarea

`PUT /api/tasks/:id` cambia solo los campos enviados, y necesita al menos uno:

```json
{ "completed": true }
```

### Filtrar tareas

`GET /api/tasks` acepta estos filtros, que se pueden combinar:

| Filtro | Valores | Ejemplo |
| --- | --- | --- |
| `priority` | `baja`, `media` o `alta` | `/api/tasks?priority=alta` |
| `completed` | `true` o `false` | `/api/tasks?completed=false` |

## Reglas de negocio

**Tareas**

- La fecha límite no puede estar en el pasado. Una tarea puede vencer el mismo día en que se crea.
- Una tarea vencida se puede seguir editando mientras no se cambie su fecha.
- Cada tarea pertenece a quien la creó, y el dueño no se puede cambiar.
- Cada usuario ve y modifica solo sus tareas. Una tarea ajena responde `404`, para no revelar que existe.
- Solo un admin puede eliminar, y puede hacerlo con la tarea de cualquier usuario. Para listar, ver y modificar tiene las mismas reglas que los demás.

**Usuarios**

- La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes, el límite de Bcrypt.
- El email es único y no distingue mayúsculas de minúsculas.
- El registro siempre crea usuarios con el rol `user`, aunque el cuerpo envíe otro.
- El token incluye solo el id y el rol del usuario.

## Códigos de estado

| Código | Cuándo |
| --- | --- |
| 200 | Lectura, modificación, eliminación o login correctos |
| 201 | Usuario o tarea creados |
| 400 | Datos inválidos, id con formato incorrecto o email ya registrado |
| 401 | Token ausente, inválido o vencido, o credenciales incorrectas |
| 403 | Usuario autenticado sin rol de admin |
| 404 | La ruta o la tarea no existen, o la tarea es de otro usuario |
| 500 | Error inesperado del servidor |

## Crear un admin

El rol `admin` no se puede obtener desde la API:

1. Registrá el usuario con `POST /api/users/register`.
2. En Atlas, abrí **Browse Collections** → `devlight-tp` → `users`.
3. Editá ese usuario y cambiá `role` de `user` a `admin`.
4. Volvé a iniciar sesión, porque el rol viaja dentro del token.

Creá siempre los usuarios desde la API: si los cargás a mano en Atlas, la contraseña no queda con su hash y el login los rechaza.

## Pruebas con Thunder Client

La colección está en [`thunder/thunder-collection_devlight-TP-API.json`](thunder/thunder-collection_devlight-TP-API.json). Tiene 42 peticiones, y el nombre de cada una empieza con el código esperado.

1. **Importá la colección:** en **Collections**, abrí el menú, elegí **Import** y seleccioná el archivo.
2. **Creá un entorno:** en la pestaña **Env**, creá un entorno con las variables `tokenUsuario`, `tokenAdmin` y `tareaId`, y marcalo como activo.
3. **Prepará los usuarios:**
   1. Registrá a `nuria@example.com` con la contraseña `una-clave-de-prueba`, y convertilo en admin como se explica en [Crear un admin](#crear-un-admin). Es el usuario que usa `200 - Login de admin`.
   2. Ejecutá `201 - Registrar usuario`, que crea a `ana@example.com`.
4. **Cargá las variables:**
   1. Ejecutá `200 - Login de usuario` y copiá el token en `tokenUsuario`.
   2. Ejecutá `200 - Login de admin` y copiá el token en `tokenAdmin`.
   3. Ejecutá `201 - Crear tarea` y copiá el `_id` en `tareaId`.
5. **Ejecutá las carpetas en orden.** La carpeta 7 va al final, porque elimina la tarea.

Para repetir las pruebas, tené en cuenta que:

- `201 - Registrar usuario` responde `400` si el usuario ya existe. Podés saltearla.
- Hay que crear otra tarea y actualizar `tareaId`, porque la anterior se eliminó.
- Los tokens vencen según `JWT_EXPIRES_IN`. Si vencieron, iniciá sesión de nuevo y actualizá las variables.

## Estructura del proyecto

El código está organizado por componentes, y cada uno se divide en capas: rutas, controlador, servicio y acceso a datos.

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
│   ├── admin.middleware.ts      # Permite pasar solo a un admin
│   ├── error.middleware.ts      # Rutas inexistentes y errores
│   └── logger.middleware.ts     # Muestra el método y la URL de cada petición
├── utils/
│   └── AppError.ts              # Error con código de estado
├── app.ts                       # Configura Express
└── server.ts                    # Conecta a la base y escucha
```

## Extras implementados

- **Filtros:** `GET /api/tasks` acepta `priority` y `completed`.
- **Roles:** solo un admin puede eliminar.
- **Relación entre modelos:** cada tarea pertenece a quien la creó, y cada usuario ve solo las suyas.
- **Logging:** la consola muestra el método y la URL de cada petición.
