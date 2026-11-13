from sqlalchemy import Column, ForeignKey, Integer, String, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.entity.estado_solicitud import EstadoSolicitud


class SolicitudPrestamoModel(Base):
    __tablename__ = "solicitudes_prestamo"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(50), unique=True, index=True, nullable=True)
    tipo = Column(SQLEnum(TipoPrestamo), nullable=True)
    estado = Column(SQLEnum(EstadoSolicitud), nullable=True)
    socio_id = Column(Integer, ForeignKey("socios.id"), nullable=True, index=True)
    ejemplar_id = Column(Integer, ForeignKey("ejemplares.id"), nullable=True, index=True)
    sede_origen_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    sede_destino_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    responsable_origen_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    responsable_destino_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
