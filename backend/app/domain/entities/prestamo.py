from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_prestamo import EstadoPrestamo
from app.domain.entities.modalidad_prestamo_local import ModalidadPrestamoLocal


class Prestamo:
    def __init__(
        self,
        fechaInicio: Optional[Union[date, str]] = None,
        fechaVencimiento: Optional[Union[date, str]] = None,
        fechaDevolucion: Optional[Union[date, str]] = None,
        estado: Optional[EstadoPrestamo] = None,
        modalidad: Optional[ModalidadPrestamoLocal] = None,
    ) -> None:
        self.fechaInicio = fechaInicio
        self.fechaVencimiento = fechaVencimiento
        self.fechaDevolucion = fechaDevolucion
        self.estado = estado
        self.modalidad = modalidad
