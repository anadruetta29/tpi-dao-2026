from typing import Optional
from app.application.service.aviso_service_i import AvisoServiceI
from app.application.use_case.aviso.get_all_avisos_use_case import GetAllAvisosUseCase
from app.application.use_case.aviso.marcar_aviso_leido_use_case import (
    MarcarAvisoLeidoUseCase,
)
from app.presentation.dto.aviso.response.aviso_res import AvisoRes, GetAllAvisosRes


class AvisoService(AvisoServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllAvisosUseCase,
        marcar_leido_use_case: MarcarAvisoLeidoUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.marcar_leido_use_case = marcar_leido_use_case

    def listar(self, token: Optional[str]) -> GetAllAvisosRes:
        result = self.get_all_use_case.execute(GetAllAvisosUseCase.Command(token=token))
        return GetAllAvisosRes(
            avisos=[AvisoRes.model_validate(aviso) for aviso in result.avisos]
        )

    def marcar_leido(self, token: Optional[str], id: int) -> AvisoRes:
        result = self.marcar_leido_use_case.execute(
            MarcarAvisoLeidoUseCase.Command(token=token, id=id)
        )
        return AvisoRes.model_validate(result.aviso)
