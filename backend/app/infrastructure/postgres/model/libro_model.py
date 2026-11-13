from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

libro_autor_table = Table(
    "libro_autor",
    Base.metadata,
    Column("libro_id", Integer, ForeignKey("libros.id", ondelete="CASCADE"), primary_key=True),
    Column("autor_id", Integer, ForeignKey("autores.id", ondelete="CASCADE"), primary_key=True),
)


class LibroModel(Base):
    __tablename__ = "libros"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(200), nullable=True)
    añoPublicacion = Column(Integer, nullable=True)
    editorial = Column(String(150), nullable=True)
    edicion = Column(String(100), nullable=True)

    autores = relationship("AutorModel", secondary=libro_autor_table, lazy="joined")
