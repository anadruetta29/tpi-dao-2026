from dataclasses import dataclass
from datetime import date
from typing import Optional, Union
from app.domain.entities.estado_prestamo import EstadoPrestamo
from app.domain.entities.modalidad_prestamo_local import ModalidadPrestamoLocal


@dataclass
class Prestamo:
    fechaInicio: Optional[Union[date, str]] = None
    fechaVencimiento: Optional[Union[date, str]] = None
    fechaDevolucion: Optional[Union[date, str]] = None
    estado: Optional[EstadoPrestamo] = None
    modalidad: Optional[ModalidadPrestamoLocal] = None
