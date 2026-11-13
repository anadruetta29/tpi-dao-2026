from app.application.service.prestamo_service_i import PrestamoServiceI
from app.application.use_case.prestamo import (
    CreatePrestamoUseCase,
    GetAllPrestamosUseCase,
    GetPrestamoByIdUseCase,
)
from app.presentation.dto.prestamo.mapper import PrestamoMapper
from app.presentation.dto.prestamo.request import (
    CreatePrestamoReq,
    GetAllPrestamosReq,
    GetPrestamoByIdReq,
)
from app.presentation.dto.prestamo.response import GetAllPrestamosRes, PrestamoRes


class PrestamoService(PrestamoServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllPrestamosUseCase,
        get_by_id_use_case: GetPrestamoByIdUseCase,
        create_use_case: CreatePrestamoUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case

    def get_all(self, dto: GetAllPrestamosReq) -> GetAllPrestamosRes:
        result = self.get_all_use_case.execute(
            GetAllPrestamosUseCase.Command(
                token=dto.get_token(),
                socio_id=dto.get_socio_id(),
                sede_id=dto.get_sede_id(),
                estado=dto.get_estado(),
            )
        )
        return PrestamoMapper.to_get_all_response(result.prestamos)

    def get_by_id(self, dto: GetPrestamoByIdReq) -> PrestamoRes:
        result = self.get_by_id_use_case.execute(
            GetPrestamoByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return PrestamoMapper.to_response(result.prestamo)

    def create(self, dto: CreatePrestamoReq) -> PrestamoRes:
        result = self.create_use_case.execute(
            CreatePrestamoUseCase.Command(
                token=dto.get_token(),
                solicitud_id=dto.get_solicitud_id(),
                modalidad=dto.get_modalidad(),
                fechaInicio=dto.get_fecha_inicio(),
                fechaVencimiento=dto.get_fecha_vencimiento(),
            )
        )
        return PrestamoMapper.to_response(result.prestamo)
