import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { type Autor } from "@/domain/entities/autor";
import { createAutorAction, getAllAutoresAction, updateAutorAction } from "@/ui/actions/autor/autor.actions";
import { info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";

export default function ViewModel(session: Session) {
    // ===== Fetch data =====

    const fetchAutores = useCallback(async () => {
        const result = await getAllAutoresAction(session);
        return pickData(result, (data) => data.autores);
    }, [session]);

    // ===== Handlers functions =====

    const handleCreateAutor = (field: ReadField) => {
        return createAutorAction({
            session,
            ...readFields(field, "nombre", "apellido")
        });
    };

    const handleUpdateAutor = (autor: Autor, field: ReadField) => {
        return updateAutorAction({
            session,
            id: autor.id,
            ...readFields(field, "nombre", "apellido")
        });
    };

    // ===== Variables =====

    const getAutorLabel = (autor: Autor) => `${autor.nombre} ${autor.apellido}`;

    const autorFields = (autor?: Autor): Field[] => [
        { name: "nombre", placeholder: "Ej. Jorge Luis", label: "Nombre", defaultValue: autor?.nombre, required: true },
        { name: "apellido", placeholder: "Ej. Borges", label: "Apellido", defaultValue: autor?.apellido, required: true }
    ];

    const describeAutor = (autor: Autor) => ({
        info: [
            info("Nombre", autor.nombre),
            info("Apellido", autor.apellido)
        ],
        forms: [{
            label: "Modificar autor",
            fields: autorFields(autor),
            submit: (field: ReadField) => handleUpdateAutor(autor, field)
        }]
    });

    return useLibraryRecordsViewModel({
        title: "Autores",
        initialFilters: null,
        load: fetchAutores,
        getLabel: getAutorLabel,
        create: {
            label: "Registrar autor",
            fields: autorFields(),
            submit: handleCreateAutor
        },
        describeRecord: describeAutor
    });
}