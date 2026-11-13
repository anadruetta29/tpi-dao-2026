from app.application.service.solicitud_prestamo_service_i import SolicitudPrestamoServiceI
from app.application.use_case.solicitud_prestamo import (
    CreateSolicitudInterbibliotecariaUseCase,
    CreateSolicitudLocalUseCase,
    GetAllSolicitudesPrestamoUseCase,
    GetSolicitudPrestamoByIdUseCase,
    UpdateSolicitudEstadoUseCase,
)
from app.presentation.dto.solicitud_prestamo.mapper import SolicitudPrestamoMapper
from app.presentation.dto.solicitud_prestamo.request import (
    CreateSolicitudInterbibliotecariaReq,
    CreateSolicitudLocalReq,
    GetAllSolicitudesPrestamoReq,
    GetSolicitudPrestamoByIdReq,
    UpdateSolicitudEstadoReq,
)
from app.presentation.dto.solicitud_prestamo.response import (
    GetAllSolicitudesPrestamoRes,
    SolicitudPrestamoRes,
)


class SolicitudPrestamoService(SolicitudPrestamoServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllSolicitudesPrestamoUseCase,
        get_by_id_use_case: GetSolicitudPrestamoByIdUseCase,
        create_local_use_case: CreateSolicitudLocalUseCase,
        create_interbibliotecaria_use_case: CreateSolicitudInterbibliotecariaUseCase,
        update_estado_use_case: UpdateSolicitudEstadoUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_local_use_case = create_local_use_case
        self.create_interbibliotecaria_use_case = create_interbibliotecaria_use_case
        self.update_estado_use_case = update_estado_use_case

    def get_all(self, dto: GetAllSolicitudesPrestamoReq) -> GetAllSolicitudesPrestamoRes:
        result = self.get_all_use_case.execute(
            GetAllSolicitudesPrestamoUseCase.Command(
                token=dto.get_token(),
                tipo=dto.get_tipo(),
                estado=dto.get_estado(),
                sede_id=dto.get_sede_id(),
            )
        )
        return SolicitudPrestamoMapper.to_get_all_response(result.solicitudes)

    def get_by_id(self, dto: GetSolicitudPrestamoByIdReq) -> SolicitudPrestamoRes:
        result = self.get_by_id_use_case.execute(
            GetSolicitudPrestamoByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SolicitudPrestamoMapper.to_response(result.solicitud)

    def create_local(self, dto: CreateSolicitudLocalReq) -> SolicitudPrestamoRes:
        result = self.create_local_use_case.execute(
            CreateSolicitudLocalUseCase.Command(
                token=dto.get_token(),
                socio_id=dto.get_socio_id(),
                ejemplar_id=dto.get_ejemplar_id(),
                sede_origen_id=dto.get_sede_origen_id(),
            )
        )
        return SolicitudPrestamoMapper.to_response(result.solicitud)

    def create_interbibliotecaria(
        self, dto: CreateSolicitudInterbibliotecariaReq
    ) -> SolicitudPrestamoRes:
        result = self.create_interbibliotecaria_use_case.execute(
            CreateSolicitudInterbibliotecariaUseCase.Command(
                token=dto.get_token(),
                socio_id=dto.get_socio_id(),
                ejemplar_id=dto.get_ejemplar_id(),
                sede_origen_id=dto.get_sede_origen_id(),
                sede_destino_id=dto.get_sede_destino_id(),
            )
        )
        return SolicitudPrestamoMapper.to_response(result.solicitud)

    def update_estado(self, dto: UpdateSolicitudEstadoReq) -> SolicitudPrestamoRes:
        result = self.update_estado_use_case.execute(
            UpdateSolicitudEstadoUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                estado=dto.get_estado(),
            )
        )
        return SolicitudPrestamoMapper.to_response(result.solicitud)
