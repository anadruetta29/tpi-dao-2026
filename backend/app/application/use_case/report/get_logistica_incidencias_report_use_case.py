from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Optional
from app.application.use_case.report._date_utils import as_date, validate_date_range, validate_positive_id
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.rol import Rol
from app.domain.report.logistica_incidencias_report import (
    IncidenciaDetalle,
    IncidenciaPorEstado,
    LogisticaIncidenciasReport,
    LogisticaSedeResumen,
)
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


def _porcentaje(parte: int, total: int) -> float:
    return round((parte / total) * 100.0, 2) if total > 0 else 0.0


class GetLogisticaIncidenciasReportUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        sede_repository: SedeRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.remito_repository = remito_repository
        self.sede_repository = sede_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        fecha_desde: Optional[date] = None
        fecha_hasta: Optional[date] = None
        sede_origen_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        report: LogisticaIncidenciasReport

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        validate_date_range(command.fecha_desde, command.fecha_hasta)
        validate_positive_id(command.sede_origen_id, "sede de origen")

        remitos = self.remito_repository.get_all_filtered(sede_origen_id=command.sede_origen_id)
        sedes = {s.id: (s.nombre or f"Sede #{s.id}") for s in self.sede_repository.get_all() if s.id is not None}
        ejemplares = {e.id: e for e in self.ejemplar_repository.get_all() if e.id is not None}

        filtrados = []
        for remito in remitos:
            fecha_ref = as_date(remito.fechaEmision) or as_date(remito.fechaDespacho)
            if command.fecha_desde is not None and (fecha_ref is None or fecha_ref < command.fecha_desde):
                continue
            if command.fecha_hasta is not None and (fecha_ref is None or fecha_ref > command.fecha_hasta):
                continue
            filtrados.append(remito)

        exitosos = sum(1 for r in filtrados if r.estado_actual == EstadoEnvio.RECIBIDO)
        con_incidencia = sum(1 for r in filtrados if r.estado_actual == EstadoEnvio.CON_INCIDENCIA)
        finalizados = exitosos + con_incidencia
        en_curso = len(filtrados) - finalizados

        conteo_estados: Counter[EstadoEjemplar] = Counter()
        incidencias_detalle: List[IncidenciaDetalle] = []
        por_sede_grupo: Dict[int, List] = defaultdict(list)

        for remito in filtrados:
            if remito.sede_origen_id is not None:
                por_sede_grupo[remito.sede_origen_id].append(remito)
            for inc in remito.incidencias or []:
                estado_inc = inc.estado or EstadoEjemplar.EN_REVISION
                conteo_estados[estado_inc] += 1
                ej = ejemplares.get(inc.ejemplar_id) if inc.ejemplar_id is not None else None
                incidencias_detalle.append(
                    IncidenciaDetalle(
                        remito_id=remito.id or 0,
                        remito_numero=remito.numero or f"#{remito.id}",
                        sede_origen_nombre=sedes.get(remito.sede_origen_id, f"Sede #{remito.sede_origen_id}"),
                        sede_destino_nombre=sedes.get(remito.sede_destino_id, f"Sede #{remito.sede_destino_id}"),
                        ejemplar_id=inc.ejemplar_id or 0,
                        ejemplar_codigo=(ej.codigo if ej and ej.codigo else f"#{inc.ejemplar_id}"),
                        estado=estado_inc,
                        observacion=inc.observacion or "",
                    )
                )

        incidencias_por_estado = [
            IncidenciaPorEstado(estado=estado, cantidad=cantidad)
            for estado, cantidad in conteo_estados.most_common()
        ]

        por_sede_origen: List[LogisticaSedeResumen] = []
        for sede_id, grupo in por_sede_grupo.items():
            s_exitosos = sum(1 for r in grupo if r.estado_actual == EstadoEnvio.RECIBIDO)
            s_incidencia = sum(1 for r in grupo if r.estado_actual == EstadoEnvio.CON_INCIDENCIA)
            s_finalizados = s_exitosos + s_incidencia
            por_sede_origen.append(
                LogisticaSedeResumen(
                    sede_id=sede_id,
                    sede_nombre=sedes.get(sede_id, f"Sede #{sede_id}"),
                    total_envios=len(grupo),
                    exitosos=s_exitosos,
                    con_incidencia=s_incidencia,
                    en_curso=len(grupo) - s_finalizados,
                    tasa_exito_porcentaje=_porcentaje(s_exitosos, s_finalizados),
                    tasa_incidencia_porcentaje=_porcentaje(s_incidencia, s_finalizados),
                )
            )
        por_sede_origen.sort(key=lambda s: (-s.total_envios, s.sede_nombre))
        incidencias_detalle.sort(key=lambda d: -d.remito_id)

        report = LogisticaIncidenciasReport(
            total_remitos=len(filtrados),
            remitos_finalizados=finalizados,
            remitos_exitosos=exitosos,
            remitos_con_incidencia=con_incidencia,
            remitos_en_curso=en_curso,
            tasa_exito_porcentaje=_porcentaje(exitosos, finalizados),
            tasa_incidencia_porcentaje=_porcentaje(con_incidencia, finalizados),
            incidencias_por_estado=incidencias_por_estado,
            por_sede_origen=por_sede_origen,
            incidencias_recientes=incidencias_detalle,
        )
        return GetLogisticaIncidenciasReportUseCase.Result(report=report)
