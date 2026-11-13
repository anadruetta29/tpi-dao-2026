from enum import Enum


class ErrorType(Enum):
    # Auth & Security
    UNAUTHORIZED = (401, "UNAUTHORIZED", "No autorizado o token inválido.")
    INVALID_CREDENTIALS = (401, "INVALID_CREDENTIALS", "Credenciales inválidas.")
    FORBIDDEN = (403, "FORBIDDEN", "No tiene permisos para realizar esta acción.")
    USER_INACTIVE = (403, "USER_INACTIVE", "El usuario se encuentra inactivo.")

    # Validation & Common
    MISSING_REQUIRED_FIELDS = (400, "MISSING_REQUIRED_FIELDS", "Faltan campos obligatorios.")
    BAD_REQUEST = (400, "BAD_REQUEST", "Solicitud inválida.")
    INVALID_STATE_TRANSITION = (400, "INVALID_STATE_TRANSITION", "Transición de estado inválida.")
    NOT_FOUND = (404, "NOT_FOUND", "Recurso no encontrado.")
    CONFLICT = (409, "CONFLICT", "Conflicto con el estado actual del recurso.")
    INTERNAL_ERROR = (500, "INTERNAL_ERROR", "Error interno del servidor.")

    # Usuario
    USER_NOT_FOUND = (404, "USER_NOT_FOUND", "Usuario no encontrado.")
    USER_ALREADY_EXISTS = (409, "USER_ALREADY_EXISTS", "Ya existe un usuario con ese email.")

    # Sede
    SEDE_NOT_FOUND = (404, "SEDE_NOT_FOUND", "Sede no encontrada.")
    SEDE_INACTIVE = (400, "SEDE_INACTIVE", "La sede se encuentra dada de baja.")
    SEDE_ALREADY_EXISTS = (409, "SEDE_ALREADY_EXISTS", "Ya existe una sede con ese nombre.")

    # Socio
    SOCIO_NOT_FOUND = (404, "SOCIO_NOT_FOUND", "Socio no encontrado.")
    SOCIO_ALREADY_EXISTS = (409, "SOCIO_ALREADY_EXISTS", "Ya existe un socio con ese documento o email.")
    SOCIO_INHABILITADO = (403, "SOCIO_INHABILITADO", "El socio se encuentra inhabilitado.")

    # Catálogo (Libro, Autor, Ejemplar)
    LIBRO_NOT_FOUND = (404, "LIBRO_NOT_FOUND", "Libro no encontrado.")
    LIBRO_ALREADY_EXISTS = (409, "LIBRO_ALREADY_EXISTS", "Ya existe un libro con esos datos.")
    AUTOR_NOT_FOUND = (404, "AUTOR_NOT_FOUND", "Autor no encontrado.")
    EJEMPLAR_NOT_FOUND = (404, "EJEMPLAR_NOT_FOUND", "Ejemplar no encontrado.")
    EJEMPLAR_ALREADY_EXISTS = (409, "EJEMPLAR_ALREADY_EXISTS", "Ya existe un ejemplar con ese código.")
    EJEMPLAR_NOT_AVAILABLE = (409, "EJEMPLAR_NOT_AVAILABLE", "El ejemplar no se encuentra disponible.")

    # Solicitudes, Préstamos, Reservas
    SOLICITUD_NOT_FOUND = (404, "SOLICITUD_NOT_FOUND", "Solicitud de préstamo no encontrada.")
    SOLICITUD_NOT_APPROVED = (400, "SOLICITUD_NOT_APPROVED", "La solicitud de préstamo no está aprobada.")
    PRESTAMO_NOT_FOUND = (404, "PRESTAMO_NOT_FOUND", "Préstamo no encontrado.")
    PRESTAMO_ALREADY_RETURNED = (409, "PRESTAMO_ALREADY_RETURNED", "El préstamo ya fue devuelto.")
    RESERVA_NOT_FOUND = (404, "RESERVA_NOT_FOUND", "Reserva no encontrada.")

    # Logística (Remito)
    REMITO_NOT_FOUND = (404, "REMITO_NOT_FOUND", "Remito no encontrado.")

    # Devoluciones y Multas
    DEVOLUCION_NOT_FOUND = (404, "DEVOLUCION_NOT_FOUND", "Devolución no encontrada.")
    MULTA_NOT_FOUND = (404, "MULTA_NOT_FOUND", "Multa no encontrada.")
    MULTA_ALREADY_CLOSED = (409, "MULTA_ALREADY_CLOSED", "La multa ya fue pagada o anulada.")

    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
