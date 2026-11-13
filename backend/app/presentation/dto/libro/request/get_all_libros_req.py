from typing import Optional


class GetAllLibrosReq:
    def __init__(
        self,
        token: Optional[str] = None,
        titulo: Optional[str] = None,
        autor: Optional[str] = None,
        editorial: Optional[str] = None,
    ) -> None:
        self.token = token
        self.titulo = titulo
        self.autor = autor
        self.editorial = editorial

    @staticmethod
    def build(
        token: Optional[str],
        titulo: Optional[str] = None,
        autor: Optional[str] = None,
        editorial: Optional[str] = None,
    ) -> "GetAllLibrosReq":
        return GetAllLibrosReq(token=token, titulo=titulo, autor=autor, editorial=editorial)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_titulo(self) -> Optional[str]:
        return self.titulo

    def get_autor(self) -> Optional[str]:
        return self.autor

    def get_editorial(self) -> Optional[str]:
        return self.editorial
