from enum import Enum


class MotivoMulta(str, Enum):
    ENTREGA_TARDIA = "ENTREGA_TARDIA"
    DANO = "DANO"
    EXTRAVIO = "EXTRAVIO"
    DESTRUCCION = "DESTRUCCION"
