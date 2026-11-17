from typing import List, Optional


class MovimientoRuta:
    def __init__(
        self,
        sede_origen_id: int,
        sede_origen_nombre: str,
        sede_destino_id: int,
        sede_destino_nombre: str,
        cantidad_remitos: int = 0,
        cantidad_ejemplares: int = 0,
        remitos_recibidos: int = 0,
        remitos_en_transito: int = 0,
        tiempo_promedio_transito_dias: Optional[float] = None,
        tiempo_minimo_transito_dias: Optional[int] = None,
        tiempo_maximo_transito_dias: Optional[int] = None,
    ) -> None:
        self.sede_origen_id = sede_origen_id
        self.sede_origen_nombre = sede_origen_nombre
        self.sede_destino_id = sede_destino_id
        self.sede_destino_nombre = sede_destino_nombre
        self.cantidad_remitos = cantidad_remitos
        self.cantidad_ejemplares = cantidad_ejemplares
        self.remitos_recibidos = remitos_recibidos
        self.remitos_en_transito = remitos_en_transito
        self.tiempo_promedio_transito_dias = tiempo_promedio_transito_dias
        self.tiempo_minimo_transito_dias = tiempo_minimo_transito_dias
        self.tiempo_maximo_transito_dias = tiempo_maximo_transito_dias


class MovimientoSedesReport:
    def __init__(
        self,
        total_remitos: int = 0,
        total_ejemplares_movidos: int = 0,
        tiempo_promedio_global_dias: Optional[float] = None,
        rutas: Optional[List[MovimientoRuta]] = None,
    ) -> None:
        self.total_remitos = total_remitos
        self.total_ejemplares_movidos = total_ejemplares_movidos
        self.tiempo_promedio_global_dias = tiempo_promedio_global_dias
        self.rutas = rutas if rutas is not None else []
