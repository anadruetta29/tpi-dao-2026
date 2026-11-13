from typing import Any, Dict, List, Optional


class CreateLibroReq:
    def __init__(
        self,
        token: Optional[str] = None,
        titulo: Optional[str] = None,
        añoPublicacion: Optional[int] = None,
        editorial: Optional[str] = None,
        edicion: Optional[str] = None,
        autor_ids: Optional[List[int]] = None,
    ) -> None:
        self.token = token
        self.titulo = titulo
        self.añoPublicacion = añoPublicacion
        self.editorial = editorial
        self.edicion = edicion
        self.autor_ids = autor_ids if autor_ids is not None else []

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateLibroReq":
        payload = payload or {}
        raw_year = payload.get("añoPublicacion")
        raw_autores = payload.get("autor_ids")
        return CreateLibroReq(
            token=token,
            titulo=str(payload["titulo"]).strip() if payload.get("titulo") is not None else None,
            añoPublicacion=int(raw_year) if raw_year is not None else None,
            editorial=str(payload["editorial"]).strip() if payload.get("editorial") is not None else None,
            edicion=str(payload["edicion"]).strip() if payload.get("edicion") is not None else None,
            autor_ids=[int(a) for a in raw_autores] if isinstance(raw_autores, list) else [],
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_titulo(self) -> Optional[str]:
        return self.titulo

    def get_año_publicacion(self) -> Optional[int]:
        return self.añoPublicacion

    def get_editorial(self) -> Optional[str]:
        return self.editorial

    def get_edicion(self) -> Optional[str]:
        return self.edicion

    def get_autor_ids(self) -> List[int]:
        return self.autor_ids
