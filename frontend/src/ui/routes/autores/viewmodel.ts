import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { createAutorAction, getAllAutoresAction } from "@/ui/actions/autor/autor.actions";
import { pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";

export function useViewModel(session: Session) {
    const load = useCallback(async () => pickData(await getAllAutoresAction(session), (data) => data.autores), [session]);

    return useLibraryRecordsViewModel({
        title: "Autores", initialFilters: null,
        load,
        getLabel: (autor) => `${autor.nombre} ${autor.apellido}`,
        create: {
            label: "Registrar autor",
            fields: [{ name: "nombre", placeholder: "Ej. Jorge Luis", label: "Nombre", required: true }, { name: "apellido", placeholder: "Ej. Borges", label: "Apellido", required: true }],
            submit: (field) => createAutorAction({ session, ...readFields(field, "nombre", "apellido") })
        }
    });
}
