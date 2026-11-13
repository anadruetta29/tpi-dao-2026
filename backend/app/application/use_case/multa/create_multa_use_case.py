from dataclasses import dataclass
from datetime import date
from typing import Optional
from app.application.strategy.calculo_multa.core.calculo_multa_strategy_factory import (
    CalculoMultaStrategyFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.multa import Multa
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateMultaUseCase:
    def __init__(
        self,
        multa_repository: MultaRepositoryI,
        socio_repository: SocioRepositoryI,
        prestamo_repository: PrestamoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        calculo_multa_factory: Optional[CalculoMultaStrategyFactory] = None,
    ) -> None:
        self.multa_repository = multa_repository
        self.socio_repository = socio_repository
        self.prestamo_repository = prestamo_repository
        self.usuario_repository = usuario_repository
        self.calculo_multa_factory = calculo_multa_factory or CalculoMultaStrategyFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int]
        prestamo_id: Optional[int]
        motivo: Optional[MotivoMulta]
        monto: Optional[float]

    @dataclass(frozen=True)
    class Result:
        multa: Multa

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.socio_id is None or command.motivo is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        socio = self.socio_repository.get_by_id(command.socio_id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)

        prestamo = None
        if command.prestamo_id is not None:
            prestamo = self.prestamo_repository.get_by_id(command.prestamo_id)
            if prestamo is None:
                raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)

        monto = command.monto
        if monto is None:
            dias_atraso = 1
            if prestamo is not None and prestamo.fechaVencimiento is not None:
                dias_atraso = max(1, (date.today() - prestamo.fechaVencimiento).days)
            monto = self.calculo_multa_factory.get_strategy(command.motivo).calcular_monto(
                dias_atraso=dias_atraso
            )

        multa = Multa(
            fechaEmision=date.today(),
            motivo=command.motivo,
            monto=monto,
            estado=EstadoMulta.PENDIENTE,
            socio_id=command.socio_id,
            prestamo_id=command.prestamo_id,
        )
        saved = self.multa_repository.save(multa)

        socio.estado = EstadoSocio.INHABILITADO
        self.socio_repository.update(socio.id, socio)

        return CreateMultaUseCase.Result(multa=saved)
