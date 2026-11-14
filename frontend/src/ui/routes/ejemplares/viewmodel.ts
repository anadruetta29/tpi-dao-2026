import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { createEjemplarAction, getAllEjemplaresAction, getEjemplarByIdAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { idField, readFields } from "@/ui/forms/handlers/record-fields";

export function useViewModel(session: Session) {
    const load = useCallback(async ({ libroId, sedeId, estado }: { libroId: string; sedeId: string; estado: string }) =>
        pickData(await getAllEjemplaresAction({ session, libro_id: libroId, sede_id: sedeId, estado }), (data) => data.ejemplares), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getEjemplarByIdAction(id, session), (data) => data.ejemplar), [session]);

    return useLibraryRecordsViewModel({
        title: "Ejemplares", initialFilters: { libroId: "", sedeId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            idField("libroId", "ID de libro"), idField("sedeId", "ID de sede"),
            { name: "estado", label: "Estado", options: allOptions(EstadoEjemplar.toOptions()) }
        ], submit: (field) => readFields(field, "libroId", "sedeId", "estado") },
        getLabel: (ejemplar) => `${ejemplar.codigo} · ${ejemplar.estadoName}`,
        create: {
            label: "Registrar ejemplar",
            fields: [{ name: "codigo", placeholder: "Ej. EJ-001", label: "Código", required: true }, idField("libroId", "ID de libro", true), idField("sedeId", "ID de sede", true)],
            submit: (field) => createEjemplarAction({ session, codigo: field("codigo"), libro_id: field("libroId"), sede_id: field("sedeId") })
        },
        describe: (ejemplar) => ({
            info: [info("Código", ejemplar.codigo), info("Libro", ejemplar.libroId), info("Sede", ejemplar.sedeId), info("Estado", ejemplar.estadoName)]
        })
    });
}
