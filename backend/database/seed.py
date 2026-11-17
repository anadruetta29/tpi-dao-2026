from datetime import date, timedelta
from sqlalchemy import text
from app.core.helper.password_helper import PasswordHelper
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.rol import Rol
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.infrastructure.database import Base, SessionLocal, engine
from app.infrastructure.postgres.model import (
    AutorModel,
    AvisoLecturaModel,
    AvisoModel,
    DevolucionModel,
    EjemplarModel,
    HistorialEstadoRemitoModel,
    LibroModel,
    MultaModel,
    PrestamoModel,
    RemitoModel,
    ReservaModel,
    SedeModel,
    SocioModel,
    SolicitudPrestamoModel,
    TarifaMultaModel,
    UsuarioModel,
)
from app.infrastructure.postgres.model.remito_model import RemitoIncidenciaModel
from app.infrastructure.scheduler.multas_vencidas_scheduler import (
    _generar_avisos,
    _registrar_multas_vencidas,
    _vencer_reservas,
)


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    hoy = date.today()
    pwd_hash = PasswordHelper.hash("123456")

    with SessionLocal() as db:
        # 0. Limpiar tablas existentes en orden de dependencias (RESTART IDENTITY CASCADE)
        db.execute(
            text(
                """
                TRUNCATE TABLE
                    avisos_lecturas,
                    avisos,
                    remito_incidencias,
                    remito_ejemplar,
                    historiales_estado_remito,
                    remitos,
                    multas,
                    devoluciones,
                    reservas,
                    prestamos,
                    solicitudes_prestamo,
                    ejemplares,
                    libro_autor,
                    libros,
                    autores,
                    socios,
                    usuarios,
                    sedes,
                    tarifas_multa
                RESTART IDENTITY CASCADE;
                """
            )
        )
        db.commit()

        # 1. Tarifas de Multa
        tarifas = [
            TarifaMultaModel(motivo=MotivoMulta.ENTREGA_TARDIA.value, monto=1500.0),
            TarifaMultaModel(motivo=MotivoMulta.EXTRAVIO.value, monto=18000.0),
            TarifaMultaModel(motivo=MotivoMulta.DESTRUCCION.value, monto=25000.0),
        ]
        db.add_all(tarifas)
        db.flush()

        # 2. Sedes (4 Activas, 1 de Baja)
        sedes = [
            SedeModel(
                nombre="Sede Central Córdoba",
                telefono="3514210001",
                email="central@biblioteca.utn.edu.ar",
                horarioAtencion="Lunes a Viernes 08:00 a 22:00",
                estado=EstadoSede.ACTIVA,
            ),
            SedeModel(
                nombre="Sede Campus Universitario",
                telefono="3514210002",
                email="campus@biblioteca.utn.edu.ar",
                horarioAtencion="Lunes a Sábados 08:00 a 20:00",
                estado=EstadoSede.ACTIVA,
            ),
            SedeModel(
                nombre="Sede Anexo Nueva Córdoba",
                telefono="3514210003",
                email="nuevacordoba@biblioteca.utn.edu.ar",
                horarioAtencion="Lunes a Viernes 09:00 a 21:00",
                estado=EstadoSede.ACTIVA,
            ),
            SedeModel(
                nombre="Sede Polo Tecnológico",
                telefono="3514210004",
                email="polo@biblioteca.utn.edu.ar",
                horarioAtencion="Lunes a Viernes 08:30 a 19:30",
                estado=EstadoSede.ACTIVA,
            ),
            SedeModel(
                nombre="Sede Histórica San Francisco",
                telefono="3564420099",
                email="historico@biblioteca.utn.edu.ar",
                horarioAtencion="Cerrada por remodelación edilicia",
                estado=EstadoSede.BAJA,
            ),
        ]
        db.add_all(sedes)
        db.flush()

        s_central, s_campus, s_ncba, s_polo, s_baja = sedes

        # 3. Usuarios (Admins y Recepcionistas por sede, más un usuario inactivo)
        usuarios = [
            UsuarioModel(
                nombre="admin",
                apellido="admin",
                email="admin@mail.com",
                password=pwd_hash,
                activo=True,
                role=Rol.ADMIN,
                sede_id=None,
            ),
            UsuarioModel(
                nombre="Valentina",
                apellido="Gómez",
                email="directora@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=True,
                role=Rol.ADMIN,
                sede_id=None,
            ),
            UsuarioModel(
                nombre="Lucía",
                apellido="Fernández",
                email="central@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=True,
                role=Rol.RECEPCIONISTA,
                sede_id=s_central.id,
            ),
            UsuarioModel(
                nombre="Mateo",
                apellido="Rodríguez",
                email="campus@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=True,
                role=Rol.RECEPCIONISTA,
                sede_id=s_campus.id,
            ),
            UsuarioModel(
                nombre="Sofía",
                apellido="Martínez",
                email="nuevacordoba@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=True,
                role=Rol.RECEPCIONISTA,
                sede_id=s_ncba.id,
            ),
            UsuarioModel(
                nombre="Nicolás",
                apellido="Peralta",
                email="polo@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=True,
                role=Rol.RECEPCIONISTA,
                sede_id=s_polo.id,
            ),
            UsuarioModel(
                nombre="Camila",
                apellido="Suárez",
                email="suplente.central@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=True,
                role=Rol.RECEPCIONISTA,
                sede_id=s_central.id,
            ),
            UsuarioModel(
                nombre="Roberto",
                apellido="Sánchez",
                email="inactivo@biblioteca.utn.edu.ar",
                password=pwd_hash,
                activo=False,
                role=Rol.RECEPCIONISTA,
                sede_id=s_central.id,
            ),
        ]
        db.add_all(usuarios)
        db.flush()

        u_admin, u_dir, u_central, u_campus, u_ncba, u_polo, u_sup, u_inactivo = usuarios

        # 4. Socios (14 socios: HABILITADOS e INHABILITADOS)
        socios = [
            SocioModel(
                nombre="Juan Ignacio",
                apellido="Pérez",
                documento="40111222",
                email="juan.perez@alumnos.utn.edu.ar",
                telefono="3515100001",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="María Victoria",
                apellido="López",
                documento="39222333",
                email="victoria.lopez@alumnos.utn.edu.ar",
                telefono="3515100002",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Facundo",
                apellido="Quiroga",
                documento="41333444",
                email="facundo.quiroga@alumnos.utn.edu.ar",
                telefono="3515100003",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Agustina",
                apellido="Morales",
                documento="42444555",
                email="agustina.morales@alumnos.utn.edu.ar",
                telefono="3515100004",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Santiago",
                apellido="Villalba",
                documento="38555666",
                email="santiago.villalba@alumnos.utn.edu.ar",
                telefono="3515100005",
                estado=EstadoSocio.INHABILITADO,
            ),
            SocioModel(
                nombre="Julieta",
                apellido="Benítez",
                documento="43666777",
                email="julieta.benitez@alumnos.utn.edu.ar",
                telefono="3515100006",
                estado=EstadoSocio.INHABILITADO,
            ),
            SocioModel(
                nombre="Tomás",
                apellido="Herrera",
                documento="44777888",
                email="tomas.herrera@alumnos.utn.edu.ar",
                telefono="3515100007",
                estado=EstadoSocio.INHABILITADO,
            ),
            SocioModel(
                nombre="Florencia",
                apellido="Acosta",
                documento="37888999",
                email="florencia.acosta@docentes.utn.edu.ar",
                telefono="3515100008",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Martín",
                apellido="Cabrera",
                documento="45999000",
                email="martin.cabrera@alumnos.utn.edu.ar",
                telefono="3515100009",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Carolina",
                apellido="Mendoza",
                documento="36123456",
                email="carolina.mendoza@docentes.utn.edu.ar",
                telefono="3515100010",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Gonzalo",
                apellido="Ríos",
                documento="42654321",
                email="gonzalo.rios@alumnos.utn.edu.ar",
                telefono="3515100011",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Micaela",
                apellido="Domínguez",
                documento="40987654",
                email="micaela.dominguez@alumnos.utn.edu.ar",
                telefono="3515100012",
                estado=EstadoSocio.HABILITADO,
            ),
            SocioModel(
                nombre="Federico",
                apellido="Navarro",
                documento="35456789",
                email="federico.navarro@docentes.utn.edu.ar",
                telefono="3515100013",
                estado=EstadoSocio.INHABILITADO,
            ),
            SocioModel(
                nombre="Paula",
                apellido="Giménez",
                documento="46112233",
                email="paula.gimenez@alumnos.utn.edu.ar",
                telefono="3515100014",
                estado=EstadoSocio.HABILITADO,
            ),
        ]
        db.add_all(socios)
        db.flush()

        (
            soc_juan,
            soc_victoria,
            soc_facundo,
            soc_agustina,
            soc_santiago,  # Inhabilitado (préstamo vencido #1 + multa)
            soc_julieta,   # Inhabilitada (préstamo vencido #2 + multa)
            soc_tomas,     # Inhabilitado (multa extravío pendiente)
            soc_florencia,
            soc_martin,
            soc_carolina,
            soc_gonzalo,
            soc_micaela,
            soc_federico,  # Inhabilitado (multa destrucción pendiente)
            soc_paula,
        ) = socios

        # 5. Autores (15 autores de ingeniería de software y literatura clásica)
        autores = [
            AutorModel(nombre="Robert C.", apellido="Martin"),
            AutorModel(nombre="Martin", apellido="Fowler"),
            AutorModel(nombre="Eric", apellido="Evans"),
            AutorModel(nombre="Erich", apellido="Gamma"),
            AutorModel(nombre="Richard", apellido="Helm"),
            AutorModel(nombre="Ralph", apellido="Johnson"),
            AutorModel(nombre="John", apellido="Vlissides"),
            AutorModel(nombre="Martin", apellido="Kleppmann"),
            AutorModel(nombre="Jorge Luis", apellido="Borges"),
            AutorModel(nombre="Julio", apellido="Cortázar"),
            AutorModel(nombre="Gabriel", apellido="García Márquez"),
            AutorModel(nombre="Andrew", apellido="Hunt"),
            AutorModel(nombre="David", apellido="Thomas"),
            AutorModel(nombre="Vaughn", apellido="Vernon"),
            AutorModel(nombre="Ernesto", apellido="Sabato"),
        ]
        db.add_all(autores)
        db.flush()

        (
            a_martin,
            a_fowler,
            a_evans,
            a_gamma,
            a_helm,
            a_johnson,
            a_vlissides,
            a_kleppmann,
            a_borges,
            a_cortazar,
            a_gabo,
            a_hunt,
            a_thomas,
            a_vernon,
            a_sabato,
        ) = autores

        # 6. Libros (14 libros)
        libros = [
            LibroModel(
                titulo="Clean Architecture: Diseño y Estructura de Software",
                añoPublicacion=2017,
                editorial="Prentice Hall",
                edicion="1ra Edición",
                autores=[a_martin],
            ),
            LibroModel(
                titulo="Domain-Driven Design: Tackling Complexity in the Heart of Software",
                añoPublicacion=2003,
                editorial="Addison-Wesley",
                edicion="1ra Edición",
                autores=[a_evans],
            ),
            LibroModel(
                titulo="Design Patterns: Elements of Reusable Object-Oriented Software",
                añoPublicacion=1994,
                editorial="Addison-Wesley",
                edicion="Edición Clásica",
                autores=[a_gamma, a_helm, a_johnson, a_vlissides],
            ),
            LibroModel(
                titulo="Refactoring: Improving the Design of Existing Code",
                añoPublicacion=2018,
                editorial="Addison-Wesley",
                edicion="2da Edición",
                autores=[a_fowler],
            ),
            LibroModel(
                titulo="Designing Data-Intensive Applications",
                añoPublicacion=2017,
                editorial="O'Reilly Media",
                edicion="1ra Edición",
                autores=[a_kleppmann],
            ),
            LibroModel(
                titulo="The Pragmatic Programmer: Your Journey to Mastery",
                añoPublicacion=2019,
                editorial="Addison-Wesley",
                edicion="20th Anniversary Edition",
                autores=[a_hunt, a_thomas],
            ),
            LibroModel(
                titulo="Implementing Domain-Driven Design",
                añoPublicacion=2013,
                editorial="Addison-Wesley",
                edicion="1ra Edición",
                autores=[a_vernon],
            ),
            LibroModel(
                titulo="Clean Code: Manual de Estilo para el Desarrollo Ágil",
                añoPublicacion=2008,
                editorial="Prentice Hall",
                edicion="1ra Edición",
                autores=[a_martin],
            ),
            LibroModel(
                titulo="Ficciones",
                añoPublicacion=1944,
                editorial="Sur / Emecé",
                edicion="Edición Conmemorativa",
                autores=[a_borges],
            ),
            LibroModel(
                titulo="El Aleph",
                añoPublicacion=1949,
                editorial="Losada",
                edicion="3ra Edición",
                autores=[a_borges],
            ),
            LibroModel(
                titulo="Rayuela",
                añoPublicacion=1963,
                editorial="Sudamericana",
                edicion="Edición Crítica",
                autores=[a_cortazar],
            ),
            LibroModel(
                titulo="Cien Años de Soledad",
                añoPublicacion=1967,
                editorial="Sudamericana",
                edicion="Edición Real Academia",
                autores=[a_gabo],
            ),
            LibroModel(
                titulo="Sobre Héroes y Tumbas",
                añoPublicacion=1961,
                editorial="Compañía General Fabril",
                edicion="2da Edición",
                autores=[a_sabato],
            ),
            LibroModel(
                titulo="Patterns of Enterprise Application Architecture",
                añoPublicacion=2002,
                editorial="Addison-Wesley",
                edicion="1ra Edición",
                autores=[a_fowler],
            ),
        ]
        db.add_all(libros)
        db.flush()

        (
            l_clean_arch,
            l_ddd,
            l_gof,
            l_refactoring,
            l_ddia,
            l_pragmatic,
            l_iddd,
            l_clean_code,
            l_ficciones,
            l_aleph,
            l_rayuela,
            l_cien_anos,
            l_heroes,
            l_poeaa,
        ) = libros

        # 7. Ejemplares (45 ejemplares distribuidos en sedes y en TODOS los estados posibles)
        # Nota: diseñamos algunos libros en ciertas sedes SIN ejemplares disponibles para que:
        # a) existan reservas ACTIVAS reales en cola y
        # b) puedas probar crear nuevas reservas desde el frontend (ej: l_ddia en Sede Central o l_gof en Sede Campus)
        ejemplares = [
            # --- Libro 1: Clean Architecture ---
            EjemplarModel(codigo="CA-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_clean_arch.id, sede_id=s_central.id),
            EjemplarModel(codigo="CA-CEN-002", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_clean_arch.id, sede_id=s_central.id),
            EjemplarModel(codigo="CA-CEN-003", estado=EstadoEjemplar.PRESTADO, libro_id=l_clean_arch.id, sede_id=s_central.id),      # Prestamo activo 1
            EjemplarModel(codigo="CA-CAM-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_clean_arch.id, sede_id=s_campus.id),
            EjemplarModel(codigo="CA-NCB-001", estado=EstadoEjemplar.EN_REVISION, libro_id=l_clean_arch.id, sede_id=s_ncba.id),

            # --- Libro 2: Domain-Driven Design ---
            EjemplarModel(codigo="DDD-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_ddd.id, sede_id=s_central.id),
            EjemplarModel(codigo="DDD-CEN-002", estado=EstadoEjemplar.PRESTADO, libro_id=l_ddd.id, sede_id=s_central.id),            # Prestamo activo 1 (multi-ejemplar)
            EjemplarModel(codigo="DDD-CAM-001", estado=EstadoEjemplar.RESERVADO, libro_id=l_ddd.id, sede_id=s_campus.id),            # Remito ACEPTADO (para solicitud interbibliotecaria)
            EjemplarModel(codigo="DDD-POL-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_ddd.id, sede_id=s_polo.id),

            # --- Libro 3: Design Patterns (GoF) -> En Sede Campus NO hay disponibles (para probar Reservas!) ---
            EjemplarModel(codigo="GOF-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_gof.id, sede_id=s_central.id),
            EjemplarModel(codigo="GOF-CEN-002", estado=EstadoEjemplar.RESERVADO, libro_id=l_gof.id, sede_id=s_central.id),           # Reserva LISTA_PARA_RETIRO #1 en Central
            EjemplarModel(codigo="GOF-CAM-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_gof.id, sede_id=s_campus.id),             # Prestamo por vencer en Campus (con Reserva ACTIVA esperando!)
            EjemplarModel(codigo="GOF-NCB-001", estado=EstadoEjemplar.DANADO, libro_id=l_gof.id, sede_id=s_ncba.id),

            # --- Libro 4: Refactoring ---
            EjemplarModel(codigo="REF-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_refactoring.id, sede_id=s_central.id),
            EjemplarModel(codigo="REF-CAM-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_refactoring.id, sede_id=s_campus.id),
            EjemplarModel(codigo="REF-CAM-002", estado=EstadoEjemplar.RESERVADO, libro_id=l_refactoring.id, sede_id=s_campus.id),    # Remito EMPACADO desde Campus a Central
            EjemplarModel(codigo="REF-NCB-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_refactoring.id, sede_id=s_ncba.id),       # Prestamo vencido #1 (Santiago)

            # --- Libro 5: Designing Data-Intensive Applications (DDIA) -> En Sede Central NO hay disponibles! ---
            EjemplarModel(codigo="DDIA-CEN-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_ddia.id, sede_id=s_central.id),          # Prestamo por vencer mañana en Central (con Reserva ACTIVA)
            EjemplarModel(codigo="DDIA-CAM-001", estado=EstadoEjemplar.EN_TRANSITO, libro_id=l_ddia.id, sede_id=s_campus.id),        # Remito EN_TRANSITO de Campus a Central
            EjemplarModel(codigo="DDIA-POL-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_ddia.id, sede_id=s_polo.id),

            # --- Libro 6: The Pragmatic Programmer ---
            EjemplarModel(codigo="PRG-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_pragmatic.id, sede_id=s_central.id),
            EjemplarModel(codigo="PRG-CEN-002", estado=EstadoEjemplar.PRESTADO, libro_id=l_pragmatic.id, sede_id=s_central.id),      # Prestamo vencido #2 (Julieta)
            EjemplarModel(codigo="PRG-NCB-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_pragmatic.id, sede_id=s_ncba.id),
            EjemplarModel(codigo="PRG-POL-001", estado=EstadoEjemplar.EXTRAVIADO, libro_id=l_pragmatic.id, sede_id=s_polo.id),       # Devuelto como EXTRAVIADO

            # --- Libro 7: Implementing DDD ---
            EjemplarModel(codigo="IDDD-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_iddd.id, sede_id=s_central.id),
            EjemplarModel(codigo="IDDD-CAM-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_iddd.id, sede_id=s_campus.id),
            EjemplarModel(codigo="IDDD-POL-001", estado=EstadoEjemplar.EN_TRANSITO, libro_id=l_iddd.id, sede_id=s_polo.id),          # Remito DESPACHADO de Polo a Nueva Córdoba

            # --- Libro 8: Clean Code ---
            EjemplarModel(codigo="CC-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_clean_code.id, sede_id=s_central.id),
            EjemplarModel(codigo="CC-CEN-002", estado=EstadoEjemplar.RESERVADO, libro_id=l_clean_code.id, sede_id=s_central.id),     # Reserva LISTA_PARA_RETIRO #2 en Central
            EjemplarModel(codigo="CC-CAM-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_clean_code.id, sede_id=s_campus.id),
            EjemplarModel(codigo="CC-NCB-001", estado=EstadoEjemplar.DESTRUIDO, libro_id=l_clean_code.id, sede_id=s_ncba.id),        # Devuelto como DESTRUIDO

            # --- Libro 9: Ficciones ---
            EjemplarModel(codigo="FIC-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_ficciones.id, sede_id=s_central.id),
            EjemplarModel(codigo="FIC-CAM-001", estado=EstadoEjemplar.RESERVADO, libro_id=l_ficciones.id, sede_id=s_campus.id),      # Reserva LISTA_PARA_RETIRO #3 en Campus
            EjemplarModel(codigo="FIC-NCB-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_ficciones.id, sede_id=s_ncba.id),

            # --- Libro 10: El Aleph ---
            EjemplarModel(codigo="ALE-CEN-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_aleph.id, sede_id=s_central.id),          # Prestamo en SALA_LECTURA hoy en Central
            EjemplarModel(codigo="ALE-CAM-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_aleph.id, sede_id=s_campus.id),
            EjemplarModel(codigo="ALE-POL-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_aleph.id, sede_id=s_polo.id),

            # --- Libro 11: Rayuela ---
            EjemplarModel(codigo="RAY-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_rayuela.id, sede_id=s_central.id),
            EjemplarModel(codigo="RAY-NCB-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_rayuela.id, sede_id=s_ncba.id),           # Prestamo multi-ejemplar con devolución parcial (1 pendiente, 1 devuelto)
            EjemplarModel(codigo="RAY-NCB-002", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_rayuela.id, sede_id=s_ncba.id),         # El 2do ejemplar ya fue devuelto!

            # --- Libro 12: Cien Años de Soledad ---
            EjemplarModel(codigo="CAS-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_cien_anos.id, sede_id=s_central.id),
            EjemplarModel(codigo="CAS-CAM-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_cien_anos.id, sede_id=s_campus.id),       # Prestamo renovado activo en Campus
            EjemplarModel(codigo="CAS-POL-001", estado=EstadoEjemplar.DANADO, libro_id=l_cien_anos.id, sede_id=s_polo.id),           # Remito CON_INCIDENCIA (recibido dañado)

            # --- Libro 13: Sobre Héroes y Tumbas ---
            EjemplarModel(codigo="SHT-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_heroes.id, sede_id=s_central.id),
            EjemplarModel(codigo="SHT-NCB-001", estado=EstadoEjemplar.EN_REVISION, libro_id=l_heroes.id, sede_id=s_ncba.id),

            # --- Libro 14: Patterns of Enterprise Application Architecture (PoEAA) -> En Polo solo PRESTADO (para Reservas!) ---
            EjemplarModel(codigo="PEA-POL-001", estado=EstadoEjemplar.PRESTADO, libro_id=l_poeaa.id, sede_id=s_polo.id),             # Prestamo activo en Polo
            EjemplarModel(codigo="PEA-CEN-001", estado=EstadoEjemplar.DISPONIBLE, libro_id=l_poeaa.id, sede_id=s_central.id),
        ]
        db.add_all(ejemplares)
        db.flush()

        by_code = {e.codigo: e for e in ejemplares}

        # 8. Solicitudes de Préstamo (en todos los estados: PENDIENTE, APROBADA, RECHAZADA, CANCELADA, tanto LOCAL como INTERBIBLIOTECARIO)
        solicitudes = [
            # --- PENDIENTES (aparecen en la Bandeja de Entrada para Aprobar / Rechazar) ---
            # 1) Solicitud LOCAL PENDIENTE en Sede Central (Juan quiere Clean Architecture + Implementing DDD)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1001",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.PENDIENTE,
                socio_id=soc_juan.id,
                ejemplar_id=by_code["CA-CEN-001"].id,
                ejemplar_ids=[by_code["CA-CEN-001"].id, by_code["IDDD-CEN-001"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=None,
            ),
            # 2) Solicitud LOCAL PENDIENTE en Sede Campus (Victoria quiere Clean Code)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1002",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.PENDIENTE,
                socio_id=soc_victoria.id,
                ejemplar_id=by_code["CC-CAM-001"].id,
                ejemplar_ids=[by_code["CC-CAM-001"].id],
                sede_origen_id=s_campus.id,
                sede_destino_id=s_campus.id,
                responsable_origen_id=u_campus.id,
                responsable_destino_id=None,
            ),
            # 3) Solicitud INTERBIBLIOTECARIA PENDIENTE (Sede Origen: Polo -> Sede Destino: Central, para Florencia)
            SolicitudPrestamoModel(
                numero="SOL-INT-2001",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.PENDIENTE,
                socio_id=soc_florencia.id,
                ejemplar_id=by_code["DDD-POL-001"].id,
                ejemplar_ids=[by_code["DDD-POL-001"].id, by_code["DDIA-POL-001"].id],
                sede_origen_id=s_polo.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=None,
            ),
            # 4) Solicitud INTERBIBLIOTECARIA PENDIENTE sin socio (reposición de catálogo Sede Central -> Sede Nueva Córdoba)
            SolicitudPrestamoModel(
                numero="SOL-INT-2002",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.PENDIENTE,
                socio_id=None,
                ejemplar_id=by_code["SHT-CEN-001"].id,
                ejemplar_ids=[by_code["SHT-CEN-001"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_ncba.id,
                responsable_origen_id=u_ncba.id,
                responsable_destino_id=None,
            ),

            # --- APROBADAS (que ya generaron Préstamos o Remitos) ---
            # 5) Local aprobada -> Préstamo Activo #1 (Multi-ejemplar en Central para Facundo)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1003",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_facundo.id,
                ejemplar_id=by_code["CA-CEN-003"].id,
                ejemplar_ids=[by_code["CA-CEN-003"].id, by_code["DDD-CEN-002"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=u_central.id,
            ),
            # 6) Local aprobada -> Préstamo por vencer mañana #2 (en Central para Agustina)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1004",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_agustina.id,
                ejemplar_id=by_code["DDIA-CEN-001"].id,
                ejemplar_ids=[by_code["DDIA-CEN-001"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=u_central.id,
            ),
            # 7) Local aprobada -> Préstamo por vencer en 2 días #3 (en Campus para Martín)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1005",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_martin.id,
                ejemplar_id=by_code["GOF-CAM-001"].id,
                ejemplar_ids=[by_code["GOF-CAM-001"].id],
                sede_origen_id=s_campus.id,
                sede_destino_id=s_campus.id,
                responsable_origen_id=u_campus.id,
                responsable_destino_id=u_campus.id,
            ),
            # 8) Local aprobada -> Préstamo VENCIDO #4 (en Nueva Córdoba para Santiago)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1006",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_santiago.id,
                ejemplar_id=by_code["REF-NCB-001"].id,
                ejemplar_ids=[by_code["REF-NCB-001"].id],
                sede_origen_id=s_ncba.id,
                sede_destino_id=s_ncba.id,
                responsable_origen_id=u_ncba.id,
                responsable_destino_id=u_ncba.id,
            ),
            # 9) Local aprobada -> Préstamo VENCIDO #5 (en Central para Julieta)
            SolicitudPrestamoModel(
                numero="SOL-LOC-1007",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_julieta.id,
                ejemplar_id=by_code["PRG-CEN-002"].id,
                ejemplar_ids=[by_code["PRG-CEN-002"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=u_central.id,
            ),
            # 10) Interbibliotecaria aprobada -> Remito ACEPTADO #1 (Campus -> Central, pendiente de empacar en Campus)
            SolicitudPrestamoModel(
                numero="SOL-INT-2003",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_carolina.id,
                ejemplar_id=by_code["DDD-CAM-001"].id,
                ejemplar_ids=[by_code["DDD-CAM-001"].id],
                sede_origen_id=s_campus.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=None,
            ),
            # 11) Interbibliotecaria aprobada -> Remito EMPACADO #2 (Campus -> Central, listo para despachar en Campus)
            SolicitudPrestamoModel(
                numero="SOL-INT-2004",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_gonzalo.id,
                ejemplar_id=by_code["REF-CAM-002"].id,
                ejemplar_ids=[by_code["REF-CAM-002"].id],
                sede_origen_id=s_campus.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=None,
            ),
            # 12) Interbibliotecaria aprobada -> Remito EN_TRANSITO #3 (Campus -> Central, listo para recibir en Central!)
            SolicitudPrestamoModel(
                numero="SOL-INT-2005",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_micaela.id,
                ejemplar_id=by_code["DDIA-CAM-001"].id,
                ejemplar_ids=[by_code["DDIA-CAM-001"].id],
                sede_origen_id=s_campus.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=None,
            ),
            # 13) Interbibliotecaria aprobada -> Remito RECIBIDO #5 (Central -> Campus, ya entregado y con préstamo histórico)
            SolicitudPrestamoModel(
                numero="SOL-INT-2006",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.APROBADA,
                socio_id=soc_paula.id,
                ejemplar_id=by_code["CAS-CAM-001"].id,
                ejemplar_ids=[by_code["CAS-CAM-001"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_campus.id,
                responsable_origen_id=u_campus.id,
                responsable_destino_id=u_campus.id,
            ),

            # --- RECHAZADAS y CANCELADAS ---
            SolicitudPrestamoModel(
                numero="SOL-LOC-1008",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.RECHAZADA,
                socio_id=soc_juan.id,
                ejemplar_id=by_code["FIC-CEN-001"].id,
                ejemplar_ids=[by_code["FIC-CEN-001"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=u_central.id,
            ),
            SolicitudPrestamoModel(
                numero="SOL-INT-2007",
                tipo=TipoPrestamo.INTERBIBLIOTECARIO,
                estado=EstadoSolicitud.RECHAZADA,
                socio_id=soc_victoria.id,
                ejemplar_id=by_code["ALE-POL-001"].id,
                ejemplar_ids=[by_code["ALE-POL-001"].id],
                sede_origen_id=s_polo.id,
                sede_destino_id=s_campus.id,
                responsable_origen_id=u_campus.id,
                responsable_destino_id=u_polo.id,
            ),
            SolicitudPrestamoModel(
                numero="SOL-LOC-1009",
                tipo=TipoPrestamo.LOCAL,
                estado=EstadoSolicitud.CANCELADA,
                socio_id=soc_florencia.id,
                ejemplar_id=by_code["RAY-CEN-001"].id,
                ejemplar_ids=[by_code["RAY-CEN-001"].id],
                sede_origen_id=s_central.id,
                sede_destino_id=s_central.id,
                responsable_origen_id=u_central.id,
                responsable_destino_id=None,
            ),
        ]
        db.add_all(solicitudes)
        db.flush()

        sol_by_num = {s.numero: s for s in solicitudes}

        # 9. Préstamos (Activos al día, Activos por vencer para renovar, En Sala de lectura, Multi-ejemplar con devolución parcial, Vencidos, Devueltos en término, Devueltos con atraso/daño/extravío/destrucción)
        prestamos = [
            # P1: Activo al día, multi-ejemplar (Facundo en Sede Central, se puede devolver parcial o cancelar anticipadamente)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=3),
                fechaVencimiento=hoy + timedelta(days=11),
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=sol_by_num["SOL-LOC-1003"].id,
                socio_id=soc_facundo.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["CA-CEN-003"].id,
                ejemplar_ids=[by_code["CA-CEN-003"].id, by_code["DDD-CEN-002"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P2: Activo por vencer MAÑANA en Sede Central (Agustina, aparece en Bandeja "Préstamos por vencer" y genera Aviso)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=13),
                fechaVencimiento=hoy + timedelta(days=1),
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=sol_by_num["SOL-LOC-1004"].id,
                socio_id=soc_agustina.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["DDIA-CEN-001"].id,
                ejemplar_ids=[by_code["DDIA-CEN-001"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P3: Activo por vencer en 2 DÍAS en Sede Campus (Martín, tiene reserva activa esperando)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=12),
                fechaVencimiento=hoy + timedelta(days=2),
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=sol_by_num["SOL-LOC-1005"].id,
                socio_id=soc_martin.id,
                sede_id=s_campus.id,
                ejemplar_id=by_code["GOF-CAM-001"].id,
                ejemplar_ids=[by_code["GOF-CAM-001"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P4: Activo por vencer en 2 DÍAS en Sede Polo SIN reservas pendientes -> ¡Se puede RENOVAR con 1 clic desde Bandeja!
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=12),
                fechaVencimiento=hoy + timedelta(days=2),
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_carolina.id,
                sede_id=s_polo.id,
                ejemplar_id=by_code["PEA-POL-001"].id,
                ejemplar_ids=[by_code["PEA-POL-001"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P5: Activo en SALA DE LECTURA (vence hoy en Sede Central, Juan Ignacio)
            PrestamoModel(
                fechaInicio=hoy,
                fechaVencimiento=hoy,
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.SALA_LECTURA,
                solicitud_id=None,
                socio_id=soc_juan.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["ALE-CEN-001"].id,
                ejemplar_ids=[by_code["ALE-CEN-001"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P6: Activo con 1 RENOVACIÓN ya realizada (Paula en Sede Campus)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=16),
                fechaVencimiento=hoy + timedelta(days=5),
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=sol_by_num["SOL-INT-2006"].id,
                socio_id=soc_paula.id,
                sede_id=s_campus.id,
                ejemplar_id=by_code["CAS-CAM-001"].id,
                ejemplar_ids=[by_code["CAS-CAM-001"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=1,
            ),
            # P7: Activo Multi-ejemplar con DEVOLUCIÓN PARCIAL (Gonzalo en Nueva Córdoba: pidió 2 ejemplares de Rayuela, ya devolvió RAY-NCB-002 y queda pendiente RAY-NCB-001)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=6),
                fechaVencimiento=hoy + timedelta(days=8),
                fechaDevolucion=None,
                estado=EstadoPrestamo.ACTIVO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_gonzalo.id,
                sede_id=s_ncba.id,
                ejemplar_id=by_code["RAY-NCB-001"].id,
                ejemplar_ids=[by_code["RAY-NCB-001"].id, by_code["RAY-NCB-002"].id],
                ejemplares_devueltos_ids=[by_code["RAY-NCB-002"].id],
                renovaciones=0,
            ),
            # P8: VENCIDO hace 5 días (Santiago en Nueva Córdoba -> genera multa automática por entrega tardía y aviso de atraso)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=19),
                fechaVencimiento=hoy - timedelta(days=5),
                fechaDevolucion=None,
                estado=EstadoPrestamo.VENCIDO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=sol_by_num["SOL-LOC-1006"].id,
                socio_id=soc_santiago.id,
                sede_id=s_ncba.id,
                ejemplar_id=by_code["REF-NCB-001"].id,
                ejemplar_ids=[by_code["REF-NCB-001"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P9: VENCIDO hace 3 días (Julieta en Sede Central -> genera multa automática por entrega tardía y aviso de atraso)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=17),
                fechaVencimiento=hoy - timedelta(days=3),
                fechaDevolucion=None,
                estado=EstadoPrestamo.VENCIDO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=sol_by_num["SOL-LOC-1007"].id,
                socio_id=soc_julieta.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["PRG-CEN-002"].id,
                ejemplar_ids=[by_code["PRG-CEN-002"].id],
                ejemplares_devueltos_ids=[],
                renovaciones=0,
            ),
            # P10: DEVUELTO en término (Florencia en Sede Central)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=20),
                fechaVencimiento=hoy - timedelta(days=6),
                fechaDevolucion=hoy - timedelta(days=8),
                estado=EstadoPrestamo.DEVUELTO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_florencia.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["CA-CEN-001"].id,
                ejemplar_ids=[by_code["CA-CEN-001"].id],
                ejemplares_devueltos_ids=[by_code["CA-CEN-001"].id],
                renovaciones=0,
            ),
            # P11: DEVUELTO con atraso pero multa ya PAGADA (Victoria en Sede Campus)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=25),
                fechaVencimiento=hoy - timedelta(days=11),
                fechaDevolucion=hoy - timedelta(days=7),
                estado=EstadoPrestamo.DEVUELTO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_victoria.id,
                sede_id=s_campus.id,
                ejemplar_id=by_code["ALE-CAM-001"].id,
                ejemplar_ids=[by_code["ALE-CAM-001"].id],
                ejemplares_devueltos_ids=[by_code["ALE-CAM-001"].id],
                renovaciones=0,
            ),
            # P12: DEVUELTO con ejemplar EXTRAVIADO -> Multa PENDIENTE por EXTRAVIO (Tomás en Sede Polo)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=18),
                fechaVencimiento=hoy - timedelta(days=4),
                fechaDevolucion=hoy - timedelta(days=4),
                estado=EstadoPrestamo.DEVUELTO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_tomas.id,
                sede_id=s_polo.id,
                ejemplar_id=by_code["PRG-POL-001"].id,
                ejemplar_ids=[by_code["PRG-POL-001"].id],
                ejemplares_devueltos_ids=[by_code["PRG-POL-001"].id],
                renovaciones=0,
            ),
            # P13: DEVUELTO con ejemplar DESTRUIDO -> Multa PENDIENTE por DESTRUCCION (Federico en Nueva Córdoba)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=15),
                fechaVencimiento=hoy - timedelta(days=1),
                fechaDevolucion=hoy - timedelta(days=2),
                estado=EstadoPrestamo.DEVUELTO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_federico.id,
                sede_id=s_ncba.id,
                ejemplar_id=by_code["CC-NCB-001"].id,
                ejemplar_ids=[by_code["CC-NCB-001"].id],
                ejemplares_devueltos_ids=[by_code["CC-NCB-001"].id],
                renovaciones=0,
            ),
            # P14: DEVUELTO con ejemplar EN_REVISION -> Multa ANULADA (Micaela en Nueva Córdoba)
            PrestamoModel(
                fechaInicio=hoy - timedelta(days=14),
                fechaVencimiento=hoy - timedelta(days=2),
                fechaDevolucion=hoy - timedelta(days=1),
                estado=EstadoPrestamo.DEVUELTO,
                modalidad=ModalidadPrestamoLocal.DOMICILIO,
                solicitud_id=None,
                socio_id=soc_micaela.id,
                sede_id=s_ncba.id,
                ejemplar_id=by_code["CA-NCB-001"].id,
                ejemplar_ids=[by_code["CA-NCB-001"].id],
                ejemplares_devueltos_ids=[by_code["CA-NCB-001"].id],
                renovaciones=0,
            ),
        ]
        db.add_all(prestamos)
        db.flush()

        (
            p_activo_multi,
            p_por_vencer_central,
            p_por_vencer_campus,
            p_por_vencer_renovable,
            p_sala_lectura,
            p_renovado,
            p_parcial,
            p_vencido_santiago,
            p_vencido_julieta,
            p_dev_ok,
            p_dev_tarde_pagado,
            p_dev_extraviado,
            p_dev_destruido,
            p_dev_revision,
        ) = prestamos

        # 10. Devoluciones (en distintos estados de ejemplar devuelto: DISPONIBLE, EN_REVISION, DANADO, EXTRAVIADO, DESTRUIDO)
        devoluciones = [
            DevolucionModel(
                fecha=hoy - timedelta(days=8),
                observaciones="Ejemplar devuelto en impecables condiciones antes del vencimiento.",
                estadoDevuelto=EstadoEjemplar.DISPONIBLE,
                prestamo_id=p_dev_ok.id,
                ejemplar_id=by_code["CA-CEN-001"].id,
            ),
            DevolucionModel(
                fecha=hoy - timedelta(days=7),
                observaciones="Devuelto con 4 días de demora. El socio abonó la multa en mostrador.",
                estadoDevuelto=EstadoEjemplar.DISPONIBLE,
                prestamo_id=p_dev_tarde_pagado.id,
                ejemplar_id=by_code["ALE-CAM-001"].id,
            ),
            DevolucionModel(
                fecha=hoy - timedelta(days=3),
                observaciones="Devolución parcial del primer tomo de Rayuela. Queda pendiente el segundo ejemplar.",
                estadoDevuelto=EstadoEjemplar.DISPONIBLE,
                prestamo_id=p_parcial.id,
                ejemplar_id=by_code["RAY-NCB-002"].id,
            ),
            DevolucionModel(
                fecha=hoy - timedelta(days=4),
                observaciones="El socio declaró el extravío del ejemplar en transporte público.",
                estadoDevuelto=EstadoEjemplar.EXTRAVIADO,
                prestamo_id=p_dev_extraviado.id,
                ejemplar_id=by_code["PRG-POL-001"].id,
            ),
            DevolucionModel(
                fecha=hoy - timedelta(days=2),
                observaciones="Derrame de líquido severo sobre el ejemplar; encuadernación irremediablemente destruida.",
                estadoDevuelto=EstadoEjemplar.DESTRUIDO,
                prestamo_id=p_dev_destruido.id,
                ejemplar_id=by_code["CC-NCB-001"].id,
            ),
            DevolucionModel(
                fecha=hoy - timedelta(days=1),
                observaciones="Tapas flojas detectadas al reingreso; pasa a taller de encuadernación para revisión.",
                estadoDevuelto=EstadoEjemplar.EN_REVISION,
                prestamo_id=p_dev_revision.id,
                ejemplar_id=by_code["CA-NCB-001"].id,
            ),
        ]
        db.add_all(devoluciones)
        db.flush()

        # 11. Multas (PENDIENTE, PAGADA, ANULADA y por los 3 motivos: ENTREGA_TARDIA, EXTRAVIO, DESTRUCCION)
        multas = [
            # M1: PENDIENTE por ENTREGA_TARDIA (Santiago - 5 días * 1500 = 7500)
            MultaModel(
                fechaEmision=hoy,
                motivo=MotivoMulta.ENTREGA_TARDIA,
                monto=7500.0,
                estado=EstadoMulta.PENDIENTE,
                fechaPago=None,
                socio_id=soc_santiago.id,
                prestamo_id=p_vencido_santiago.id,
            ),
            # M2: PENDIENTE por ENTREGA_TARDIA (Julieta - 3 días * 1500 = 4500)
            MultaModel(
                fechaEmision=hoy,
                motivo=MotivoMulta.ENTREGA_TARDIA,
                monto=4500.0,
                estado=EstadoMulta.PENDIENTE,
                fechaPago=None,
                socio_id=soc_julieta.id,
                prestamo_id=p_vencido_julieta.id,
            ),
            # M3: PENDIENTE por EXTRAVIO (Tomás - 18000)
            MultaModel(
                fechaEmision=hoy - timedelta(days=4),
                motivo=MotivoMulta.EXTRAVIO,
                monto=18000.0,
                estado=EstadoMulta.PENDIENTE,
                fechaPago=None,
                socio_id=soc_tomas.id,
                prestamo_id=p_dev_extraviado.id,
            ),
            # M4: PENDIENTE por DESTRUCCION (Federico - 25000)
            MultaModel(
                fechaEmision=hoy - timedelta(days=2),
                motivo=MotivoMulta.DESTRUCCION,
                monto=25000.0,
                estado=EstadoMulta.PENDIENTE,
                fechaPago=None,
                socio_id=soc_federico.id,
                prestamo_id=p_dev_destruido.id,
            ),
            # M5: PAGADA por ENTREGA_TARDIA (Victoria - 4 días * 1500 = 6000)
            MultaModel(
                fechaEmision=hoy - timedelta(days=7),
                motivo=MotivoMulta.ENTREGA_TARDIA,
                monto=6000.0,
                estado=EstadoMulta.PAGADA,
                fechaPago=hoy - timedelta(days=7),
                socio_id=soc_victoria.id,
                prestamo_id=p_dev_tarde_pagado.id,
            ),
            # M6: PAGADA por EXTRAVIO anterior (Juan Ignacio - reposición abonada)
            MultaModel(
                fechaEmision=hoy - timedelta(days=30),
                motivo=MotivoMulta.EXTRAVIO,
                monto=15000.0,
                estado=EstadoMulta.PAGADA,
                fechaPago=hoy - timedelta(days=25),
                socio_id=soc_juan.id,
                prestamo_id=p_dev_ok.id,
            ),
            # M7: ANULADA por ENTREGA_TARDIA (Micaela - error administrativo / feriado académico)
            MultaModel(
                fechaEmision=hoy - timedelta(days=1),
                motivo=MotivoMulta.ENTREGA_TARDIA,
                monto=1500.0,
                estado=EstadoMulta.ANULADA,
                fechaPago=None,
                socio_id=soc_micaela.id,
                prestamo_id=p_dev_revision.id,
            ),
        ]
        db.add_all(multas)
        db.flush()

        # 12. Remitos e Historiales de Trazabilidad (en todos los estados: ACEPTADO, EMPACADO, DESPACHADO, EN_TRANSITO, RECIBIDO, CON_INCIDENCIA)
        # R1: ACEPTADO (vinculado a SOL-INT-2003, Campus -> Central. Permite hacer clic en "Empacar")
        r_aceptado = RemitoModel(
            numero="REM-A1001",
            fechaEmision=hoy - timedelta(days=1),
            fechaDespacho=None,
            fechaRecepcion=None,
            sede_origen_id=s_campus.id,
            sede_destino_id=s_central.id,
            solicitud_id=sol_by_num["SOL-INT-2003"].id,
            ejemplares=[by_code["DDD-CAM-001"]],
        )
        # R2: EMPACADO (vinculado a SOL-INT-2004, Campus -> Central. Permite hacer clic en "Despachar")
        r_empacado = RemitoModel(
            numero="REM-E1002",
            fechaEmision=hoy - timedelta(days=2),
            fechaDespacho=None,
            fechaRecepcion=None,
            sede_origen_id=s_campus.id,
            sede_destino_id=s_central.id,
            solicitud_id=sol_by_num["SOL-INT-2004"].id,
            ejemplares=[by_code["REF-CAM-002"]],
        )
        # R3: EN_TRANSITO (vinculado a SOL-INT-2005, Campus -> Central. Permite hacer clic en "Recibir OK" o recibir con incidencia en Central, y automáticamente crea el préstamo para Micaela!)
        r_en_transito = RemitoModel(
            numero="REM-T1003",
            fechaEmision=hoy - timedelta(days=4),
            fechaDespacho=hoy - timedelta(days=2),
            fechaRecepcion=None,
            sede_origen_id=s_campus.id,
            sede_destino_id=s_central.id,
            solicitud_id=sol_by_num["SOL-INT-2005"].id,
            ejemplares=[by_code["DDIA-CAM-001"]],
        )
        # R4: DESPACHADO directo entre sedes (Polo -> Nueva Córdoba, listo para recibir en Nueva Córdoba)
        r_despachado = RemitoModel(
            numero="REM-D1004",
            fechaEmision=hoy - timedelta(days=3),
            fechaDespacho=hoy - timedelta(days=1),
            fechaRecepcion=None,
            sede_origen_id=s_polo.id,
            sede_destino_id=s_ncba.id,
            solicitud_id=None,
            ejemplares=[by_code["IDDD-POL-001"]],
        )
        # R5: RECIBIDO completo con trazabilidad de 4 pasos (Central -> Campus, vinculado a SOL-INT-2006)
        r_recibido = RemitoModel(
            numero="REM-R1005",
            fechaEmision=hoy - timedelta(days=20),
            fechaDespacho=hoy - timedelta(days=18),
            fechaRecepcion=hoy - timedelta(days=16),
            sede_origen_id=s_central.id,
            sede_destino_id=s_campus.id,
            solicitud_id=sol_by_num["SOL-INT-2006"].id,
            ejemplares=[by_code["CAS-CAM-001"]],
        )
        # R6: CON_INCIDENCIA (Central -> Polo, recibido con ejemplar CAS-POL-001 dañado en el traslado)
        r_incidencia = RemitoModel(
            numero="REM-I1006",
            fechaEmision=hoy - timedelta(days=10),
            fechaDespacho=hoy - timedelta(days=8),
            fechaRecepcion=hoy - timedelta(days=5),
            sede_origen_id=s_central.id,
            sede_destino_id=s_polo.id,
            solicitud_id=None,
            ejemplares=[by_code["CAS-POL-001"]],
        )

        db.add_all([r_aceptado, r_empacado, r_en_transito, r_despachado, r_recibido, r_incidencia])
        db.flush()

        # Incidencia registrada en R6
        incidencia_r6 = RemitoIncidenciaModel(
            remito_id=r_incidencia.id,
            ejemplar_id=by_code["CAS-POL-001"].id,
            estado=EstadoEjemplar.DANADO,
            observacion="Caja húmeda durante el traslado logístico; sobrecubierta y primeras páginas dañadas.",
        )
        db.add(incidencia_r6)

        # Historiales de estado de cada remito
        historiales = [
            # R1 (ACEPTADO)
            HistorialEstadoRemitoModel(
                remito_id=r_aceptado.id,
                estado=EstadoEnvio.ACEPTADO,
                fechaInicio=hoy - timedelta(days=1),
                fechaFin=None,
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            # R2 (ACEPTADO -> EMPACADO)
            HistorialEstadoRemitoModel(
                remito_id=r_empacado.id,
                estado=EstadoEnvio.ACEPTADO,
                fechaInicio=hoy - timedelta(days=2),
                fechaFin=hoy - timedelta(days=1),
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_empacado.id,
                estado=EstadoEnvio.EMPACADO,
                fechaInicio=hoy - timedelta(days=1),
                fechaFin=None,
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            # R3 (ACEPTADO -> EMPACADO -> EN_TRANSITO)
            HistorialEstadoRemitoModel(
                remito_id=r_en_transito.id,
                estado=EstadoEnvio.ACEPTADO,
                fechaInicio=hoy - timedelta(days=4),
                fechaFin=hoy - timedelta(days=3),
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_en_transito.id,
                estado=EstadoEnvio.EMPACADO,
                fechaInicio=hoy - timedelta(days=3),
                fechaFin=hoy - timedelta(days=2),
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_en_transito.id,
                estado=EstadoEnvio.EN_TRANSITO,
                fechaInicio=hoy - timedelta(days=2),
                fechaFin=None,
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            # R4 (EMPACADO -> DESPACHADO)
            HistorialEstadoRemitoModel(
                remito_id=r_despachado.id,
                estado=EstadoEnvio.EMPACADO,
                fechaInicio=hoy - timedelta(days=3),
                fechaFin=hoy - timedelta(days=1),
                responsable_id=u_polo.id,
                responsable_nombre="Nicolás Peralta",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_despachado.id,
                estado=EstadoEnvio.DESPACHADO,
                fechaInicio=hoy - timedelta(days=1),
                fechaFin=None,
                responsable_id=u_polo.id,
                responsable_nombre="Nicolás Peralta",
            ),
            # R5 (ACEPTADO -> EMPACADO -> EN_TRANSITO -> RECIBIDO)
            HistorialEstadoRemitoModel(
                remito_id=r_recibido.id,
                estado=EstadoEnvio.ACEPTADO,
                fechaInicio=hoy - timedelta(days=20),
                fechaFin=hoy - timedelta(days=19),
                responsable_id=u_central.id,
                responsable_nombre="Lucía Fernández",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_recibido.id,
                estado=EstadoEnvio.EMPACADO,
                fechaInicio=hoy - timedelta(days=19),
                fechaFin=hoy - timedelta(days=18),
                responsable_id=u_central.id,
                responsable_nombre="Lucía Fernández",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_recibido.id,
                estado=EstadoEnvio.EN_TRANSITO,
                fechaInicio=hoy - timedelta(days=18),
                fechaFin=hoy - timedelta(days=16),
                responsable_id=u_central.id,
                responsable_nombre="Lucía Fernández",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_recibido.id,
                estado=EstadoEnvio.RECIBIDO,
                fechaInicio=hoy - timedelta(days=16),
                fechaFin=hoy - timedelta(days=16),
                responsable_id=u_campus.id,
                responsable_nombre="Mateo Rodríguez",
            ),
            # R6 (EMPACADO -> EN_TRANSITO -> CON_INCIDENCIA)
            HistorialEstadoRemitoModel(
                remito_id=r_incidencia.id,
                estado=EstadoEnvio.EMPACADO,
                fechaInicio=hoy - timedelta(days=10),
                fechaFin=hoy - timedelta(days=8),
                responsable_id=u_central.id,
                responsable_nombre="Lucía Fernández",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_incidencia.id,
                estado=EstadoEnvio.EN_TRANSITO,
                fechaInicio=hoy - timedelta(days=8),
                fechaFin=hoy - timedelta(days=5),
                responsable_id=u_central.id,
                responsable_nombre="Lucía Fernández",
            ),
            HistorialEstadoRemitoModel(
                remito_id=r_incidencia.id,
                estado=EstadoEnvio.CON_INCIDENCIA,
                fechaInicio=hoy - timedelta(days=5),
                fechaFin=hoy - timedelta(days=5),
                responsable_id=u_polo.id,
                responsable_nombre="Nicolás Peralta",
            ),
        ]
        db.add_all(historiales)
        db.flush()

        # 13. Reservas (en todos los estados: LISTA_PARA_RETIRO, ACTIVA, RETIRADA, CANCELADA, VENCIDA)
        reservas = [
            # RES 1: LISTA_PARA_RETIRO en Sede Central (Florencia -> Design Patterns GOF-CEN-002, vence en 2 días)
            # ¡Permite presionar "Entregar" en la Bandeja de Entrada y genera el préstamo automáticamente!
            ReservaModel(
                fecha=hoy - timedelta(days=2),
                estado=EstadoReserva.LISTA_PARA_RETIRO,
                socio_id=soc_florencia.id,
                libro_id=l_gof.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["GOF-CEN-002"].id,
                fecha_limite_retiro=hoy + timedelta(days=2),
                prestamo_id=None,
            ),
            # RES 2: LISTA_PARA_RETIRO en Sede Central (Juan Ignacio -> Clean Code CC-CEN-002, vence mañana)
            # ¡Aparece al buscar el DNI de Juan (40111222) en el Mostrador o en la Bandeja!
            ReservaModel(
                fecha=hoy - timedelta(days=3),
                estado=EstadoReserva.LISTA_PARA_RETIRO,
                socio_id=soc_juan.id,
                libro_id=l_clean_code.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["CC-CEN-002"].id,
                fecha_limite_retiro=hoy + timedelta(days=1),
                prestamo_id=None,
            ),
            # RES 3: LISTA_PARA_RETIRO en Sede Campus (Victoria -> Ficciones FIC-CAM-001, vence en 2 días)
            ReservaModel(
                fecha=hoy - timedelta(days=1),
                estado=EstadoReserva.LISTA_PARA_RETIRO,
                socio_id=soc_victoria.id,
                libro_id=l_ficciones.id,
                sede_id=s_campus.id,
                ejemplar_id=by_code["FIC-CAM-001"].id,
                fecha_limite_retiro=hoy + timedelta(days=2),
                prestamo_id=None,
            ),
            # RES 4: ACTIVA esperando devolución de DDIA en Sede Central (Carolina espera DDIA-CEN-001 que tiene Agustina en P2)
            # ¡Si devolvés el Préstamo #2 de Agustina, esta reserva pasa automáticamente a LISTA_PARA_RETIRO!
            ReservaModel(
                fecha=hoy - timedelta(days=2),
                estado=EstadoReserva.ACTIVA,
                socio_id=soc_carolina.id,
                libro_id=l_ddia.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["DDIA-CEN-001"].id,
                fecha_limite_retiro=None,
                prestamo_id=None,
            ),
            # RES 5: ACTIVA esperando devolución de GoF en Sede Campus (Paula espera GOF-CAM-001 que tiene Martín en P3)
            # ¡Además impide que Martín renueve el Préstamo #3, mostrando la validación de negocio!
            ReservaModel(
                fecha=hoy - timedelta(days=1),
                estado=EstadoReserva.ACTIVA,
                socio_id=soc_paula.id,
                libro_id=l_gof.id,
                sede_id=s_campus.id,
                ejemplar_id=by_code["GOF-CAM-001"].id,
                fecha_limite_retiro=None,
                prestamo_id=None,
            ),
            # RES 6: RETIRADA (ya se convirtió en préstamo anteriormente)
            ReservaModel(
                fecha=hoy - timedelta(days=18),
                estado=EstadoReserva.RETIRADA,
                socio_id=soc_facundo.id,
                libro_id=l_clean_arch.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["CA-CEN-003"].id,
                fecha_limite_retiro=hoy - timedelta(days=3),
                prestamo_id=p_activo_multi.id,
            ),
            # RES 7: CANCELADA
            ReservaModel(
                fecha=hoy - timedelta(days=10),
                estado=EstadoReserva.CANCELADA,
                socio_id=soc_gonzalo.id,
                libro_id=l_rayuela.id,
                sede_id=s_ncba.id,
                ejemplar_id=None,
                fecha_limite_retiro=None,
                prestamo_id=None,
            ),
            # RES 8: VENCIDA (el socio no se presentó antes de fecha_limite_retiro)
            ReservaModel(
                fecha=hoy - timedelta(days=12),
                estado=EstadoReserva.VENCIDA,
                socio_id=soc_micaela.id,
                libro_id=l_refactoring.id,
                sede_id=s_central.id,
                ejemplar_id=by_code["REF-CEN-001"].id,
                fecha_limite_retiro=hoy - timedelta(days=8),
                prestamo_id=None,
            ),
        ]
        db.add_all(reservas)
        db.commit()

    # 14. Ejecutar los casos de uso automáticos del scheduler para generar Avisos reales consistentes
    _registrar_multas_vencidas()
    _vencer_reservas()
    _generar_avisos()

    # Marcar 2 avisos como leídos para el admin así hay avisos LEÍDOS y NO LEÍDOS
    with SessionLocal() as db:
        avisos_db = db.query(AvisoModel).order_by(AvisoModel.id.asc()).all()
        if avisos_db:
            db.add(AvisoLecturaModel(aviso_id=avisos_db[0].id, usuario_id=1))
            db.commit()

    print("Seed completado exitosamente!")


if __name__ == "__main__":
    seed()
