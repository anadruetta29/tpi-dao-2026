from fastapi import Depends
from sqlalchemy.orm import Session

from app.application.strategy import (
    CalculoMultaStrategyFactory,
    DevolucionEjemplarStrategyFactory,
    EjemplarEstadoStateFactory,
    MultaEstadoStateFactory,
    RemitoEstadoStateFactory,
    ReservaEstadoStateFactory,
    SolicitudEstadoStateFactory,
    SolicitudTipoStrategyFactory,
    VencimientoPrestamoStrategyFactory,
)
from app.application.service import (
    AuthService,
    AuthServiceI,
    AutorService,
    AutorServiceI,
    DevolucionService,
    DevolucionServiceI,
    EjemplarService,
    EjemplarServiceI,
    LibroService,
    LibroServiceI,
    MultaService,
    MultaServiceI,
    PrestamoService,
    PrestamoServiceI,
    RemitoService,
    RemitoServiceI,
    ReservaService,
    ReservaServiceI,
    SedeService,
    SedeServiceI,
    SocioService,
    SocioServiceI,
    SolicitudPrestamoService,
    SolicitudPrestamoServiceI,
    UsuarioService,
    UsuarioServiceI,
)
from app.application.use_case.auth import GetCurrentUserUseCase, LoginUseCase
from app.application.use_case.autor import CreateAutorUseCase, GetAllAutoresUseCase
from app.application.use_case.devolucion import (
    CreateDevolucionUseCase,
    GetAllDevolucionesUseCase,
    GetDevolucionByIdUseCase,
)
from app.application.use_case.ejemplar import (
    CreateEjemplarUseCase,
    GetAllEjemplaresUseCase,
    GetEjemplarByIdUseCase,
)
from app.application.use_case.libro import (
    CreateLibroUseCase,
    DeleteLibroUseCase,
    GetAllLibrosUseCase,
    GetLibroByIdUseCase,
    GetLibroDisponibilidadUseCase,
    UpdateLibroUseCase,
)
from app.application.use_case.multa import (
    AnularMultaUseCase,
    CreateMultaUseCase,
    GetAllMultasUseCase,
    GetMultaByIdUseCase,
    PagarMultaUseCase,
)
from app.application.use_case.prestamo import (
    CreatePrestamoUseCase,
    GetAllPrestamosUseCase,
    GetPrestamoByIdUseCase,
)
from app.application.use_case.remito import (
    CreateRemitoUseCase,
    DespachoRemitoUseCase,
    GetAllRemitosUseCase,
    GetRemitoByIdUseCase,
    GetRemitoTrazabilidadUseCase,
    RecepcionRemitoUseCase,
)
from app.application.use_case.reserva import (
    CreateReservaUseCase,
    GetAllReservasUseCase,
    GetReservaByIdUseCase,
    UpdateReservaEstadoUseCase,
)
from app.application.use_case.sede import (
    CreateSedeUseCase,
    DeleteSedeUseCase,
    GetAllSedesUseCase,
    GetSedeByIdUseCase,
    UpdateSedeUseCase,
)
from app.application.use_case.socio import (
    CreateSocioUseCase,
    DeleteSocioUseCase,
    GetAllSociosUseCase,
    GetSocioByIdUseCase,
    GetSocioMultasUseCase,
    GetSocioPrestamosUseCase,
    UpdateSocioUseCase,
)
from app.application.use_case.solicitud_prestamo import (
    CreateSolicitudInterbibliotecariaUseCase,
    CreateSolicitudLocalUseCase,
    GetAllSolicitudesPrestamoUseCase,
    GetSolicitudPrestamoByIdUseCase,
    UpdateSolicitudEstadoUseCase,
)
from app.application.use_case.usuario import (
    CreateUsuarioUseCase,
    GetAllUsuariosUseCase,
    GetUsuarioByIdUseCase,
    UpdateUsuarioUseCase,
)
from app.domain.repository import (
    AutorRepositoryI,
    DevolucionRepositoryI,
    EjemplarRepositoryI,
    HistorialEstadoRemitoRepositoryI,
    LibroRepositoryI,
    MultaRepositoryI,
    PrestamoRepositoryI,
    RemitoRepositoryI,
    ReservaRepositoryI,
    SedeRepositoryI,
    SocioRepositoryI,
    SolicitudPrestamoRepositoryI,
    UsuarioRepositoryI,
)
from app.infrastructure.database import get_db
from app.infrastructure.postgres.repository import (
    PostgresAutorRepository,
    PostgresDevolucionRepository,
    PostgresEjemplarRepository,
    PostgresHistorialEstadoRemitoRepository,
    PostgresLibroRepository,
    PostgresMultaRepository,
    PostgresPrestamoRepository,
    PostgresRemitoRepository,
    PostgresReservaRepository,
    PostgresSedeRepository,
    PostgresSocioRepository,
    PostgresSolicitudPrestamoRepository,
    PostgresUsuarioRepository,
)
from app.infrastructure.repository_adapter import (
    AutorRepositoryAdapter,
    DevolucionRepositoryAdapter,
    EjemplarRepositoryAdapter,
    HistorialEstadoRemitoRepositoryAdapter,
    LibroRepositoryAdapter,
    MultaRepositoryAdapter,
    PrestamoRepositoryAdapter,
    RemitoRepositoryAdapter,
    ReservaRepositoryAdapter,
    SedeRepositoryAdapter,
    SocioRepositoryAdapter,
    SolicitudPrestamoRepositoryAdapter,
    UsuarioRepositoryAdapter,
)


