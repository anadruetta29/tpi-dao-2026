from sqlalchemy import Column, Integer, String, Date
from app.infrastructure.database import Base


class RemitoModel(Base):
    __tablename__ = "remitos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(50), unique=True, index=True, nullable=True)
    fechaEmision = Column(Date, nullable=True)
    fechaDespacho = Column(Date, nullable=True)
    fechaRecepcion = Column(Date, nullable=True)
