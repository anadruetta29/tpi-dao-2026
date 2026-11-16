from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.rol import Rol
from app.domain.entity.tarifa_multa import TarifaMulta
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllTarifasMultaUseCase:
    def __init__(
        self,
        tarifa_multa_repository: TarifaMultaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.tarifa_multa_repository = tarifa_multa_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]

    @dataclass(frozen=True)
    class Result:
        tarifas: List[TarifaMulta]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        existentes = {item.motivo: item for item in self.tarifa_multa_repository.get_all()}
        tarifas = [
            existentes.get(motivo) or TarifaMulta.default_para(motivo)
            for motivo in MotivoMulta
        ]
        return GetAllTarifasMultaUseCase.Result(tarifas=tarifas)
