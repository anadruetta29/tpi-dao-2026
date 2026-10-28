from sqlalchemy import Column, Integer, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.estado_reserva import EstadoReserva


class ReservaModel(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=True)
    estado = Column(SQLEnum(EstadoReserva), nullable=True)
