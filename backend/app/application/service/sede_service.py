from app.application.service.sede_service_i import SedeServiceI
from app.application.use_case.sede import (
    CreateSedeUseCase,
    DeleteSedeUseCase,
    GetAllSedesUseCase,
    GetSedeByIdUseCase,
    UpdateSedeUseCase,
)
from app.presentation.dto.sede.mapper import SedeMapper
from app.presentation.dto.sede.request import (
    CreateSedeReq,
    DeleteSedeReq,
    GetAllSedesReq,
    GetSedeByIdReq,
    UpdateSedeReq,
)
from app.presentation.dto.sede.response import GetAllSedesRes, SedeRes


class SedeService(SedeServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllSedesUseCase,
        get_by_id_use_case: GetSedeByIdUseCase,
        create_use_case: CreateSedeUseCase,
        update_use_case: UpdateSedeUseCase,
        delete_use_case: DeleteSedeUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case
        self.update_use_case = update_use_case
        self.delete_use_case = delete_use_case

    def get_all(self, dto: GetAllSedesReq) -> GetAllSedesRes:
        result = self.get_all_use_case.execute(
            GetAllSedesUseCase.Command(token=dto.get_token(), estado=dto.get_estado())
        )
        return SedeMapper.to_get_all_response(result.sedes)

    def get_by_id(self, dto: GetSedeByIdReq) -> SedeRes:
        result = self.get_by_id_use_case.execute(
            GetSedeByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SedeMapper.to_response(result.sede)

    def create(self, dto: CreateSedeReq) -> SedeRes:
        result = self.create_use_case.execute(
            CreateSedeUseCase.Command(
                token=dto.get_token(),
                nombre=dto.get_nombre(),
                telefono=dto.get_telefono(),
                email=dto.get_email(),
                horarioAtencion=dto.get_horario_atencion(),
            )
        )
        return SedeMapper.to_response(result.sede)

    def update(self, dto: UpdateSedeReq) -> SedeRes:
        result = self.update_use_case.execute(
            UpdateSedeUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                nombre=dto.get_nombre(),
                telefono=dto.get_telefono(),
                email=dto.get_email(),
                horarioAtencion=dto.get_horario_atencion(),
            )
        )
        return SedeMapper.to_response(result.sede)

    def delete(self, dto: DeleteSedeReq) -> SedeRes:
        result = self.delete_use_case.execute(
            DeleteSedeUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SedeMapper.to_response(result.sede)
