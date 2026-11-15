from enum import Enum


class EstadoReserva(str, Enum):
    ACTIVA = "ACTIVA"
    ATENDIDA = "ATENDIDA"
    LISTA_PARA_RETIRO = "LISTA_PARA_RETIRO"
    RETIRADA = "RETIRADA"
    CANCELADA = "CANCELADA"
    VENCIDA = "VENCIDA"
