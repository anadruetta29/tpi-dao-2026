from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.devolucion import Devolucion
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.rol import Rol
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllDevolucionesUseCase:
    def __init__(
        self,
        devolucion_repository: DevolucionRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        prestamo_repository: Optional[PrestamoRepositoryI] = None,
    ) -> None:
        self.devolucion_repository = devolucion_repository
        self.usuario_repository = usuario_repository
        self.prestamo_repository = prestamo_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        prestamo_id: Optional[int] = None
        estado_devuelto: Optional[EstadoEjemplar] = None
        socio_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        devoluciones: List[Devolucion]

    def execute(self, command: Command) -> Result:
        user = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        sede_id = user.sede_recepcionista()
        devoluciones = (
            self.devolucion_repository.get_all_by_sede(sede_id) if sede_id is not None
            else self.devolucion_repository.get_all()
        )
        if command.prestamo_id is not None:
            devoluciones = [d for d in devoluciones if d.prestamo_id == command.prestamo_id]
        if command.socio_id is not None and self.prestamo_repository is not None:
            prestamos_socio = self.prestamo_repository.get_all_filtered(
                socio_id=command.socio_id,
                sede_recepcionista_id=sede_id,
            )
            prestamo_ids = {p.id for p in prestamos_socio if p.id is not None}
            devoluciones = [d for d in devoluciones if d.prestamo_id in prestamo_ids]
        if command.estado_devuelto is not None:
            devoluciones = [d for d in devoluciones if d.estadoDevuelto == command.estado_devuelto]
        return GetAllDevolucionesUseCase.Result(devoluciones=devoluciones)
