from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.tipo_prestamo import TipoPrestamo
from app.domain.entities.estado_solicitud import EstadoSolicitud


class SolicitudPrestamoModel(Base):
    __tablename__ = "solicitudes_prestamo"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(50), unique=True, index=True, nullable=True)
    tipo = Column(SQLEnum(TipoPrestamo), nullable=True)
    estado = Column(SQLEnum(EstadoSolicitud), nullable=True)
