# Módulo 1: Gestión de Sedes y Socios
El sistema debe permitir registrar una nueva sede indicando nombre, teléfono, correo electrónico, horario de atención y estado activo.

El sistema debe permitir dar de baja una sede. Validación: No se podrán iniciar préstamos, reservas ni envíos hacia o desde una sede dada de baja.

El sistema debe registrar socios validando que no existan duplicados por documento o correo.

El sistema debe permitir cambiar el estado del socio entre HABILITADO e INHABILITADO. Validación: El sistema debe impedir realizar préstamos a socios inhabilitados.

# Módulo 2: Catálogo y Ejemplares
El sistema debe registrar libros asociados a uno o más autores, controlando que no existan duplicados.

El sistema debe permitir dar de alta ejemplares físicos vinculados unívocamente a un libro y a una sede de pertenencia.

El sistema debe actualizar el estado del ejemplar (DISPONIBLE, PRESTADO, EN_TRANSITO, RESERVADO, DANADO, etc.) según las operaciones que se realicen.

# Módulo 3: Solicitudes y Préstamos
El sistema debe permitir registrar solicitudes de préstamo indicando si es LOCAL o INTERBIBLIOTECARIO.

En solicitudes interbibliotecarias, el sistema debe registrar la sede de origen y la sede de destino. Validación: No se pueden prestar ejemplares que no pertenezcan a la sede de origen del préstamo ni realizar operaciones con sedes inactivas.

El sistema debe validar la disponibilidad del ejemplar antes de aprobar la solicitud y efectuar el préstamo.

El préstamo debe registrar fecha de inicio, fecha de vencimiento y agrupar uno o más ejemplares entregados al socio. Validación: El préstamo se efectiviza directamente en el momento en que el socio retira físicamente los ejemplares en la sede correspondiente; por lo tanto, la transacción de préstamo no requiere sede destino propia ni circuitos de envío o seguimiento.

# Módulo 4: Logística, Envíos y Remitos
Ante una solicitud interbibliotecaria aprobada, el sistema debe generar un Envio asociado a un Remito con un número único para trasladar el material entre la sede origen y la sede destino.

El sistema debe permitir registrar los cambios de estado del envío y del remito a lo largo de su trayecto (EMITIDO, DESPACHADO, EN_TRANSITO, RECIBIDO, CON_INCIDENCIA) mediante seguimientos fechados.

El sistema debe asegurar la trazabilidad completa del remito desde la sede emisora hasta la recepción final en la sede destino.

# Módulo 5: Devoluciones y Control Físico
El sistema debe registrar la devolución de un préstamo vinculada a una fecha específica.

Por cada ejemplar devuelto, el sistema debe generar un DetalleDevolucion que permita registrar observaciones y actualizar el estado físico del material (ej. correcto, dañado, destruido, extraviado).

El sistema debe verificar el cumplimiento de las fechas de vencimiento al momento de la devolución para identificar retrasos.

# Módulo 6: Reservas 
El sistema debe permitir a un socio generar una reserva sobre un libro cuando no haya ejemplares disponibles, asignándole un estado inicial ACTIVA