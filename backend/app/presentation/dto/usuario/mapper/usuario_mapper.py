from typing import Any, Dict, List, Optional
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.presentation.dto.usuario.request import (
    CreateUsuarioReq,
    GetAllUsuariosReq,
    GetUsuarioByIdReq,
    UpdateUsuarioReq,
)
from app.presentation.dto.usuario.response import GetAllUsuariosRes, UsuarioRes


class UsuarioMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        role: Optional[Rol] = None,
        activo: Optional[bool] = None,
    ) -> GetAllUsuariosReq:
        return GetAllUsuariosReq.build(token, role, activo)

    @staticmethod
    def to_get_all_response(usuarios: List[Usuario]) -> GetAllUsuariosRes:
        return GetAllUsuariosRes.from_domain_list(usuarios)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetUsuarioByIdReq:
        return GetUsuarioByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateUsuarioReq:
        return CreateUsuarioReq.build(token, payload)

    @staticmethod
    def to_update_request(token: Optional[str], id: int, payload: Dict[str, Any]) -> UpdateUsuarioReq:
        return UpdateUsuarioReq.build(token, id, payload)

    @staticmethod
    def to_response(usuario: Usuario) -> UsuarioRes:
        return UsuarioRes.from_domain(usuario)
