from typing import List, Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class IncidenciaPorEstado:
    def __init__(
        self,
        estado: EstadoEjemplar,
        cantidad: int = 0,
    ) -> None:
        self.estado = estado
        self.cantidad = cantidad


class LogisticaSedeResumen:
    def __init__(
        self,
        sede_id: int,
        sede_nombre: str,
        total_envios: int = 0,
        exitosos: int = 0,
        con_incidencia: int = 0,
        en_curso: int = 0,
        tasa_exito_porcentaje: float = 0.0,
        tasa_incidencia_porcentaje: float = 0.0,
    ) -> None:
        self.sede_id = sede_id
        self.sede_nombre = sede_nombre
        self.total_envios = total_envios
        self.exitosos = exitosos
        self.con_incidencia = con_incidencia
        self.en_curso = en_curso
        self.tasa_exito_porcentaje = tasa_exito_porcentaje
        self.tasa_incidencia_porcentaje = tasa_incidencia_porcentaje


class IncidenciaDetalle:
    def __init__(
        self,
        remito_id: int,
        remito_numero: str,
        sede_origen_nombre: str,
        sede_destino_nombre: str,
        ejemplar_id: int,
        ejemplar_codigo: str,
        estado: EstadoEjemplar,
        observacion: str = "",
    ) -> None:
        self.remito_id = remito_id
        self.remito_numero = remito_numero
        self.sede_origen_nombre = sede_origen_nombre
        self.sede_destino_nombre = sede_destino_nombre
        self.ejemplar_id = ejemplar_id
        self.ejemplar_codigo = ejemplar_codigo
        self.estado = estado
        self.observacion = observacion


class LogisticaIncidenciasReport:
    def __init__(
        self,
        total_remitos: int = 0,
        remitos_finalizados: int = 0,
        remitos_exitosos: int = 0,
        remitos_con_incidencia: int = 0,
        remitos_en_curso: int = 0,
        tasa_exito_porcentaje: float = 0.0,
        tasa_incidencia_porcentaje: float = 0.0,
        incidencias_por_estado: Optional[List[IncidenciaPorEstado]] = None,
        por_sede_origen: Optional[List[LogisticaSedeResumen]] = None,
        incidencias_recientes: Optional[List[IncidenciaDetalle]] = None,
    ) -> None:
        self.total_remitos = total_remitos
        self.remitos_finalizados = remitos_finalizados
        self.remitos_exitosos = remitos_exitosos
        self.remitos_con_incidencia = remitos_con_incidencia
        self.remitos_en_curso = remitos_en_curso
        self.tasa_exito_porcentaje = tasa_exito_porcentaje
        self.tasa_incidencia_porcentaje = tasa_incidencia_porcentaje
        self.incidencias_por_estado = incidencias_por_estado if incidencias_por_estado is not None else []
        self.por_sede_origen = por_sede_origen if por_sede_origen is not None else []
        self.incidencias_recientes = incidencias_recientes if incidencias_recientes is not None else []
