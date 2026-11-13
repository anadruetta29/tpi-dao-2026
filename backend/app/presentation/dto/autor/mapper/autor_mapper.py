from typing import Any, Dict, List, Optional
from app.domain.entity.autor import Autor
from app.presentation.dto.autor.request import CreateAutorReq, GetAllAutoresReq
from app.presentation.dto.autor.response import AutorRes, GetAllAutoresRes


class AutorMapper:
    @staticmethod
    def to_get_all_request(token: Optional[str]) -> GetAllAutoresReq:
        return GetAllAutoresReq.build(token)

    @staticmethod
    def to_get_all_response(autores: List[Autor]) -> GetAllAutoresRes:
        return GetAllAutoresRes.from_domain_list(autores)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateAutorReq:
        return CreateAutorReq.build(token, payload)

    @staticmethod
    def to_response(autor: Autor) -> AutorRes:
        return AutorRes.from_domain(autor)
