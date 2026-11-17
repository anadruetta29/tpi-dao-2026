from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Optional, Set
from app.application.use_case.report._date_utils import validate_positive_id
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.rol import Rol
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.report.libros_interbibliotecarios_report import (
    LibroInterbibliotecarioItem,
    LibrosInterbibliotecariosReport,
)
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetLibrosInterbibliotecariosReportUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        libro_repository: LibroRepositoryI,
        autor_repository: AutorRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.ejemplar_repository = ejemplar_repository
        self.libro_repository = libro_repository
        self.autor_repository = autor_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        sede_destino_id: Optional[int] = None
        limit: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        report: LibrosInterbibliotecariosReport

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        validate_positive_id(command.sede_destino_id, "sede solicitante")
        if command.limit is not None and command.limit <= 0:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "El límite debe ser mayor a cero.")

        solicitudes = self.solicitud_repository.get_all_filtered(
            tipo=TipoPrestamo.INTERBIBLIOTECARIO,
        )
        if command.sede_destino_id is not None:
            solicitudes = [s for s in solicitudes if s.sede_destino_id == command.sede_destino_id]
        ejemplares = {e.id: e for e in self.ejemplar_repository.get_all() if e.id is not None}
        libros = {l.id: l for l in self.libro_repository.get_all() if l.id is not None}
        autores = {
            a.id: f"{a.nombre or ''} {a.apellido or ''}".strip()
            for a in self.autor_repository.get_all()
            if a.id is not None
        }
        sedes = {s.id: (s.nombre or f"Sede #{s.id}") for s in self.sede_repository.get_all() if s.id is not None}

        stats: Dict[int, Dict] = defaultdict(
            lambda: {
                "total": 0,
                "aprobadas": 0,
                "pendientes": 0,
                "rechazadas": 0,
                "canceladas": 0,
                "sedes": set(),
            }
        )

        aprobadas_globales = 0
        for sol in solicitudes:
            if sol.estado == EstadoSolicitud.APROBADA:
                aprobadas_globales += 1

            libros_en_solicitud: Set[int] = set()
            for ej_id in sol.ejemplar_ids or []:
                ej = ejemplares.get(ej_id)
                if ej and ej.libro_id is not None:
                    libros_en_solicitud.add(ej.libro_id)

            sede_solicitante = (
                sedes.get(sol.sede_destino_id, f"Sede #{sol.sede_destino_id}")
                if sol.sede_destino_id is not None
                else None
            )

            for libro_id in libros_en_solicitud:
                item = stats[libro_id]
                item["total"] += 1
                if sol.estado == EstadoSolicitud.APROBADA:
                    item["aprobadas"] += 1
                elif sol.estado == EstadoSolicitud.PENDIENTE:
                    item["pendientes"] += 1
                elif sol.estado == EstadoSolicitud.RECHAZADA:
                    item["rechazadas"] += 1
                elif sol.estado == EstadoSolicitud.CANCELADA:
                    item["canceladas"] += 1
                if sede_solicitante:
                    item["sedes"].add(sede_solicitante)

        items: List[LibroInterbibliotecarioItem] = []
        for libro_id, data in stats.items():
            libro = libros.get(libro_id)
            autores_libro = [
                autores[a_id]
                for a_id in (libro.autor_ids if libro else [])
                if a_id in autores and autores[a_id]
            ]
            total = data["total"]
            aprobadas = data["aprobadas"]
            items.append(
                LibroInterbibliotecarioItem(
                    libro_id=libro_id,
                    titulo=(libro.titulo if libro and libro.titulo else f"Libro #{libro_id}"),
                    editorial=(libro.editorial if libro and libro.editorial else ""),
                    autores=autores_libro,
                    total_solicitudes=total,
                    aprobadas=aprobadas,
                    pendientes=data["pendientes"],
                    rechazadas=data["rechazadas"],
                    canceladas=data["canceladas"],
                    tasa_aprobacion_porcentaje=round((aprobadas / total) * 100.0, 2) if total > 0 else 0.0,
                    sedes_solicitantes=sorted(data["sedes"]),
                )
            )

        items.sort(key=lambda i: (-i.total_solicitudes, -i.aprobadas, i.titulo))
        total_distintos = len(items)
        if command.limit is not None and command.limit > 0:
            items = items[: command.limit]

        total_sol = len(solicitudes)
        report = LibrosInterbibliotecariosReport(
            total_solicitudes_interbibliotecarias=total_sol,
            total_libros_distintos=total_distintos,
            tasa_aprobacion_global_porcentaje=(
                round((aprobadas_globales / total_sol) * 100.0, 2) if total_sol > 0 else 0.0
            ),
            libros=items,
        )
        return GetLibrosInterbibliotecariosReportUseCase.Result(report=report)
