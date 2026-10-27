from enum import Enum


class Rol(str, Enum):
    RECEPCIONISTA = "RECEPCIONISTA"
    MODERADOR = "MODERADOR"
    ADMIN = "ADMIN"
