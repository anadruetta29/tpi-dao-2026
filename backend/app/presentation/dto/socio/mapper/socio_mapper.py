from typing import Any, Dict, List, Optional
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.multa import Multa
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.socio import Socio
from app.presentation.dto.socio.request import (
    CreateSocioReq,
    DeleteSocioReq,
    GetAllSociosReq,
    GetSocioByIdReq,
    UpdateSocioReq,
)
from app.presentation.dto.socio.response import (
    GetAllSociosRes,
    GetSocioMultasRes,
    GetSocioPrestamosRes,
    SocioRes,
)


class SocioMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        q: Optional[str] = None,
        documento: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> GetAllSociosReq:
        return GetAllSociosReq.build(token, q, documento, estado)

    @staticmethod
    def to_get_all_response(socios: List[Socio]) -> GetAllSociosRes:
        return GetAllSociosRes.from_domain_list(socios)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetSocioByIdReq:
        return GetSocioByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateSocioReq:
        return CreateSocioReq.build(token, payload)

    @staticmethod
    def to_update_request(token: Optional[str], id: int, payload: Dict[str, Any]) -> UpdateSocioReq:
        return UpdateSocioReq.build(token, id, payload)

    @staticmethod
    def to_delete_request(token: Optional[str], id: int) -> DeleteSocioReq:
        return DeleteSocioReq.build(token, id)

    @staticmethod
    def to_response(socio: Socio) -> SocioRes:
        return SocioRes.from_domain(socio)

    @staticmethod
    def to_prestamos_response(socio_id: int, prestamos: List[Prestamo]) -> GetSocioPrestamosRes:
        return GetSocioPrestamosRes.from_domain_list(socio_id, prestamos)

    @staticmethod
    def to_multas_response(socio_id: int, multas: List[Multa]) -> GetSocioMultasRes:
        return GetSocioMultasRes.from_domain_list(socio_id, multas)
