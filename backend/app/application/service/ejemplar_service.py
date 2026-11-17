from app.application.service.ejemplar_service_i import EjemplarServiceI
from app.application.use_case.ejemplar import (
    CreateEjemplarUseCase,
    DeleteEjemplarUseCase,
    GetAllEjemplaresUseCase,
    GetEjemplarByIdUseCase,
    UpdateEjemplarEstadoUseCase,
)
from app.presentation.dto.ejemplar.mapper import EjemplarMapper
from app.presentation.dto.ejemplar.request import (
    CreateEjemplarReq,
    DeleteEjemplarReq,
    GetAllEjemplaresReq,
    GetEjemplarByIdReq,
    UpdateEjemplarEstadoReq,
)
from app.presentation.dto.ejemplar.response import EjemplarRes, GetAllEjemplaresRes


class EjemplarService(EjemplarServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllEjemplaresUseCase,
        get_by_id_use_case: GetEjemplarByIdUseCase,
        create_use_case: CreateEjemplarUseCase,
        update_estado_use_case: UpdateEjemplarEstadoUseCase,
        delete_use_case: DeleteEjemplarUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case
        self.update_estado_use_case = update_estado_use_case
        self.delete_use_case = delete_use_case

    def get_all(self, dto: GetAllEjemplaresReq) -> GetAllEjemplaresRes:
        result = self.get_all_use_case.execute(
            GetAllEjemplaresUseCase.Command(
                token=dto.get_token(),
                libro_id=dto.get_libro_id(),
                sede_id=dto.get_sede_id(),
                estado=dto.get_estado(),
            )
        )
        return EjemplarMapper.to_get_all_response(result.ejemplares)

    def get_by_id(self, dto: GetEjemplarByIdReq) -> EjemplarRes:
        result = self.get_by_id_use_case.execute(
            GetEjemplarByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return EjemplarMapper.to_response(result.ejemplar)

    def create(self, dto: CreateEjemplarReq) -> EjemplarRes:
        result = self.create_use_case.execute(
            CreateEjemplarUseCase.Command(
                token=dto.get_token(),
                codigo=dto.get_codigo(),
                libro_id=dto.get_libro_id(),
                sede_id=dto.get_sede_id(),
            )
        )
        return EjemplarMapper.to_response(result.ejemplar)

    def update_estado(self, dto: UpdateEjemplarEstadoReq) -> EjemplarRes:
        result = self.update_estado_use_case.execute(
            UpdateEjemplarEstadoUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                estado=dto.get_estado(),
            )
        )
        return EjemplarMapper.to_response(result.ejemplar)

    def delete(self, dto: DeleteEjemplarReq) -> None:
        self.delete_use_case.execute(
            DeleteEjemplarUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
