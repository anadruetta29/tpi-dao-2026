from app.application.service.remito_service_i import RemitoServiceI
from app.application.use_case.remito import (
    CreateRemitoUseCase,
    DespachoRemitoUseCase,
    GetAllRemitosUseCase,
    GetRemitoByIdUseCase,
    GetRemitoTrazabilidadUseCase,
    RecepcionRemitoUseCase,
)
from app.presentation.dto.remito.mapper import RemitoMapper
from app.presentation.dto.remito.request import (
    CreateRemitoReq,
    DespachoRemitoReq,
    GetAllRemitosReq,
    GetRemitoByIdReq,
    RecepcionRemitoReq,
)
from app.presentation.dto.remito.response import (
    GetAllRemitosRes,
    GetRemitoTrazabilidadRes,
    RemitoRes,
)


class RemitoService(RemitoServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllRemitosUseCase,
        get_by_id_use_case: GetRemitoByIdUseCase,
        create_use_case: CreateRemitoUseCase,
        despacho_use_case: DespachoRemitoUseCase,
        recepcion_use_case: RecepcionRemitoUseCase,
        trazabilidad_use_case: GetRemitoTrazabilidadUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case
        self.despacho_use_case = despacho_use_case
        self.recepcion_use_case = recepcion_use_case
        self.trazabilidad_use_case = trazabilidad_use_case

    def get_all(self, dto: GetAllRemitosReq) -> GetAllRemitosRes:
        result = self.get_all_use_case.execute(
            GetAllRemitosUseCase.Command(
                token=dto.get_token(),
                sede_origen_id=dto.get_sede_origen_id(),
                sede_destino_id=dto.get_sede_destino_id(),
                estado=dto.get_estado(),
            )
        )
        return RemitoMapper.to_get_all_response(result.remitos)

    def get_by_id(self, dto: GetRemitoByIdReq) -> RemitoRes:
        result = self.get_by_id_use_case.execute(
            GetRemitoByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return RemitoMapper.to_response(result.remito)

    def create(self, dto: CreateRemitoReq) -> RemitoRes:
        result = self.create_use_case.execute(
            CreateRemitoUseCase.Command(
                token=dto.get_token(),
                sede_origen_id=dto.get_sede_origen_id(),
                sede_destino_id=dto.get_sede_destino_id(),
                ejemplar_ids=dto.get_ejemplar_ids(),
                fechaEmision=dto.get_fecha_emision(),
            )
        )
        return RemitoMapper.to_response(result.remito)

    def despachar(self, dto: DespachoRemitoReq) -> RemitoRes:
        result = self.despacho_use_case.execute(
            DespachoRemitoUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                fechaDespacho=dto.get_fecha_despacho(),
            )
        )
        return RemitoMapper.to_response(result.remito)

    def recibir(self, dto: RecepcionRemitoReq) -> RemitoRes:
        result = self.recepcion_use_case.execute(
            RecepcionRemitoUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                fechaRecepcion=dto.get_fecha_recepcion(),
                con_incidencia=dto.get_con_incidencia(),
            )
        )
        return RemitoMapper.to_response(result.remito)

    def get_trazabilidad(self, dto: GetRemitoByIdReq) -> GetRemitoTrazabilidadRes:
        result = self.trazabilidad_use_case.execute(
            GetRemitoTrazabilidadUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return RemitoMapper.to_trazabilidad_response(result.remito_id, result.historial)
