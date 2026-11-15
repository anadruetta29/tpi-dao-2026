from typing import Any, List, Optional
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


def parse_ejemplar_ids(raw: Any) -> Optional[List[int]]:
    if raw is None:
        return None
    if not isinstance(raw, list) or not raw or any(
        type(value) is not int or value <= 0 for value in raw
    ):
        raise ErrorHandler(ErrorType.BAD_REQUEST, "Seleccioná al menos un ejemplar válido.")
    if len(set(raw)) != len(raw):
        raise ErrorHandler(ErrorType.BAD_REQUEST, "El mismo ejemplar no puede aparecer dos veces.")
    return raw
