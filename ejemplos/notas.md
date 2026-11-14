
### 1. Módulo `Auth` (Autenticación)
*Actor: Todos los usuarios del sistema*

| Operación / Caso de Uso | Método | Ruta          | Descripción del Contrato                                                                                 |
| :---------------------- | :----: | :------------ | :------------------------------------------------------------------------------------------------------- |
| Iniciar sesión          | `POST` | `/auth/login` | Recibe credenciales (`email`, `password`) y devuelve el token de acceso + datos del usuario autenticado. |
| Obtener usuario actual  | `GET`  | `/auth/me`    | Devuelve el perfil y rol del usuario autenticado a partir del token.                                     |

---

### 2. Módulo `Sede` ([sede.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/sede.py))
*Actor principal: Administrador (Lectura: todos los actores)*

| Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :---: | :--- | :--- |
| Listar sedes (`getAll`) | `GET` | `/sedes` | Devuelve el listado de sedes. Permite filtrar por query param `?estado=ACTIVA\|BAJA`. |
| Obtener sede por ID (`getById`) | `GET` | `/sedes/{id}` | Devuelve los datos de contacto, horario de atención y estado de una sede específica. |
| Registrar sede | `POST` | `/sedes` | Crea una nueva sede con estado inicial `ACTIVA`. |
| Modificar sede | `PUT` | `/sedes/{id}` | Actualiza `nombre`, `telefono`, `email` y `horarioAtencion` de la sede. |
| Dar de baja sede | `DELETE` | `/sedes/{id}` | Baja lógica de la sede (pasa su estado a `BAJA`). |

---

### 3. Módulo `Usuario` ([usuario.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/usuario.py))
*Actor principal: Administrador*

| Operación / Caso de Uso            | Método  | Ruta                 | Descripción del Contrato                                                               |
| :--------------------------------- | :-----: | :------------------- | :------------------------------------------------------------------------------------- |
| Listar usuarios (`getAll`)         |  `GET`  | `/usuarios`          | Devuelve el listado de usuarios del sistema (filtrable por `?role=...&activo=...`).    |
| Obtener usuario por ID (`getById`) |  `GET`  | `/usuarios/{id}`     | Devuelve el detalle de un usuario del sistema.                                         |
| Registrar usuario                  | `POST`  | `/usuarios`          | Crea un usuario (`nombre`, `apellido`, `email`, `password`, `role`) con `activo=true`. |
| Modificar usuario                  |  `PUT`  | `/usuarios/{id}`     | Actualiza los datos básicos del usuario                                                |

---

### 4. Módulo `Socio` ([socio.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/socio.py))
*Actor principal: Administrador / Bibliotecario*

| Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :---: | :--- | :--- |
| Listar / Buscar socios (`getAll`) | `GET` | `/socios` | Lista y busca socios por query params (`?q=...&documento=...&estado=HABILITADO\|INHABILITADO`). |
| Obtener socio por ID (`getById`) | `GET` | `/socios/{id}` | Devuelve los datos personales y el `estado` actual de un socio. |
| Consultar préstamos de un socio | `GET` | `/socios/{id}/prestamos` | Devuelve el historial de préstamos del socio. |
| Consultar multas de un socio | `GET` | `/socios/{id}/multas` | Devuelve las multas (pendientes e históricas) del socio en cualquier sede. |
| Registrar socio | `POST` | `/socios` | Crea un nuevo socio con estado inicial `HABILITADO`. |
| Modificar socio | `PUT` | `/socios/{id}` | Actualiza `nombre`, `apellido`, `documento`, `email` y `telefono` del socio. |
| Dar de baja socio | `DELETE` | `/socios/{id}` | Inhabilita al socio (cambia su estado a `INHABILITADO`). |

---

### 5. Módulo Catálogo: `Libro`, `Ejemplar` y `Autor` ([libro.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/libro.py), [ejemplar.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/ejemplar.py), [autor.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/autor.py))
*Actor principal: Administrador / Bibliotecario*

