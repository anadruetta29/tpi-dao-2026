import { useCallback } from "react";
import { type Aviso } from "@/domain/entities/aviso";
import { type Session } from "@/domain/entities/session";
import { getAllAvisosAction, marcarAvisoLeidoAction } from "@/ui/actions/aviso/aviso.actions";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { estadosLectura, tiposAviso } from "@/core/utils/constants";
import type { DestinoBandeja } from "@/core/types";

export default function ViewModel(session: Session, onOpen?: (destino: DestinoBandeja) => void) {
    const catalog = useSelectorCatalog(session, "sedes", "socios");
    const sedeNames = new Map((catalog.sedes?.data ?? []).map(({ value, label }) => [value, label]));
    const socioNames = new Map((catalog.socios?.data ?? []).map(({ value, label }) => [value, label]));

    const fetchAvisos = useCallback(async ({ tipo, lectura }: { tipo: string; lectura: string }) => {
        const result = await getAllAvisosAction({ session });
        return pickData(result, (avisos) => avisos.filter((aviso) =>
            (!tipo || aviso.tipo === tipo)
            && (!lectura || (lectura === "leido" ? aviso.leido : !aviso.leido))
        ));
    }, [session]);

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "tipo", "lectura");
    };

    const describeAviso = (aviso: Aviso) => ({
        info: [
            info("Tipo", aviso.tipoName),
            info("Fecha", aviso.fecha),
            info("Estado", aviso.leido ? "Leído" : "Pendiente de lectura"),
            info("Mensaje", aviso.mensaje),
            info("Sede", sedeNames.get(aviso.sedeId) ?? aviso.sedeId),
            info("Socio", socioNames.get(aviso.socioId) ?? aviso.socioId),
            info("Reserva", aviso.reservaId),
            info("Préstamo", aviso.prestamoId)
        ],
        commands: [
            ...(!aviso.leido ? [{
                label: "Marcar como leído",
                confirm: "¿Querés marcar este aviso como leído?",
                execute: () => marcarAvisoLeidoAction({ id: aviso.id, session })
            }] : []),
            ...(onOpen && aviso.reservaId ? [{
                label: "Abrir reserva",
                confirm: "¿Querés abrir la reserva asociada?",
                execute: async () => {
                    onOpen({ modulo: "Reservas", id: aviso.reservaId });
                    return { success: true, data: aviso };
                }
            }] : []),
            ...(onOpen && aviso.prestamoId ? [{
                label: "Abrir préstamo",
                confirm: "¿Querés abrir el préstamo asociado?",
                execute: async () => {
                    onOpen({ modulo: "Préstamos", id: aviso.prestamoId });
                    return { success: true, data: aviso };
                }
            }] : [])
        ]
    });

    const filterFields: Field[] = [
        { name: "tipo", label: "Tipo", options: tiposAviso },
        { name: "lectura", label: "Lectura", options: estadosLectura }
    ];

    return useLibraryRecordsViewModel({
        title: "Avisos",
        newestFirst: true,
        initialFilters: { tipo: "", lectura: "" },
        load: fetchAvisos,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: (aviso) => `${aviso.leido ? "" : "[Nuevo] "}${aviso.tipoName} · ${String(aviso.fecha ?? "").slice(0, 10)}`,
        describe: describeAviso
    });
}

