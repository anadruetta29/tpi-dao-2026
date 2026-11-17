from datetime import date
from typing import Optional, Union
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


def as_date(value: Optional[Union[date, str]]) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def validate_date_range(
    fecha_desde: Optional[date],
    fecha_hasta: Optional[date],
    hoy: Optional[date] = None,
) -> None:
    referencia = hoy or date.today()
    if fecha_desde is not None and fecha_desde > referencia:
        raise ErrorHandler(ErrorType.BAD_REQUEST, "La fecha desde no puede ser posterior al día actual.")
    if fecha_hasta is not None and fecha_hasta > referencia:
        raise ErrorHandler(ErrorType.BAD_REQUEST, "La fecha hasta no puede ser posterior al día actual.")
    if fecha_desde is not None and fecha_hasta is not None and fecha_desde > fecha_hasta:
        raise ErrorHandler(ErrorType.BAD_REQUEST, "La fecha desde no puede ser posterior a la fecha hasta.")


def validate_positive_id(value: Optional[int], field_name: str = "sede") -> None:
    if value is not None and value <= 0:
        raise ErrorHandler(ErrorType.BAD_REQUEST, f"El identificador de {field_name} debe ser positivo.")