| Módulo | Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :--- | :---: | :--- | :--- |
| **Libro** | Listar libros del catálogo (`getAll`) | `GET` | `/libros` | Lista libros con filtros (`?titulo=...&autor=...&editorial=...`). |
| **Libro** | Obtener libro por ID (`getById`) | `GET` | `/libros/{id}` | Devuelve la ficha bibliográfica de un libro específico. |
| **Libro** | Consultar disponibilidad de un libro | `GET` | `/libros/{id}/disponibilidad` | Devuelve los ejemplares del libro agrupados por sede y su `EstadoEjemplar`. |
| **Libro** | Registrar libro | `POST` | `/libros` | Da de alta un nuevo libro en el catálogo. |
| **Libro** | Modificar libro | `PUT` | `/libros/{id}` | Actualiza `titulo`, `añoPublicacion`, `editorial` y `edicion` del libro. |
| **Libro** | Eliminar libro | `DELETE` | `/libros/{id}` | Elimina el libro del catálogo. |
| **Ejemplar** | Listar ejemplares (`getAll`)  | `GET` | `/ejemplares` | Lista ejemplares físicos (filtrable por `?libro_id=...&sede_id=...&estado=...`). |
| **Ejemplar** | Obtener ejemplar por ID (`getById`)  | `GET` | `/ejemplares/{id}` | Devuelve el detalle de un ejemplar físico por su ID. |
| **Ejemplar** | Registrar ejemplar físico  | `POST` | `/ejemplares` | Registra una copia física (`codigo`, `libro_id`, `sede_id`) con estado `DISPONIBLE`. |
| **Autor** | Listar autores (`getAll`)  | `GET` | `/autores` | Lista todos los autores registrados. |
| **Autor** | Registrar autor  | `POST` | `/autores` | Crea un autor (`nombre`, `apellido`). |

---

### 6. Módulo `SolicitudPrestamo` ([solicitud_prestamo.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/solicitud_prestamo.py))
*Actor principal: Bibliotecario*

| Operación / Caso de Uso                | Método  | Ruta                                       | Descripción del Contrato                                                                                               |
| :------------------------------------- | :-----: | :----------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Listar solicitudes (`getAll`)          |  `GET`  | `/solicitudes-prestamo`                    | Lista solicitudes filtrando por `?tipo=LOCAL\|INTERBIBLIOTECARIO&estado=...&sede_id=...`.                              |
| Obtener solicitud por ID (`getById`)   |  `GET`  | `/solicitudes-prestamo/{id}`               | Obtiene el detalle de una solicitud de préstamo específica.                                                            |
| Registrar solicitud de préstamo local  | `POST`  | `/solicitudes-prestamo/local`              | Crea una solicitud con `tipo=LOCAL` y estado `PENDIENTE`.                                                              |
| Registrar solicitud interbibliotecaria | `POST`  | `/solicitudes-prestamo/interbibliotecario` | Crea una solicitud con `tipo=INTERBIBLIOTECARIO` (incluye `sede_origen_id` y `sede_destino_id`) en estado `PENDIENTE`. |
| Cambiar estado solicitud de préstamo   | `PATCH` | `PATCH /solicitudes-prestamo/{id}/estado`  | Pasa el estado de la solicitud al enviado.                                                                             |

---

### 7. Módulo `Prestamo` ([prestamo.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/prestamo.py))
*Actor principal: Bibliotecario*

| Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :---: | :--- | :--- |
| Listar préstamos (`getAll`) | `GET` | `/prestamos` | Lista préstamos con filtros (`?socio_id=...&sede_id=...&estado=ACTIVO\|DEVUELTO\|VENCIDO`). |
| Obtener préstamo por ID (`getById`) | `GET` | `/prestamos/{id}` | Devuelve el detalle de un préstamo específico. |
| Efectivizar préstamo (retiro de libro) | `POST` | `/prestamos` | Crea el préstamo `ACTIVO` a partir de una `solicitud_id` `APROBADA`, asigna `modalidad`, `fechaInicio`, `fechaVencimiento` y pasa el ejemplar a `PRESTADO`. |

---

### 8. Módulo `Reserva` ([reserva.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/reserva.py))
*Actor principal: Bibliotecario*

| Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :---: | :--- | :--- |
| Listar reservas (`getAll`) | `GET` | `/reservas` | Lista reservas con filtros por query params (`?libro_id=...&socio_id=...&sede_id=...&estado=...`). |
| Obtener reserva por ID (`getById`) | `GET` | `/reservas/{id}` | Devuelve el detalle de una reserva específica. |
| Registrar reserva de libro | `POST` | `/reservas` | Crea una reserva en estado `ACTIVA` para un socio y un libro/ejemplar. |
| Actualizar estado de reserva | `PATCH` | `/reservas/{id}/estado` | Actualiza el estado de la reserva (`ACTIVA`, `ATENDIDA`, `CANCELADA`, `VENCIDA`). |

---

### 9. Módulo Logística: `Remito` e `HistorialEstadoRemito` ([remito.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/remito.py), [historial_estado_remito.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/historial_estado_remito.py))
*Actor principal: Bibliotecario / Logística*

| Módulo | Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :--- | :---: | :--- | :--- |
| **Remito** | Listar remitos (`getAll`)  | `GET` | `/remitos` | Lista remitos filtrando por `?sede_origen_id=...&sede_destino_id=...&estado=...`. |
| **Remito** | Obtener remito por ID (`getById`) | `GET` | `/remitos/{id}` | Devuelve los datos de cabecera del remito y los ejemplares incluidos. |
| **Remito** | Registrar empaquetado y emitir remito | `POST` | `/remitos` | Agrupa ejemplares aprobados para traslado, crea el remito con `fechaEmision` y abre historial en `EMPACADO`. |
| **Remito** | Registrar despacho de envío | `PATCH` | `/remitos/{id}/despacho` | Registra `fechaDespacho` y actualiza el estado del envío a `EN_TRANSITO` (y ejemplares a `EN_TRANSITO`). |
| **Remito** | Registrar recepción de envío | `PATCH` | `/remitos/{id}/recepcion` | Registra `fechaRecepcion`, valida ejemplares recibidos y pasa el estado a `RECIBIDO` (o `CON_INCIDENCIA`). |
| **HistorialEstadoRemito** | Consultar trazabilidad de remito | `GET` | `/remitos/{id}/trazabilidad` | Devuelve la lista cronológica de `HistorialEstadoRemito` (`fechaInicio`, `fechaFin`, `estado`) de ese remito. |

---

### 10. Módulo `Devolucion` ([devolucion.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/devolucion.py))
*Actor principal: Bibliotecario*

| Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :---: | :--- | :--- |
| Listar devoluciones (`getAll`)  | `GET` | `/devoluciones` | Lista las devoluciones registradas. |
| Obtener devolución por ID (`getById`)  | `GET` | `/devoluciones/{id}` | Devuelve el detalle de una devolución específica. |
| Registrar devolución de ejemplar | `POST` | `/devoluciones` | Registra la devolución (`prestamo_id`, `fecha`, `observaciones`, `estadoDevuelto`), cierra el préstamo en `DEVUELTO` y actualiza el estado del ejemplar. |

---

### 11. Módulo `Multa` ([multa.py](file:///f:/Usuario/Code/utn/tpi-dao-2026/backend/app/domain/entities/multa.py))
*Actor principal: Bibliotecario / Administrador*

| Operación / Caso de Uso | Método | Ruta | Descripción del Contrato |
| :--- | :---: | :--- | :--- |
| Listar multas (`getAll`) | `GET` | `/multas` | Lista multas globalmente (todas las sedes) filtrando por `?socio_id=...&estado=PENDIENTE\|PAGADA\|ANULADA`. |
| Obtener multa por ID (`getById`) | `GET` | `/multas/{id}` | Devuelve el detalle de una multa específica. |
| Registrar multa | `POST` | `/multas` | Crea una multa (`socio_id`, `prestamo_id`, `motivo`, `monto`) con estado `PENDIENTE` e inhabilita al socio (`INHABILITADO`). |
| Registrar pago de multa | `PATCH` | `/multas/{id}/pagar` | Pasa la multa a `PAGADA`, registra `fechaPago` y rehabilita al socio (`HABILITADO`) si no posee otras multas pendientes. |
| Anular multa  | `PATCH` | `/multas/{id}/anular` | Pasa la multa a `ANULADA` y rehabilita al socio si no posee otras multas pendientes. |
