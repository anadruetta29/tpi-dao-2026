from typing import Optional
from pydantic import BaseModel


class RecepcionistaRes(BaseModel):
    id: int
    nombre: str
    apellido: str
    sede_id: Optional[int] = None


class GetRecepcionistasRes(BaseModel):
    recepcionistas: list[RecepcionistaRes]
