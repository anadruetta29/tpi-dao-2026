from app.application.service.reserva_service_i import ReservaServiceI
from app.application.use_case.reserva import (
    CreateReservaUseCase,
    GetAllReservasUseCase,
    GetReservaByIdUseCase,
    UpdateReservaEstadoUseCase,
)
from app.presentation.dto.reserva.mapper import ReservaMapper
from app.presentation.dto.reserva.request import (
    CreateReservaReq,
    GetAllReservasReq,
    GetReservaByIdReq,
    UpdateReservaEstadoReq,
)
from app.presentation.dto.reserva.response import GetAllReservasRes, ReservaRes


class ReservaService(ReservaServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllReservasUseCase,
        get_by_id_use_case: GetReservaByIdUseCase,
        create_use_case: CreateReservaUseCase,
        update_estado_use_case: UpdateReservaEstadoUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case
        self.update_estado_use_case = update_estado_use_case

    def get_all(self, dto: GetAllReservasReq) -> GetAllReservasRes:
        result = self.get_all_use_case.execute(
            GetAllReservasUseCase.Command(
                token=dto.get_token(),
                libro_id=dto.get_libro_id(),
                socio_id=dto.get_socio_id(),
                sede_id=dto.get_sede_id(),
                estado=dto.get_estado(),
            )
        )
        return ReservaMapper.to_get_all_response(result.reservas)

    def get_by_id(self, dto: GetReservaByIdReq) -> ReservaRes:
        result = self.get_by_id_use_case.execute(
            GetReservaByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return ReservaMapper.to_response(result.reserva)

    def create(self, dto: CreateReservaReq) -> ReservaRes:
        result = self.create_use_case.execute(
            CreateReservaUseCase.Command(
                token=dto.get_token(),
                socio_id=dto.get_socio_id(),
                libro_id=dto.get_libro_id(),
                sede_id=dto.get_sede_id(),
                ejemplar_id=dto.get_ejemplar_id(),
                fecha=dto.get_fecha(),
            )
        )
        return ReservaMapper.to_response(result.reserva)

    def update_estado(self, dto: UpdateReservaEstadoReq) -> ReservaRes:
        result = self.update_estado_use_case.execute(
            UpdateReservaEstadoUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                estado=dto.get_estado(),
            )
        )
        return ReservaMapper.to_response(result.reserva)
