from app.application.service.usuario_service_i import UsuarioServiceI
from app.application.use_case.usuario import (
    CreateUsuarioUseCase,
    GetAllUsuariosUseCase,
    GetUsuarioByIdUseCase,
    UpdateUsuarioUseCase,
)
from app.presentation.dto.usuario.mapper import UsuarioMapper
from app.presentation.dto.usuario.request import (
    CreateUsuarioReq,
    GetAllUsuariosReq,
    GetUsuarioByIdReq,
    UpdateUsuarioReq,
)
from app.presentation.dto.usuario.response import GetAllUsuariosRes, UsuarioRes


class UsuarioService(UsuarioServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllUsuariosUseCase,
        get_by_id_use_case: GetUsuarioByIdUseCase,
        create_use_case: CreateUsuarioUseCase,
        update_use_case: UpdateUsuarioUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case
        self.update_use_case = update_use_case

    def get_all(self, dto: GetAllUsuariosReq) -> GetAllUsuariosRes:
        result = self.get_all_use_case.execute(
            GetAllUsuariosUseCase.Command(
                token=dto.get_token(),
                role=dto.get_role(),
                activo=dto.get_activo(),
            )
        )
        return UsuarioMapper.to_get_all_response(result.usuarios)

    def get_by_id(self, dto: GetUsuarioByIdReq) -> UsuarioRes:
        result = self.get_by_id_use_case.execute(
            GetUsuarioByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return UsuarioMapper.to_response(result.usuario)

    def create(self, dto: CreateUsuarioReq) -> UsuarioRes:
        result = self.create_use_case.execute(
            CreateUsuarioUseCase.Command(
                token=dto.get_token(),
                nombre=dto.get_nombre(),
                apellido=dto.get_apellido(),
                email=dto.get_email(),
                password=dto.get_password(),
                role=dto.get_role(),
            )
        )
        return UsuarioMapper.to_response(result.usuario)

    def update(self, dto: UpdateUsuarioReq) -> UsuarioRes:
        result = self.update_use_case.execute(
            UpdateUsuarioUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                nombre=dto.get_nombre(),
                apellido=dto.get_apellido(),
                email=dto.get_email(),
                password=dto.get_password(),
                activo=dto.get_activo(),
                role=dto.get_role(),
            )
        )
        return UsuarioMapper.to_response(result.usuario)
