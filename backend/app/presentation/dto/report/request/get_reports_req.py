from datetime import date
from typing import Optional


class GetMovimientoSedesReportReq:
    def __init__(
        self,
        token: Optional[str],
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
    ) -> None:
        self._token = token
        self._fecha_desde = fecha_desde
        self._fecha_hasta = fecha_hasta
        self._sede_origen_id = sede_origen_id
        self._sede_destino_id = sede_destino_id

    @staticmethod
    def build(
        token: Optional[str],
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
    ) -> "GetMovimientoSedesReportReq":
        return GetMovimientoSedesReportReq(
            token=token,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
        )

    def get_token(self) -> Optional[str]:
        return self._token

    def get_fecha_desde(self) -> Optional[date]:
        return self._fecha_desde

    def get_fecha_hasta(self) -> Optional[date]:
        return self._fecha_hasta

    def get_sede_origen_id(self) -> Optional[int]:
        return self._sede_origen_id

    def get_sede_destino_id(self) -> Optional[int]:
        return self._sede_destino_id


class GetLogisticaIncidenciasReportReq:
    def __init__(
        self,
        token: Optional[str],
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        sede_origen_id: Optional[int] = None,
    ) -> None:
        self._token = token
        self._fecha_desde = fecha_desde
        self._fecha_hasta = fecha_hasta
        self._sede_origen_id = sede_origen_id

    @staticmethod
    def build(
        token: Optional[str],
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        sede_origen_id: Optional[int] = None,
    ) -> "GetLogisticaIncidenciasReportReq":
        return GetLogisticaIncidenciasReportReq(
            token=token,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            sede_origen_id=sede_origen_id,
        )

    def get_token(self) -> Optional[str]:
        return self._token

    def get_fecha_desde(self) -> Optional[date]:
        return self._fecha_desde

    def get_fecha_hasta(self) -> Optional[date]:
        return self._fecha_hasta

    def get_sede_origen_id(self) -> Optional[int]:
        return self._sede_origen_id


class GetPrestamosVencidosMultasReportReq:
    def __init__(
        self,
        token: Optional[str],
        sede_id: Optional[int] = None,
    ) -> None:
        self._token = token
        self._sede_id = sede_id

    @staticmethod
    def build(
        token: Optional[str],
        sede_id: Optional[int] = None,
    ) -> "GetPrestamosVencidosMultasReportReq":
        return GetPrestamosVencidosMultasReportReq(token=token, sede_id=sede_id)

    def get_token(self) -> Optional[str]:
        return self._token

    def get_sede_id(self) -> Optional[int]:
        return self._sede_id


class GetLibrosInterbibliotecariosReportReq:
    def __init__(
        self,
        token: Optional[str],
        sede_destino_id: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> None:
        self._token = token
        self._sede_destino_id = sede_destino_id
        self._limit = limit

    @staticmethod
    def build(
        token: Optional[str],
        sede_destino_id: Optional[int] = None,
        limit: Optional[int] = None,
    ) -> "GetLibrosInterbibliotecariosReportReq":
        return GetLibrosInterbibliotecariosReportReq(
            token=token,
            sede_destino_id=sede_destino_id,
            limit=limit,
        )

    def get_token(self) -> Optional[str]:
        return self._token

    def get_sede_destino_id(self) -> Optional[int]:
        return self._sede_destino_id

    def get_limit(self) -> Optional[int]:
        return self._limit
