from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from app.infrastructure.database import Base


class AvisoModel(Base):
    __tablename__ = "avisos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clave = Column(String(100), unique=True, nullable=False)
    tipo = Column(String(30), nullable=False)
    mensaje = Column(Text, nullable=False)
    fecha = Column(Date, nullable=False)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    socio_id = Column(Integer, ForeignKey("socios.id"), nullable=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=True)
    prestamo_id = Column(Integer, ForeignKey("prestamos.id"), nullable=True)


class AvisoLecturaModel(Base):
    __tablename__ = "avisos_lecturas"

    aviso_id = Column(Integer, ForeignKey("avisos.id", ondelete="CASCADE"), primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True)
