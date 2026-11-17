from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Optional, Tuple
from app.application.use_case.report._date_utils import as_date, validate_date_range, validate_positive_id
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.rol import Rol
from app.domain.report.movimiento_sedes_report import MovimientoRuta, MovimientoSedesReport
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetMovimientoSedesReportUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.remito_repository = remito_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        fecha_desde: Optional[date] = None
        fecha_hasta: Optional[date] = None
        sede_origen_id: Optional[int] = None
        sede_destino_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        report: MovimientoSedesReport

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        validate_date_range(command.fecha_desde, command.fecha_hasta)
        validate_positive_id(command.sede_origen_id, "sede de origen")
        validate_positive_id(command.sede_destino_id, "sede de destino")

        remitos = self.remito_repository.get_all_filtered(
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=command.sede_destino_id,
        )
        sedes = {s.id: (s.nombre or f"Sede #{s.id}") for s in self.sede_repository.get_all() if s.id is not None}

        filtrados = []
        for remito in remitos:
            fecha_ref = as_date(remito.fechaEmision) or as_date(remito.fechaDespacho)
            if command.fecha_desde is not None and (fecha_ref is None or fecha_ref < command.fecha_desde):
                continue
            if command.fecha_hasta is not None and (fecha_ref is None or fecha_ref > command.fecha_hasta):
                continue
            if remito.sede_origen_id is None or remito.sede_destino_id is None:
                continue
            filtrados.append(remito)

        agrupados: Dict[Tuple[int, int], List] = defaultdict(list)
        for remito in filtrados:
            agrupados[(remito.sede_origen_id, remito.sede_destino_id)].append(remito)

        rutas: List[MovimientoRuta] = []
        tiempos_globales: List[int] = []
        total_ejemplares = 0

        for (origen_id, destino_id), grupo in agrupados.items():
            ejemplares_ruta = sum(len(r.ejemplar_ids or []) for r in grupo)
            total_ejemplares += ejemplares_ruta
            recibidos = sum(
                1 for r in grupo if r.estado_actual in (EstadoEnvio.RECIBIDO, EstadoEnvio.CON_INCIDENCIA)
            )
            en_transito = sum(
                1 for r in grupo if r.estado_actual in (EstadoEnvio.DESPACHADO, EstadoEnvio.EN_TRANSITO)
            )
            tiempos = [
                r.dias_transito()
                for r in grupo
                if r.fechaDespacho is not None and r.fechaRecepcion is not None
            ]
            tiempos_validos = [t for t in tiempos if t is not None]
            tiempos_globales.extend(tiempos_validos)

            rutas.append(
                MovimientoRuta(
                    sede_origen_id=origen_id,
                    sede_origen_nombre=sedes.get(origen_id, f"Sede #{origen_id}"),
                    sede_destino_id=destino_id,
                    sede_destino_nombre=sedes.get(destino_id, f"Sede #{destino_id}"),
                    cantidad_remitos=len(grupo),
                    cantidad_ejemplares=ejemplares_ruta,
                    remitos_recibidos=recibidos,
                    remitos_en_transito=en_transito,
                    tiempo_promedio_transito_dias=(
                        round(sum(tiempos_validos) / len(tiempos_validos), 2) if tiempos_validos else None
                    ),
                    tiempo_minimo_transito_dias=min(tiempos_validos) if tiempos_validos else None,
                    tiempo_maximo_transito_dias=max(tiempos_validos) if tiempos_validos else None,
                )
            )

        rutas.sort(key=lambda r: (-r.cantidad_remitos, -r.cantidad_ejemplares, r.sede_origen_nombre))

        report = MovimientoSedesReport(
            total_remitos=len(filtrados),
            total_ejemplares_movidos=total_ejemplares,
            tiempo_promedio_global_dias=(
                round(sum(tiempos_globales) / len(tiempos_globales), 2) if tiempos_globales else None
            ),
            rutas=rutas,
        )
        return GetMovimientoSedesReportUseCase.Result(report=report)
