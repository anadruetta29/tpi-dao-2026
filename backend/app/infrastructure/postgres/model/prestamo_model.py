from sqlalchemy import Column, ForeignKey, Integer, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal


class PrestamoModel(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fechaInicio = Column(Date, nullable=True)
    fechaVencimiento = Column(Date, nullable=True)
    fechaDevolucion = Column(Date, nullable=True)
    estado = Column(SQLEnum(EstadoPrestamo), nullable=True)
    modalidad = Column(SQLEnum(ModalidadPrestamoLocal), nullable=True)
    solicitud_id = Column(Integer, ForeignKey("solicitudes_prestamo.id"), nullable=True, index=True)
    socio_id = Column(Integer, ForeignKey("socios.id"), nullable=True, index=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    ejemplar_id = Column(Integer, ForeignKey("ejemplares.id"), nullable=True, index=True)
