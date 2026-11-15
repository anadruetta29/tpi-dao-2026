import logging
from datetime import date
from typing import Callable, ContextManager
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI

logger = logging.getLogger(__name__)


class EnviarAvisosUseCase:
    def __init__(
        self,
        avisos: AvisoRepositoryI,
        socios: SocioRepositoryI,
        enviar: Callable[[str, str, str], None],
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.avisos = avisos
        self.socios = socios
        self.enviar = enviar
        self.transaction = transaction

    def execute(self, hoy: date) -> None:
        with self.transaction():
            ids = self.avisos.get_ids_sin_email()

        for id in ids:
            with self.transaction():
                aviso = self.avisos.get_by_id_for_update(id)
                if aviso is None or aviso.fecha_email is not None or aviso.socio_id is None:
                    continue
                socio = self.socios.get_by_id(aviso.socio_id)
                if socio is None or not socio.email:
                    continue
                try:
                    self.enviar(socio.email, "Aviso de la biblioteca", aviso.mensaje)
                except (OSError, ValueError) as exc:
                    logger.warning("No se pudo enviar el aviso %s (%s)", id, type(exc).__name__)
                    continue
                aviso.fecha_email = hoy
                self.avisos.actualizar_email(aviso)
