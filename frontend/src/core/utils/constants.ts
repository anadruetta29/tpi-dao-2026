import { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";
import { DIAS_PARA_ATRASO_REMITO } from "@/domain/entities/remito";
import { allOptions, type Field } from "@/ui/routes/use-library-records-viewmodel";

export const tiposAviso = allOptions([
    { value: "RESERVA_LISTA", label: "Reserva lista" },
    { value: "PRESTAMO_POR_VENCER", label: "Vencimiento próximo" },
    { value: "PRESTAMO_ATRASADO", label: "Préstamo atrasado" }
]);

export const estadosLectura = allOptions([
    { value: "pendiente", label: "Pendientes de lectura" },
    { value: "leido", label: "Leídos" }
]);

export const estados = [
    EstadoEjemplar.DISPONIBLE,
    EstadoEjemplar.DANADO,
    EstadoEjemplar.EXTRAVIADO,
    EstadoEjemplar.DESTRUIDO,
    EstadoEjemplar.EN_REVISION
].map((estado) => estado.toOption());

export const filterFields: Field[] = [
    { name: "titulo", placeholder: "Ej. El Aleph", label: "Título" },
    { name: "autor", placeholder: "Buscá por autor", label: "Autor" },
    { name: "editorial", placeholder: "Ej. Losada", label: "Editorial" }
];

/** Remitos: */

export const receptionOptions = [
    { value: "false", label: "Sin incidencias" },
    { value: "true", label: "Con incidencia" }
];

export const seguimientoOptions = allOptions([
    { value: "pendientes", label: "Pendientes" },
    { value: "atrasados", label: `Atrasados (${DIAS_PARA_ATRASO_REMITO} días o más)` },
    { value: "incidencias", label: "Incidencias sin resolver" }
]);