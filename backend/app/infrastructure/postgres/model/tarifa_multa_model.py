from sqlalchemy import Column, Float, String
from app.infrastructure.database import Base


class TarifaMultaModel(Base):
    __tablename__ = "tarifas_multa"

    motivo = Column(String(30), primary_key=True)
    monto = Column(Float, nullable=False)
