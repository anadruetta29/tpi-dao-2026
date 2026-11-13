from app.application.service.libro_service_i import LibroServiceI
from app.application.use_case.libro import (
    CreateLibroUseCase,
    DeleteLibroUseCase,
    GetAllLibrosUseCase,
    GetLibroByIdUseCase,
    GetLibroDisponibilidadUseCase,
    UpdateLibroUseCase,
)
from app.presentation.dto.libro.mapper import LibroMapper
from app.presentation.dto.libro.request import (
    CreateLibroReq,
    DeleteLibroReq,
    GetAllLibrosReq,
    GetLibroByIdReq,
    UpdateLibroReq,
)
from app.presentation.dto.libro.response import (
    GetAllLibrosRes,
    GetLibroDisponibilidadRes,
    LibroRes,
)


class LibroService(LibroServiceI):
    def __init__(
        self,
        get_all_use_case: GetAllLibrosUseCase,
        get_by_id_use_case: GetLibroByIdUseCase,
        get_disponibilidad_use_case: GetLibroDisponibilidadUseCase,
        create_use_case: CreateLibroUseCase,
        update_use_case: UpdateLibroUseCase,
        delete_use_case: DeleteLibroUseCase,
    ) -> None:
        self.get_all_use_case = get_all_use_case
        self.get_by_id_use_case = get_by_id_use_case
        self.get_disponibilidad_use_case = get_disponibilidad_use_case
        self.create_use_case = create_use_case
        self.update_use_case = update_use_case
        self.delete_use_case = delete_use_case

    def get_all(self, dto: GetAllLibrosReq) -> GetAllLibrosRes:
        result = self.get_all_use_case.execute(
            GetAllLibrosUseCase.Command(
                token=dto.get_token(),
                titulo=dto.get_titulo(),
                autor=dto.get_autor(),
                editorial=dto.get_editorial(),
            )
        )
        return LibroMapper.to_get_all_response(result.libros)

    def get_by_id(self, dto: GetLibroByIdReq) -> LibroRes:
        result = self.get_by_id_use_case.execute(
            GetLibroByIdUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return LibroMapper.to_response(result.libro)

    def get_disponibilidad(self, dto: GetLibroByIdReq) -> GetLibroDisponibilidadRes:
        result = self.get_disponibilidad_use_case.execute(
            GetLibroDisponibilidadUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
        return LibroMapper.to_disponibilidad_response(result.libro_id, result.ejemplares)

    def create(self, dto: CreateLibroReq) -> LibroRes:
        result = self.create_use_case.execute(
            CreateLibroUseCase.Command(
                token=dto.get_token(),
                titulo=dto.get_titulo(),
                añoPublicacion=dto.get_año_publicacion(),
                editorial=dto.get_editorial(),
                edicion=dto.get_edicion(),
                autor_ids=dto.get_autor_ids(),
            )
        )
        return LibroMapper.to_response(result.libro)

    def update(self, dto: UpdateLibroReq) -> LibroRes:
        result = self.update_use_case.execute(
            UpdateLibroUseCase.Command(
                token=dto.get_token(),
                id=dto.get_id(),
                titulo=dto.get_titulo(),
                añoPublicacion=dto.get_año_publicacion(),
                editorial=dto.get_editorial(),
                edicion=dto.get_edicion(),
                autor_ids=dto.get_autor_ids(),
            )
        )
        return LibroMapper.to_response(result.libro)

    def delete(self, dto: DeleteLibroReq) -> None:
        self.delete_use_case.execute(
            DeleteLibroUseCase.Command(token=dto.get_token(), id=dto.get_id())
        )
