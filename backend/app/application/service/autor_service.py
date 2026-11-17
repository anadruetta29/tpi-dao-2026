from app.application.service.autor_service_i import AutorServiceI
from app.application.use_case.autor import (
    CreateAutorUseCase,
    GetAllAutoresUseCase,
    UpdateAutorUseCase,
)
from app.presentation.dto.autor.mapper import AutorMapper
from app.presentation.dto.autor.request import (
    CreateAutorReq,
    GetAllAutoresReq,
    UpdateAutorReq,
)
from app.presentation.dto.autor.response import AutorRes, GetAllAutoresRes


class AutorService(AutorServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllAutoresUseCase,
        create_use_case: CreateAutorUseCase,
        update_use_case: UpdateAutorUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.create_use_case = create_use_case
        self.update_use_case = update_use_case

    def get_all(self, dto: GetAllAutoresReq) -> GetAllAutoresRes:
        result = self.get_all_use_case.execute(
            GetAllAutoresUseCase.Command(token=dto.get_token())
        )
        return AutorMapper.to_get_all_response(result.autores)

    def create(self, dto: CreateAutorReq) -> AutorRes:
        result = self.create_use_case.execute(
            CreateAutorUseCase.Command(
                token=dto.get_token(),
                nombre=dto.get_nombre(),
                apellido=dto.get_apellido(),
            )
        )
        return AutorMapper.to_response(result.autor)

    def update(self, dto: UpdateAutorReq) -> AutorRes:
        result = self.update_use_case.execute(
            UpdateAutorUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                nombre=dto.get_nombre(),
                apellido=dto.get_apellido(),
            )
        )
        return AutorMapper.to_response(result.autor)