# --- Repository Providers ---
def get_usuario_repository(db: Session = Depends(get_db)) -> UsuarioRepositoryI:
    return UsuarioRepositoryAdapter(PostgresUsuarioRepository(db))


def get_sede_repository(db: Session = Depends(get_db)) -> SedeRepositoryI:
    return SedeRepositoryAdapter(PostgresSedeRepository(db))


def get_socio_repository(db: Session = Depends(get_db)) -> SocioRepositoryI:
    return SocioRepositoryAdapter(PostgresSocioRepository(db))


def get_autor_repository(db: Session = Depends(get_db)) -> AutorRepositoryI:
    return AutorRepositoryAdapter(PostgresAutorRepository(db))


def get_libro_repository(db: Session = Depends(get_db)) -> LibroRepositoryI:
    return LibroRepositoryAdapter(PostgresLibroRepository(db))


def get_ejemplar_repository(db: Session = Depends(get_db)) -> EjemplarRepositoryI:
    return EjemplarRepositoryAdapter(PostgresEjemplarRepository(db))


def get_solicitud_prestamo_repository(
    db: Session = Depends(get_db),
) -> SolicitudPrestamoRepositoryI:
    return SolicitudPrestamoRepositoryAdapter(PostgresSolicitudPrestamoRepository(db))


def get_prestamo_repository(db: Session = Depends(get_db)) -> PrestamoRepositoryI:
    return PrestamoRepositoryAdapter(PostgresPrestamoRepository(db))


def get_reserva_repository(db: Session = Depends(get_db)) -> ReservaRepositoryI:
    return ReservaRepositoryAdapter(PostgresReservaRepository(db))


def get_remito_repository(db: Session = Depends(get_db)) -> RemitoRepositoryI:
    return RemitoRepositoryAdapter(PostgresRemitoRepository(db))


def get_historial_estado_remito_repository(
    db: Session = Depends(get_db),
) -> HistorialEstadoRemitoRepositoryI:
    return HistorialEstadoRemitoRepositoryAdapter(PostgresHistorialEstadoRemitoRepository(db))


def get_devolucion_repository(db: Session = Depends(get_db)) -> DevolucionRepositoryI:
    return DevolucionRepositoryAdapter(PostgresDevolucionRepository(db))


def get_multa_repository(db: Session = Depends(get_db)) -> MultaRepositoryI:
    return MultaRepositoryAdapter(PostgresMultaRepository(db))


