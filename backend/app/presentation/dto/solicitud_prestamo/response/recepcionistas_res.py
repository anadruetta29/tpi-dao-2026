from pydantic import BaseModel


class RecepcionistaRes(BaseModel):
    id: int
    nombre: str
    apellido: str


class GetRecepcionistasRes(BaseModel):
    recepcionistas: list[RecepcionistaRes]
