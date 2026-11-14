from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config.settings import settings

DATABASE_URL = (
    f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


@contextmanager
def atomic_write(db):
    with db.begin():
        db.info["atomic_write"] = True
        try:
            yield
        finally:
            db.info.pop("atomic_write", None)


def flush_or_commit(db):
    if db.info.get("atomic_write"):
        db.flush()
    else:
        db.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
