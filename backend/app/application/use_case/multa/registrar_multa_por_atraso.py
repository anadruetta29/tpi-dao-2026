from datetime import date
from typing import Optional
from app.application.strategy.calculo_multa.implementation.entrega_tardia_multa_strategy import (
    EntregaTardiaMultaStrategy,
)
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.multa import Multa
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI


def registrar_multa_por_atraso(
    prestamo: Prestamo,
    fecha: date,
    multa_repository: Optional[MultaRepositoryI],
    socio_repository: Optional[SocioRepositoryI],
) -> None:
    if prestamo.id is None or multa_repository is None:
        return

    motivo = MotivoMulta.ENTREGA_TARDIA
    multas = [
        multa for multa in multa_repository.get_all_by_prestamo_and_motivo_for_update(prestamo.id, motivo)
        if multa.socio_id == prestamo.socio_id
    ]
    if any(multa.estado == EstadoMulta.ANULADA for multa in multas):
        return

    multa = next((multa for multa in multas if multa.estado == EstadoMulta.PENDIENTE), None)
    pagado = sum(multa.monto or 0.0 for multa in multas if multa.estado == EstadoMulta.PAGADA)
    dias_atraso = prestamo.dias_de_atraso(fecha)
    monto_total = EntregaTardiaMultaStrategy().calcular_monto(dias_atraso) if dias_atraso else 0.0
    monto = monto_total - pagado
    if monto <= 0:
        if multa is not None and multa.id is not None:
            multa.anular()
            multa_repository.update(multa.id, multa)
            if socio_repository is not None and prestamo.socio_id is not None:
                socio = socio_repository.get_by_id_for_update(prestamo.socio_id)
                if socio is not None and socio.id is not None and not multa_repository.has_pending_by_socio(socio.id):
                    socio.habilitar()
                    socio_repository.update(socio.id, socio)
        return

    if multa is not None:
        if multa.id is not None and multa.monto != monto:
            multa.monto = monto
            multa_repository.update(multa.id, multa)
        return

    socio = None
    if socio_repository is not None and prestamo.socio_id is not None:
        socio = socio_repository.get_by_id_for_update(prestamo.socio_id)
    multa_repository.save(
        Multa(
            fechaEmision=fecha,
            motivo=motivo,
            monto=monto,
            estado=EstadoMulta.PENDIENTE,
            socio_id=prestamo.socio_id,
            prestamo_id=prestamo.id,
        )
    )
    if socio_repository is not None and socio is not None and socio.id is not None:
        socio.inhabilitar()
        socio_repository.update(socio.id, socio)
