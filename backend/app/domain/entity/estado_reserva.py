from enum import Enum


class EstadoReserva(str, Enum):
    ACTIVA = "ACTIVA"
    ATENDIDA = "ATENDIDA"
    CANCELADA = "CANCELADA"
    VENCIDA = "VENCIDA"
