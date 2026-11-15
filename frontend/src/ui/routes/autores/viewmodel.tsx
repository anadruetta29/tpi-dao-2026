import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { type Autor } from "@/domain/entities/autor";
import { createAutorAction, getAllAutoresAction } from "@/ui/actions/autor/autor.actions";
import { pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";

export function useViewModel(session: Session) {
    {/* ===== Fetch data ===== */ }

    const fetchAutores = useCallback(async () => {
        const result = await getAllAutoresAction(session);
        return pickData(result, (data) => data.autores);
    }, [session]);

    {/* ===== handlers functions ===== */ }

    const handleCreateAutor = (field: ReadField) => {
        return createAutorAction({
            session,
            ...readFields(field, "nombre", "apellido")
        });
    };

    {/* ===== variables ===== */ }

    const getAutorLabel = (autor: Autor) => `${autor.nombre} ${autor.apellido}`;

    const createFields: Field[] = [
        { name: "nombre", placeholder: "Ej. Jorge Luis", label: "Nombre", required: true },
        { name: "apellido", placeholder: "Ej. Borges", label: "Apellido", required: true }
    ];

    return useLibraryRecordsViewModel({
        title: "Autores",
        initialFilters: null,
        load: fetchAutores,
        getLabel: getAutorLabel,
        create: {
            label: "Registrar autor",
            fields: createFields,
            submit: handleCreateAutor
        }
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
