import { useCallback, useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { type Session } from "@/domain/entities/session";
import { type Libro } from "@/domain/entities/libro";
import { createLibroAction, deleteLibroAction, getAllLibrosAction, getLibroByIdAction, getLibroDisponibilidadAction, updateLibroAction } from "@/ui/actions/libro/libro.actions";
import { getAllAutoresAction } from "@/ui/actions/autor/autor.actions";
import { type LibraryChoicesProps } from "@/ui/components/library-choices/library-choices";
import { info, pickData, type DetailSection, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";

type Options = { value: string; label: string }[];

function bookFields(authors: LibraryChoicesProps, currentYear: number, libro?: Libro): Field[] {
    return [
        { name: "titulo", placeholder: "Ej. El Aleph", label: "Título", required: true, defaultValue: libro?.titulo },
        {
            name: "añoPublicacion",
            label: "Año de publicación",
            placeholder: "Ej. 1949",
            type: "number",
            min: 1,
            max: currentYear,
            step: 1,
            required: true,
            defaultValue: libro?.añoPublicacion ? String(libro.añoPublicacion) : undefined
        },
        { name: "editorial", placeholder: "Ej. Losada", label: "Editorial", required: true, defaultValue: libro?.editorial },
        { name: "edicion", placeholder: "Ej. Primera edición", label: "Edición", required: true, defaultValue: libro?.edicion },
        { kind: "choices", ...authors }
    ];
}

const bookData = (field: ReadField, autoresIds: string[]) => ({
    ...readFields(field, "titulo", "editorial", "edicion"),
    añoPublicacion: Number(field("añoPublicacion")),
    autoresIds
});

export function useViewModel(session: Session) {
    const [currentYear] = useState(() => new Date().getFullYear());
    const [authors, setAuthors] = useState<{ session: Session; result: ActionState<Options> } | null>(null);
    const [revision, setRevision] = useState(0);

    {/* ===== Main useEffects ===== */ }

    useEffect(() => {
        let active = true;
        void getAllAutoresAction(session).then((result) => {
            if (!active) return;
            setAuthors({
                session,
                result: pickData(result, ({ autores }) => autores.map((autor) => ({
                    value: autor.id,
                    label: `${autor.nombre} ${autor.apellido}`.trim()
                })))
            });
        });
        return () => {
            active = false;
        };
    }, [session, revision]);

    {/* ===== Fetch data ===== */ }

    const fetchLibros = useCallback(async (filters: { titulo: string; autor: string; editorial: string }) => {
        const result = await getAllLibrosAction({ session, ...filters });
        return pickData(result, (data) => data.libros);
    }, [session]);

    const fetchLibroDetail = useCallback(async (id: string) => {
        const result = await getLibroByIdAction(id, session);
        return pickData(result, (data) => data.libro);
    }, [session]);

    const fetchDisponibilidad = async (libroId: string) => {
        const result = await getLibroDisponibilidadAction(libroId, session);
        return pickData(result, ({ sedes }): DetailSection[] => sedes.length
            ? sedes.map(({ sedeNombre, sedeId, ejemplares }) => ({
                title: sedeNombre ? `${sedeNombre} (sede ${sedeId})` : `Sede ${sedeId || "sin asignar"}`,
                emptyMessage: "No hay ejemplares en esta sede.",
                entries: ejemplares.map((item) => ({ id: item.id, label: `${item.codigo} · ${item.estadoName}` }))
            }))
            : [{ title: "Disponibilidad", entries: [], emptyMessage: "No hay ejemplares registrados para este libro." }]);
    };

    {/* ===== onActions functions ===== */ }

    const onRetryAuthors = () => {
        setAuthors(null);
        setRevision((current) => current + 1);
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "titulo", "autor", "editorial");
    };

    const handleCreateLibro = (field: ReadField, values: ReadFieldValues) => {
        return createLibroAction({
            session,
            ...bookData(field, values("autoresIds"))
        });
    };

    const handleUpdateLibro = (libro: Libro, field: ReadField, values: ReadFieldValues) => {
        return updateLibroAction({
            session,
            id: libro.id,
            ...bookData(field, [...values("autoresIds"), ...libro.autoresIds.filter((id) => !authorNames.has(id))])
        });
    };

    const handleDeleteLibro = (libro: Libro) => {
        return deleteLibroAction(libro.id, session);
    };

    const describeLibro = (libro: Libro) => ({
        info: [
            info("Título", libro.titulo),
            info("Año de publicación", libro.añoPublicacion || undefined),
            info("Editorial", libro.editorial),
            info("Edición", libro.edicion),
            info("Autores", libro.autoresIds.map((id) => authorNames.get(id) ?? "Autor no disponible").join(", "))
        ],
        forms: [{
            label: "Modificar libro",
            fields: bookFields(buildAuthorField(libro.autoresIds), currentYear, libro),
            submitDisabled: !authorResult?.success,
            submit: (field: ReadField, values: ReadFieldValues) => handleUpdateLibro(libro, field, values)
        }],
        commands: [{
            label: "Eliminar libro",
            confirm: `¿Querés eliminar «${libro.titulo}»?`,
            execute: () => handleDeleteLibro(libro)
        }],
        queries: [{
            label: "Consultar disponibilidad",
            load: () => fetchDisponibilidad(libro.id)
        }]
    });

    {/* ===== variables ===== */ }

    const authorResult = authors?.session === session ? authors.result : null;
    const authorOptions = authorResult?.data ?? [];
    const authorNames = new Map(authorOptions.map(({ value, label }) => [value, label]));

    const buildAuthorField = (selected: string[] = []): LibraryChoicesProps => {
        const field: LibraryChoicesProps = {
            name: "autoresIds",
            label: "Autores",
            choices: authorOptions.map((option) => ({ ...option, selected: selected.includes(option.value) }))
        };
        if (!authorResult) {
            field.status = { kind: "loading", message: "Cargando autores..." };
        } else if (!authorResult.success) {
            field.status = { kind: "error", message: authorResult.error || "No se pudieron cargar los autores." };
            field.retry = onRetryAuthors;
        } else if (authorOptions.length === 0) {
            field.status = { kind: "empty", message: "Todavía no hay autores. Podés registrarlos en Autores." };
        }
        return field;
    };

    const getLibroLabel = (libro: Libro) => `${libro.titulo} · ${libro.editorial}`;

    const filterFields: Field[] = [
        { name: "titulo", placeholder: "Ej. El Aleph", label: "Título" },
        { name: "autor", placeholder: "Buscá por autor", label: "Autor" },
        { name: "editorial", placeholder: "Ej. Losada", label: "Editorial" }
    ];

    return useLibraryRecordsViewModel({
        title: "Libros",
        initialFilters: { titulo: "", autor: "", editorial: "" },
        load: fetchLibros,
        loadDetail: fetchLibroDetail,
        filter: {
            label: "Buscar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getLibroLabel,
        create: {
            label: "Registrar libro",
            fields: bookFields(buildAuthorField(), currentYear),
            submitDisabled: !authorResult?.success,
            submit: handleCreateLibro
        },
        describe: describeLibro
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
