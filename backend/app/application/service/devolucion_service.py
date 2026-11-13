from app.application.service.devolucion_service_i import DevolucionServiceI
from app.application.use_case.devolucion import (
    CreateDevolucionUseCase,
    GetAllDevolucionesUseCase,
    GetDevolucionByIdUseCase,
)
from app.presentation.dto.devolucion.mapper import DevolucionMapper
from app.presentation.dto.devolucion.request import (
    CreateDevolucionReq,
    GetAllDevolucionesReq,
    GetDevolucionByIdReq,
)
from app.presentation.dto.devolucion.response import DevolucionRes, GetAllDevolucionesRes


class DevolucionService(DevolucionServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllDevolucionesUseCase,
        get_by_id_use_case: GetDevolucionByIdUseCase,
        create_use_case: CreateDevolucionUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case

    def get_all(self, dto: GetAllDevolucionesReq) -> GetAllDevolucionesRes:
        result = self.get_all_use_case.execute(
            GetAllDevolucionesUseCase.Command(token=dto.get_token())
        )
        return DevolucionMapper.to_get_all_response(result.devoluciones)

    def get_by_id(self, dto: GetDevolucionByIdReq) -> DevolucionRes:
        result = self.get_by_id_use_case.execute(
            GetDevolucionByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return DevolucionMapper.to_response(result.devolucion)

    def create(self, dto: CreateDevolucionReq) -> DevolucionRes:
        result = self.create_use_case.execute(
            CreateDevolucionUseCase.Command(
                token=dto.get_token(),
                prestamo_id=dto.get_prestamo_id(),
                fecha=dto.get_fecha(),
                observaciones=dto.get_observaciones(),
                estadoDevuelto=dto.get_estado_devuelto(),
            )
        )
        return DevolucionMapper.to_response(result.devolucion)
