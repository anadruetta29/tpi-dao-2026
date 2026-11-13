from enum import Enum


class EstadoMulta(str, Enum):
    PENDIENTE = "PENDIENTE"
    PAGADA = "PAGADA"
    ANULADA = "ANULADA"
