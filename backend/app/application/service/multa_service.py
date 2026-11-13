from app.application.service.multa_service_i import MultaServiceI
from app.application.use_case.multa import (
    AnularMultaUseCase,
    CreateMultaUseCase,
    GetAllMultasUseCase,
    GetMultaByIdUseCase,
    PagarMultaUseCase,
)
from app.presentation.dto.multa.mapper import MultaMapper
from app.presentation.dto.multa.request import (
    CreateMultaReq,
    GetAllMultasReq,
    GetMultaByIdReq,
    MultaActionReq,
)
from app.presentation.dto.multa.response import GetAllMultasRes, MultaRes


class MultaService(MultaServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllMultasUseCase,
        get_by_id_use_case: GetMultaByIdUseCase,
        create_use_case: CreateMultaUseCase,
        pagar_use_case: PagarMultaUseCase,
        anular_use_case: AnularMultaUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.create_use_case = create_use_case
        self.pagar_use_case = pagar_use_case
        self.anular_use_case = anular_use_case

    def get_all(self, dto: GetAllMultasReq) -> GetAllMultasRes:
        result = self.get_all_use_case.execute(
            GetAllMultasUseCase.Command(
                token=dto.get_token(),
                socio_id=dto.get_socio_id(),
                estado=dto.get_estado(),
            )
        )
        return MultaMapper.to_get_all_response(result.multas)

    def get_by_id(self, dto: GetMultaByIdReq) -> MultaRes:
        result = self.get_by_id_use_case.execute(
            GetMultaByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return MultaMapper.to_response(result.multa)

    def create(self, dto: CreateMultaReq) -> MultaRes:
        result = self.create_use_case.execute(
            CreateMultaUseCase.Command(
                token=dto.get_token(),
                socio_id=dto.get_socio_id(),
                prestamo_id=dto.get_prestamo_id(),
                motivo=dto.get_motivo(),
                monto=dto.get_monto(),
            )
        )
        return MultaMapper.to_response(result.multa)

    def pagar(self, dto: MultaActionReq) -> MultaRes:
        result = self.pagar_use_case.execute(
            PagarMultaUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                fechaPago=dto.get_fecha_pago(),
            )
        )
        return MultaMapper.to_response(result.multa)

    def anular(self, dto: MultaActionReq) -> MultaRes:
        result = self.anular_use_case.execute(
            AnularMultaUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return MultaMapper.to_response(result.multa)