# --- Service Providers ---
def get_auth_service(
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> AuthServiceI:
    return AuthService(
        login_use_case=LoginUseCase(usuario_repo),
        get_current_user_use_case=GetCurrentUserUseCase(usuario_repo),
    )


def get_sede_service(
    sede_repo: SedeRepositoryI = Depends(get_sede_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> SedeServiceI:
    return SedeService(
        get_all_use_case=GetAllSedesUseCase(sede_repo, usuario_repo),
        get_by_id_use_case=GetSedeByIdUseCase(sede_repo, usuario_repo),
        create_use_case=CreateSedeUseCase(sede_repo, usuario_repo),
        update_use_case=UpdateSedeUseCase(sede_repo, usuario_repo),
        delete_use_case=DeleteSedeUseCase(sede_repo, usuario_repo),
    )


def get_usuario_service(
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> UsuarioServiceI:
    return UsuarioService(
        get_all_use_case=GetAllUsuariosUseCase(usuario_repo),
        get_by_id_use_case=GetUsuarioByIdUseCase(usuario_repo),
        create_use_case=CreateUsuarioUseCase(usuario_repo),
        update_use_case=UpdateUsuarioUseCase(usuario_repo),
    )


def get_socio_service(
    socio_repo: SocioRepositoryI = Depends(get_socio_repository),
    prestamo_repo: PrestamoRepositoryI = Depends(get_prestamo_repository),
    multa_repo: MultaRepositoryI = Depends(get_multa_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> SocioServiceI:
    return SocioService(
        get_all_use_case=GetAllSociosUseCase(socio_repo, usuario_repo),
        get_by_id_use_case=GetSocioByIdUseCase(socio_repo, usuario_repo),
        get_prestamos_use_case=GetSocioPrestamosUseCase(socio_repo, prestamo_repo, usuario_repo),
        get_multas_use_case=GetSocioMultasUseCase(socio_repo, multa_repo, usuario_repo),
        create_use_case=CreateSocioUseCase(socio_repo, usuario_repo),
        update_use_case=UpdateSocioUseCase(socio_repo, usuario_repo),
        delete_use_case=DeleteSocioUseCase(socio_repo, usuario_repo),
    )


def get_autor_service(
    autor_repo: AutorRepositoryI = Depends(get_autor_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> AutorServiceI:
    return AutorService(
        get_all_use_case=GetAllAutoresUseCase(autor_repo, usuario_repo),
        create_use_case=CreateAutorUseCase(autor_repo, usuario_repo),
    )


def get_libro_service(
    libro_repo: LibroRepositoryI = Depends(get_libro_repository),
    autor_repo: AutorRepositoryI = Depends(get_autor_repository),
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> LibroServiceI:
    return LibroService(
        get_all_use_case=GetAllLibrosUseCase(libro_repo, usuario_repo),
        get_by_id_use_case=GetLibroByIdUseCase(libro_repo, usuario_repo),
        get_disponibilidad_use_case=GetLibroDisponibilidadUseCase(
            libro_repo, ejemplar_repo, usuario_repo
        ),
        create_use_case=CreateLibroUseCase(libro_repo, autor_repo, usuario_repo),
        update_use_case=UpdateLibroUseCase(libro_repo, autor_repo, usuario_repo),
        delete_use_case=DeleteLibroUseCase(libro_repo, usuario_repo),
    )


def get_ejemplar_service(
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    libro_repo: LibroRepositoryI = Depends(get_libro_repository),
    sede_repo: SedeRepositoryI = Depends(get_sede_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> EjemplarServiceI:
    return EjemplarService(
        get_all_use_case=GetAllEjemplaresUseCase(ejemplar_repo, usuario_repo),
        get_by_id_use_case=GetEjemplarByIdUseCase(ejemplar_repo, usuario_repo),
        create_use_case=CreateEjemplarUseCase(ejemplar_repo, libro_repo, sede_repo, usuario_repo),
    )


def get_solicitud_prestamo_service(
    solicitud_repo: SolicitudPrestamoRepositoryI = Depends(get_solicitud_prestamo_repository),
    socio_repo: SocioRepositoryI = Depends(get_socio_repository),
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    sede_repo: SedeRepositoryI = Depends(get_sede_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> SolicitudPrestamoServiceI:
    solicitud_tipo_factory = SolicitudTipoStrategyFactory()
    solicitud_state_factory = SolicitudEstadoStateFactory()
    ejemplar_state_factory = EjemplarEstadoStateFactory()
    return SolicitudPrestamoService(
        get_all_use_case=GetAllSolicitudesPrestamoUseCase(solicitud_repo, usuario_repo),
        get_by_id_use_case=GetSolicitudPrestamoByIdUseCase(solicitud_repo, usuario_repo),
        create_local_use_case=CreateSolicitudLocalUseCase(
            solicitud_repo,
            socio_repo,
            ejemplar_repo,
            sede_repo,
            usuario_repo,
            solicitud_tipo_factory,
            ejemplar_state_factory,
        ),
        create_interbibliotecaria_use_case=CreateSolicitudInterbibliotecariaUseCase(
            solicitud_repo,
            socio_repo,
            ejemplar_repo,
            sede_repo,
            usuario_repo,
            solicitud_tipo_factory,
            ejemplar_state_factory,
        ),
        update_estado_use_case=UpdateSolicitudEstadoUseCase(
            solicitud_repo, ejemplar_repo, usuario_repo, solicitud_state_factory
        ),
    )


def get_prestamo_service(
    prestamo_repo: PrestamoRepositoryI = Depends(get_prestamo_repository),
    solicitud_repo: SolicitudPrestamoRepositoryI = Depends(get_solicitud_prestamo_repository),
    socio_repo: SocioRepositoryI = Depends(get_socio_repository),
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> PrestamoServiceI:
    return PrestamoService(
        get_all_use_case=GetAllPrestamosUseCase(prestamo_repo, usuario_repo),
        get_by_id_use_case=GetPrestamoByIdUseCase(prestamo_repo, usuario_repo),
        create_use_case=CreatePrestamoUseCase(
            prestamo_repo,
            solicitud_repo,
            socio_repo,
            ejemplar_repo,
            usuario_repo,
            EjemplarEstadoStateFactory(),
            VencimientoPrestamoStrategyFactory(),
        ),
    )


def get_reserva_service(
    reserva_repo: ReservaRepositoryI = Depends(get_reserva_repository),
    socio_repo: SocioRepositoryI = Depends(get_socio_repository),
    libro_repo: LibroRepositoryI = Depends(get_libro_repository),
    sede_repo: SedeRepositoryI = Depends(get_sede_repository),
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> ReservaServiceI:
    return ReservaService(
        get_all_use_case=GetAllReservasUseCase(reserva_repo, usuario_repo),
        get_by_id_use_case=GetReservaByIdUseCase(reserva_repo, usuario_repo),
        create_use_case=CreateReservaUseCase(
            reserva_repo,
            socio_repo,
            libro_repo,
            sede_repo,
            ejemplar_repo,
            usuario_repo,
            EjemplarEstadoStateFactory(),
        ),
        update_estado_use_case=UpdateReservaEstadoUseCase(
            reserva_repo, usuario_repo, ReservaEstadoStateFactory()
        ),
    )


def get_remito_service(
    remito_repo: RemitoRepositoryI = Depends(get_remito_repository),
    historial_repo: HistorialEstadoRemitoRepositoryI = Depends(
        get_historial_estado_remito_repository
    ),
    sede_repo: SedeRepositoryI = Depends(get_sede_repository),
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> RemitoServiceI:
    remito_state_factory = RemitoEstadoStateFactory()
    return RemitoService(
        get_all_use_case=GetAllRemitosUseCase(remito_repo, usuario_repo),
        get_by_id_use_case=GetRemitoByIdUseCase(remito_repo, usuario_repo),
        create_use_case=CreateRemitoUseCase(
            remito_repo,
            historial_repo,
            sede_repo,
            ejemplar_repo,
            usuario_repo,
            EjemplarEstadoStateFactory(),
        ),
        despacho_use_case=DespachoRemitoUseCase(
            remito_repo, historial_repo, ejemplar_repo, usuario_repo, remito_state_factory
        ),
        recepcion_use_case=RecepcionRemitoUseCase(
            remito_repo, historial_repo, ejemplar_repo, usuario_repo, remito_state_factory
        ),
        trazabilidad_use_case=GetRemitoTrazabilidadUseCase(
            remito_repo, historial_repo, usuario_repo
        ),
    )


def get_devolucion_service(
    devolucion_repo: DevolucionRepositoryI = Depends(get_devolucion_repository),
    prestamo_repo: PrestamoRepositoryI = Depends(get_prestamo_repository),
    ejemplar_repo: EjemplarRepositoryI = Depends(get_ejemplar_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
    reserva_repo: ReservaRepositoryI = Depends(get_reserva_repository),
    multa_repo: MultaRepositoryI = Depends(get_multa_repository),
    socio_repo: SocioRepositoryI = Depends(get_socio_repository),
) -> DevolucionServiceI:
    return DevolucionService(
        get_all_use_case=GetAllDevolucionesUseCase(devolucion_repo, usuario_repo),
        get_by_id_use_case=GetDevolucionByIdUseCase(devolucion_repo, usuario_repo),
        create_use_case=CreateDevolucionUseCase(
            devolucion_repo,
            prestamo_repo,
            ejemplar_repo,
            usuario_repo,
            reserva_repo,
            multa_repo,
            socio_repo,
            DevolucionEjemplarStrategyFactory(),
        ),
    )


def get_multa_service(
    multa_repo: MultaRepositoryI = Depends(get_multa_repository),
    socio_repo: SocioRepositoryI = Depends(get_socio_repository),
    prestamo_repo: PrestamoRepositoryI = Depends(get_prestamo_repository),
    usuario_repo: UsuarioRepositoryI = Depends(get_usuario_repository),
) -> MultaServiceI:
    multa_state_factory = MultaEstadoStateFactory()
    return MultaService(
        get_all_use_case=GetAllMultasUseCase(multa_repo, usuario_repo),
        get_by_id_use_case=GetMultaByIdUseCase(multa_repo, usuario_repo),
        create_use_case=CreateMultaUseCase(
            multa_repo,
            socio_repo,
            prestamo_repo,
            usuario_repo,
            CalculoMultaStrategyFactory(),
        ),
        pagar_use_case=PagarMultaUseCase(
            multa_repo, socio_repo, usuario_repo, multa_state_factory
        ),
        anular_use_case=AnularMultaUseCase(
            multa_repo, socio_repo, usuario_repo, multa_state_factory
        ),
    )
