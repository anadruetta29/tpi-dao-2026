from typing import Any, Dict, List, Optional
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.presentation.dto.reserva.request import (
    CreateReservaReq,
    GetAllReservasReq,
    GetReservaByIdReq,
    UpdateReservaEstadoReq,
)
from app.presentation.dto.reserva.response import GetAllReservasRes, ReservaRes


class ReservaMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        libro_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoReserva] = None,
    ) -> GetAllReservasReq:
        return GetAllReservasReq.build(token, libro_id, socio_id, sede_id, estado)

    @staticmethod
    def to_get_all_response(reservas: List[Reserva]) -> GetAllReservasRes:
        return GetAllReservasRes.from_domain_list(reservas)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetReservaByIdReq:
        return GetReservaByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateReservaReq:
        return CreateReservaReq.build(token, payload)

    @staticmethod
    def to_update_estado_request(
        token: Optional[str], id: int, payload: Dict[str, Any]
    ) -> UpdateReservaEstadoReq:
        return UpdateReservaEstadoReq.build(token, id, payload)

    @staticmethod
    def to_response(reserva: Reserva) -> ReservaRes:
        return ReservaRes.from_domain(reserva)
