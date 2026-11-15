from typing import Optional
from app.application.use_case.aviso.gestionar_avisos_use_case import GestionarAvisosUseCase
from app.presentation.dto.aviso.response.aviso_res import AvisoRes, GetAllAvisosRes


class AvisoService:
    def __init__(self, gestionar: GestionarAvisosUseCase) -> None:
        self.gestionar = gestionar

    def listar(self, token: Optional[str]) -> GetAllAvisosRes:
        return GetAllAvisosRes(avisos=[AvisoRes.model_validate(aviso) for aviso in self.gestionar.listar(token)])

    def marcar_leido(self, token: Optional[str], id: int) -> AvisoRes:
        return AvisoRes.model_validate(self.gestionar.marcar_leido(token, id))
