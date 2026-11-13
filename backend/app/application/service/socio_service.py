from app.application.service.socio_service_i import SocioServiceI
from app.application.use_case.socio import (
    CreateSocioUseCase,
    DeleteSocioUseCase,
    GetAllSociosUseCase,
    GetSocioByIdUseCase,
    GetSocioMultasUseCase,
    GetSocioPrestamosUseCase,
    UpdateSocioUseCase,
)
from app.presentation.dto.socio.mapper import SocioMapper
from app.presentation.dto.socio.request import (
    CreateSocioReq,
    DeleteSocioReq,
    GetAllSociosReq,
    GetSocioByIdReq,
    UpdateSocioReq,
)
from app.presentation.dto.socio.response import (
    GetAllSociosRes,
    GetSocioMultasRes,
    GetSocioPrestamosRes,
    SocioRes,
)


class SocioService(SocioServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllSociosUseCase,
        get_by_id_use_case: GetSocioByIdUseCase,
        get_prestamos_use_case: GetSocioPrestamosUseCase,
        get_multas_use_case: GetSocioMultasUseCase,
        create_use_case: CreateSocioUseCase,
        update_use_case: UpdateSocioUseCase,
        delete_use_case: DeleteSocioUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.get_prestamos_use_case = get_prestamos_use_case
        self.get_multas_use_case = get_multas_use_case
        self.create_use_case = create_use_case
        self.update_use_case = update_use_case
        self.delete_use_case = delete_use_case

    def get_all(self, dto: GetAllSociosReq) -> GetAllSociosRes:
        result = self.get_all_use_case.execute(
            GetAllSociosUseCase.Command(
                token=dto.get_token(),
                q=dto.get_q(),
                documento=dto.get_documento(),
                estado=dto.get_estado(),
            )
        )
        return SocioMapper.to_get_all_response(result.socios)

    def get_by_id(self, dto: GetSocioByIdReq) -> SocioRes:
        result = self.get_by_id_use_case.execute(
            GetSocioByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SocioMapper.to_response(result.socio)

    def get_prestamos(self, dto: GetSocioByIdReq) -> GetSocioPrestamosRes:
        result = self.get_prestamos_use_case.execute(
            GetSocioPrestamosUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SocioMapper.to_prestamos_response(result.socio_id, result.prestamos)

    def get_multas(self, dto: GetSocioByIdReq) -> GetSocioMultasRes:
        result = self.get_multas_use_case.execute(
            GetSocioMultasUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SocioMapper.to_multas_response(result.socio_id, result.multas)

    def create(self, dto: CreateSocioReq) -> SocioRes:
        result = self.create_use_case.execute(
            CreateSocioUseCase.Command(
                token=dto.get_token(),
                nombre=dto.get_nombre(),
                apellido=dto.get_apellido(),
                documento=dto.get_documento(),
                email=dto.get_email(),
                telefono=dto.get_telefono(),
            )
        )
        return SocioMapper.to_response(result.socio)

    def update(self, dto: UpdateSocioReq) -> SocioRes:
        result = self.update_use_case.execute(
            UpdateSocioUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                nombre=dto.get_nombre(),
                apellido=dto.get_apellido(),
                documento=dto.get_documento(),
                email=dto.get_email(),
                telefono=dto.get_telefono(),
            )
        )
        return SocioMapper.to_response(result.socio)

    def delete(self, dto: DeleteSocioReq) -> SocioRes:
        result = self.delete_use_case.execute(
            DeleteSocioUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return SocioMapper.to_response(result.socio)
