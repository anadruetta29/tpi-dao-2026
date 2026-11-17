from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Optional
from app.application.use_case.report._date_utils import validate_positive_id
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.rol import Rol
from app.domain.report.prestamos_vencidos_multas_report import (
    MultaPorMotivoResumen,
    MultasSedeResumen,
    PrestamosVencidosMultasReport,
    PrestamoVencidoDetalle,
)
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetPrestamosVencidosMultasReportUseCase:
    def __init__(
        self,
        prestamo_repository: PrestamoRepositoryI,
        multa_repository: MultaRepositoryI,
        socio_repository: SocioRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.multa_repository = multa_repository
        self.socio_repository = socio_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        sede_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        report: PrestamosVencidosMultasReport

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        validate_positive_id(command.sede_id, "sede")

        hoy = date.today()
        prestamos = self.prestamo_repository.get_all()
        multas = self.multa_repository.get_all()
        socios = {s.id: s for s in self.socio_repository.get_all() if s.id is not None}
        sedes = {s.id: (s.nombre or f"Sede #{s.id}") for s in self.sede_repository.get_all() if s.id is not None}
        prestamos_by_id = {p.id: p for p in prestamos if p.id is not None}

        if command.sede_id is not None:
            prestamos = [p for p in prestamos if p.sede_id == command.sede_id]
            multas = [
                m for m in multas
                if m.prestamo_id is not None
                and prestamos_by_id.get(m.prestamo_id) is not None
                and prestamos_by_id[m.prestamo_id].sede_id == command.sede_id
            ]

        multa_pendiente_por_prestamo: Dict[int, float] = defaultdict(float)
        for m in multas:
            if m.prestamo_id is not None and m.estado == EstadoMulta.PENDIENTE:
                multa_pendiente_por_prestamo[m.prestamo_id] += float(m.monto or 0.0)

        vencidos_detalle: List[PrestamoVencidoDetalle] = []
        sede_vencidos_count: Dict[int, int] = defaultdict(int)

        for p in prestamos:
            es_vencido = p.estado == EstadoPrestamo.VENCIDO or (
                p.estado == EstadoPrestamo.ACTIVO and p.esta_vencido(hoy)
            )
            if not es_vencido:
                continue
            dias = p.dias_de_atraso(hoy)
            socio = socios.get(p.socio_id) if p.socio_id is not None else None
            socio_nombre = (
                f"{socio.nombre or ''} {socio.apellido or ''}".strip() if socio else f"Socio #{p.socio_id}"
            )
            sede_id = p.sede_id or 0
            sede_vencidos_count[sede_id] += 1
            vencidos_detalle.append(
                PrestamoVencidoDetalle(
                    prestamo_id=p.id or 0,
                    socio_id=p.socio_id or 0,
                    socio_nombre=socio_nombre or f"Socio #{p.socio_id}",
                    socio_documento=(socio.documento if socio and socio.documento else "—"),
                    sede_id=sede_id,
                    sede_nombre=sedes.get(sede_id, f"Sede #{sede_id}"),
                    fecha_inicio=p.fechaInicio,
                    fecha_vencimiento=p.fechaVencimiento,
                    dias_atraso=dias,
                    cantidad_ejemplares_pendientes=len(p.ejemplares_pendientes()),
                    multa_pendiente_monto=round(multa_pendiente_por_prestamo.get(p.id or 0, 0.0), 2),
                )
            )

        vencidos_detalle.sort(key=lambda d: (-d.dias_atraso, -d.multa_pendiente_monto))

        monto_pendiente = 0.0
        monto_pagado = 0.0
        monto_anulado = 0.0
        por_motivo_map: Dict[MotivoMulta, Dict[str, float]] = {}
        por_sede_multas: Dict[int, Dict[str, float]] = defaultdict(
            lambda: {"pendiente": 0.0, "pagado": 0.0, "anulado": 0.0}
        )

        for m in multas:
            monto = float(m.monto or 0.0)
            motivo = m.motivo or MotivoMulta.ENTREGA_TARDIA
            if motivo not in por_motivo_map:
                por_motivo_map[motivo] = {"cantidad": 0, "total": 0.0, "pendiente": 0.0, "pagado": 0.0}
            por_motivo_map[motivo]["cantidad"] += 1
            por_motivo_map[motivo]["total"] += monto

            p_rel = prestamos_by_id.get(m.prestamo_id) if m.prestamo_id is not None else None
            s_id = p_rel.sede_id if p_rel and p_rel.sede_id is not None else 0

            if m.estado == EstadoMulta.PENDIENTE:
                monto_pendiente += monto
                por_motivo_map[motivo]["pendiente"] += monto
                por_sede_multas[s_id]["pendiente"] += monto
            elif m.estado == EstadoMulta.PAGADA:
                monto_pagado += monto
                por_motivo_map[motivo]["pagado"] += monto
                por_sede_multas[s_id]["pagado"] += monto
            elif m.estado == EstadoMulta.ANULADA:
                monto_anulado += monto
                por_sede_multas[s_id]["anulado"] += monto

        por_motivo = [
            MultaPorMotivoResumen(
                motivo=motivo,
                cantidad=int(data["cantidad"]),
                monto_total=round(data["total"], 2),
                monto_pendiente=round(data["pendiente"], 2),
                monto_pagado=round(data["pagado"], 2),
            )
            for motivo, data in por_motivo_map.items()
        ]
        por_motivo.sort(key=lambda item: (-item.monto_total, item.motivo.value))

        sedes_involucradas = set(sede_vencidos_count.keys()) | set(por_sede_multas.keys())
        por_sede = [
            MultasSedeResumen(
                sede_id=s_id,
                sede_nombre=sedes.get(s_id, "Sin sede asignada" if s_id == 0 else f"Sede #{s_id}"),
                prestamos_vencidos=sede_vencidos_count.get(s_id, 0),
                monto_pendiente=round(por_sede_multas[s_id]["pendiente"], 2),
                monto_pagado=round(por_sede_multas[s_id]["pagado"], 2),
                monto_anulado=round(por_sede_multas[s_id]["anulado"], 2),
            )
            for s_id in sedes_involucradas
        ]
        por_sede.sort(key=lambda s: (-s.monto_pendiente, -s.prestamos_vencidos, s.sede_nombre))

        atrasos = [v.dias_atraso for v in vencidos_detalle]
        report = PrestamosVencidosMultasReport(
            total_prestamos_vencidos=len(vencidos_detalle),
            promedio_dias_atraso=round(sum(atrasos) / len(atrasos), 2) if atrasos else 0.0,
            max_dias_atraso=max(atrasos) if atrasos else 0,
            total_multas=len(multas),
            monto_total_multas=round(monto_pendiente + monto_pagado + monto_anulado, 2),
            monto_pendiente=round(monto_pendiente, 2),
            monto_pagado=round(monto_pagado, 2),
            monto_anulado=round(monto_anulado, 2),
            por_motivo=por_motivo,
            por_sede=por_sede,
            prestamos_vencidos=vencidos_detalle,
        )
        return GetPrestamosVencidosMultasReportUseCase.Result(report=report)
