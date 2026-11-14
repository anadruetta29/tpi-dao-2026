import { useCallback, useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { EstadoSede, type Sede } from "@/domain/entities/sede";
import { type Session } from "@/domain/entities/session";
import { createEjemplarAction, getAllEjemplaresAction, getEjemplarByIdAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";

export function useEjemplaresViewModel(session: Session, libroId: string) {
    const [sedesResult, setSedesResult] = useState<ActionState<Sede[]> | null>(null);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        let active = true;
        void getAllSedesAction({ session }).then((result) => {
            if (active) setSedesResult(result);
        });
        return () => { active = false; };
    }, [session, revision]);

    const sedes = sedesResult?.data ?? [];
    const sedeNames = new Map(sedes.map(({ id, nombre }) => [id, nombre]));
    const options = sedes.map(({ id, nombre, estadoEntity }) => ({
        value: id, label: nombre, isActive: estadoEntity === EstadoSede.ACTIVA
    }));
    const activeOptions = options.filter(({ isActive }) => isActive);
    const load = useCallback(async ({ sedeId, estado }: { sedeId: string; estado: string }) =>
        pickData(await getAllEjemplaresAction({ session, libro_id: libroId, sede_id: sedeId, estado }), (data) => data.ejemplares),
    [session, libroId]);
    const loadDetail = useCallback(async (id: string) =>
        pickData(await getEjemplarByIdAction(id, session), (data) => data.ejemplar), [session]);

    const records = useLibraryRecordsViewModel({
        title: "Ejemplares físicos",
        initialFilters: { sedeId: "", estado: "" },
        load, loadDetail,
        filter: {
            label: "Filtrar ejemplares",
            fields: [
                { name: "sedeId", label: "Sede", options: allOptions(options) },
                { name: "estado", label: "Estado", options: allOptions(EstadoEjemplar.toOptions()) }
            ],
            submit: (field) => readFields(field, "sedeId", "estado")
        },
        getLabel: (ejemplar) => `${ejemplar.codigo} · ${ejemplar.estadoName} · ${sedeNames.get(ejemplar.sedeId) ?? "Sede no disponible"}`,
        create: {
            label: "Registrar ejemplar",
            fields: [
                { name: "codigo", placeholder: "Ej. EJ-001", label: "Código", required: true },
                { name: "sedeId", label: "Sede", required: true, defaultValue: "",
                    options: [{ value: "", label: "Seleccioná una sede" }, ...activeOptions] }
            ],
            submitDisabled: activeOptions.length === 0,
            submit: (field) => createEjemplarAction({
                session,
                codigo: field("codigo"),
                libro_id: libroId,
                sede_id: field("sedeId")
            })
        },
        describe: (ejemplar) => ({
            info: [info("Código", ejemplar.codigo), info("Sede", sedeNames.get(ejemplar.sedeId)), info("Estado", ejemplar.estadoName)]
        })
    });

    return {
        records,
        loadingSedes: sedesResult === null,
        sedesError: sedesResult && !sedesResult.success ? sedesResult.error || "No se pudieron cargar las sedes." : null,
        noActiveSedes: Boolean(sedesResult?.success && activeOptions.length === 0),
        retrySedes: () => {
            setSedesResult(null);
            setRevision((current) => current + 1);
        }
    };
}
