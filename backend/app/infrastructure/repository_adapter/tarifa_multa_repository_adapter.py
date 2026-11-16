from typing import List, Optional
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.tarifa_multa import TarifaMulta
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI
from app.infrastructure.postgres.mapper.tarifa_multa_entity_mapper import TarifaMultaEntityMapper
from app.infrastructure.postgres.repository.postgres_tarifa_multa_repository import PostgresTarifaMultaRepository


class TarifaMultaRepositoryAdapter(TarifaMultaRepositoryI):
    def __init__(self, repository: PostgresTarifaMultaRepository) -> None:
        self.repository = repository

    def get_all(self) -> List[TarifaMulta]:
        return [TarifaMultaEntityMapper.to_domain(m) for m in self.repository.find_all()]

    def get_by_motivo(self, motivo: MotivoMulta) -> Optional[TarifaMulta]:
        model = self.repository.find_by_motivo(motivo.value)
        return TarifaMultaEntityMapper.to_domain(model) if model is not None else None

    def save_or_update(self, tarifa: TarifaMulta) -> TarifaMulta:
        saved = self.repository.save_or_update(TarifaMultaEntityMapper.to_model(tarifa))
        return TarifaMultaEntityMapper.to_domain(saved)
