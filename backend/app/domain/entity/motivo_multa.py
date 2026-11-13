from enum import Enum


class MotivoMulta(str, Enum):
    ENTREGA_TARDIA = "ENTREGA_TARDIA"
    EXTRAVIO = "EXTRAVIO"
    DESTRUCCION = "DESTRUCCION"
