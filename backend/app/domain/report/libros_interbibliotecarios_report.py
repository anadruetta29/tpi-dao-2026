from typing import List, Optional


class LibroInterbibliotecarioItem:
    def __init__(
        self,
        libro_id: int,
        titulo: str,
        editorial: str = "",
        autores: Optional[List[str]] = None,
        total_solicitudes: int = 0,
        aprobadas: int = 0,
        pendientes: int = 0,
        rechazadas: int = 0,
        canceladas: int = 0,
        tasa_aprobacion_porcentaje: float = 0.0,
        sedes_solicitantes: Optional[List[str]] = None,
    ) -> None:
        self.libro_id = libro_id
        self.titulo = titulo
        self.editorial = editorial
        self.autores = autores if autores is not None else []
        self.total_solicitudes = total_solicitudes
        self.aprobadas = aprobadas
        self.pendientes = pendientes
        self.rechazadas = rechazadas
        self.canceladas = canceladas
        self.tasa_aprobacion_porcentaje = tasa_aprobacion_porcentaje
        self.sedes_solicitantes = sedes_solicitantes if sedes_solicitantes is not None else []


class LibrosInterbibliotecariosReport:
    def __init__(
        self,
        total_solicitudes_interbibliotecarias: int = 0,
        total_libros_distintos: int = 0,
        tasa_aprobacion_global_porcentaje: float = 0.0,
        libros: Optional[List[LibroInterbibliotecarioItem]] = None,
    ) -> None:
        self.total_solicitudes_interbibliotecarias = total_solicitudes_interbibliotecarias
        self.total_libros_distintos = total_libros_distintos
        self.tasa_aprobacion_global_porcentaje = tasa_aprobacion_global_porcentaje
        self.libros = libros if libros is not None else []
