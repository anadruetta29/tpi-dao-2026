from typing import Callable, ContextManager, List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.aviso import Aviso
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GestionarAvisosUseCase:
    def __init__(
        self,
        avisos: AvisoRepositoryI,
        usuarios: UsuarioRepositoryI,
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.avisos = avisos
        self.usuarios = usuarios
        self.transaction = transaction

    def listar(self, token: Optional[str]) -> List[Aviso]:
        usuario = AuthHelper.authenticate(token, self.usuarios, Rol.ADMIN, Rol.RECEPCIONISTA)
        return self.avisos.listar(usuario.id, usuario.sede_recepcionista())

    def marcar_leido(self, token: Optional[str], id: int) -> Aviso:
        with self.transaction():
            usuario = AuthHelper.authenticate(token, self.usuarios, Rol.ADMIN, Rol.RECEPCIONISTA)
            aviso = self.avisos.marcar_leido(id, usuario.id, usuario.sede_recepcionista())
            if aviso is None:
                raise ErrorHandler(ErrorType.NOT_FOUND, "Aviso no encontrado.")
            return aviso
