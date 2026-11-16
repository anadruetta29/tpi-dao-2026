import type { EstadoEjemplar } from "@/domain/entities/estado-ejemplar";
import type { CriterioMostrador } from "@/ui/actions/mostrador/mostrador.actions";
import type { LibraryRecords } from "@/ui/components/library-records/library-records";
import type { ComponentProps } from "react";

export interface ActionState<T = any> {
    success: boolean;
    data?: T;
    error?: string | null;
    message?: string | null;
}

export type ModuloBandeja =
    | "Solicitudes de préstamo"
    | "Remitos"
    | "Préstamos"
    | "Reservas"
    | "Avisos";

export type DestinoBandeja = {
    modulo: ModuloBandeja;
    id: string;
};

export type AccionInline = {
    label: string;
    tone?: "primary";
    execute: () => Promise<ActionState<unknown>>;
};

export type Pendiente = DestinoBandeja & {
    label: string;
    detalle: string;
    sedeId: string;
    accion?: AccionInline;
};

export type Grupo = {
    titulo: string;
    items: ActionState<Pendiente[]>;
};

export type Busqueda = {
    criterio: CriterioMostrador
    ;
    valor: string;
    sedeId: string;
};

export type SolicitudInterbibliotecariaInicial = {
    sedeOrigenId: string;
    sedeDestinoId: string;
    ejemplarId: string;
};

export type SedeDisponibilidad = {
    sedeId: string;
    sedeNombre?: string;
    sedeActiva: boolean;
    disponibles: number;
    ejemplares: {
        id: string;
        estado: EstadoEjemplar;
    }[];
};

export type Disponibilidad = ActionState<{
    sedes: SedeDisponibilidad[];
}>;

export type RecordsView = ComponentProps<typeof LibraryRecords>["view"];

export type LibroFilters = {
    titulo: string;
    autor: string;
    editorial: string;
};