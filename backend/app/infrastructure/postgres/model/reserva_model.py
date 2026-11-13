from sqlalchemy import Column, ForeignKey, Integer, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.estado_reserva import EstadoReserva


class ReservaModel(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=True)
    estado = Column(SQLEnum(EstadoReserva), nullable=True)
    socio_id = Column(Integer, ForeignKey("socios.id"), nullable=True, index=True)
    libro_id = Column(Integer, ForeignKey("libros.id"), nullable=True, index=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    ejemplar_id = Column(Integer, ForeignKey("ejemplares.id"), nullable=True, index=True)
