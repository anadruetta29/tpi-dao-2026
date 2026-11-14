import { useCallback, useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { type Session } from "@/domain/entities/session";
import { type Libro } from "@/domain/entities/libro";
import { createLibroAction, deleteLibroAction, getAllLibrosAction, getLibroByIdAction, getLibroDisponibilidadAction, updateLibroAction } from "@/ui/actions/libro/libro.actions";
import { getAllAutoresAction } from "@/ui/actions/autor/autor.actions";
import { type LibraryChoicesProps } from "@/ui/components/library-choices/library-choices";
import { info, pickData, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";

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
    type Options = { value: string; label: string }[];
    const [authors, setAuthors] = useState<{ session: Session; result: ActionState<Options> } | null>(null);
    const [revision, setRevision] = useState(0);

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
        return () => { active = false; };
    }, [session, revision]);

    const authorResult = authors?.session === session ? authors.result : null;
    const options = authorResult?.data ?? [];
    const authorNames = new Map(options.map(({ value, label }) => [value, label]));

    function authorField(selected: string[] = []): LibraryChoicesProps {
        const field: LibraryChoicesProps = {
            name: "autoresIds",
            label: "Autores",
            choices: options.map((option) => ({ ...option, selected: selected.includes(option.value) }))
        };
        if (!authorResult) {
            field.status = { kind: "loading", message: "Cargando autores..." };
        } else if (!authorResult.success) {
            field.status = { kind: "error", message: authorResult.error || "No se pudieron cargar los autores." };
            field.retry = () => {
                setAuthors(null);
                setRevision((current) => current + 1);
            };
        } else if (options.length === 0) {
            field.status = { kind: "empty", message: "Todavía no hay autores. Podés registrarlos en Autores." };
        }
        return field;
    }

    const load = useCallback(async (filters: { titulo: string; autor: string; editorial: string }) =>
        pickData(await getAllLibrosAction({ session, ...filters }), (data) => data.libros), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getLibroByIdAction(id, session), (data) => data.libro), [session]);

    return useLibraryRecordsViewModel({
        title: "Libros", initialFilters: { titulo: "", autor: "", editorial: "" },
        load, loadDetail,
        filter: { label: "Buscar", fields: [
            { name: "titulo", placeholder: "Ej. El Aleph", label: "Título" }, { name: "autor", placeholder: "Buscá por autor", label: "Autor" }, { name: "editorial", placeholder: "Ej. Losada", label: "Editorial" }
        ], submit: (field) => readFields(field, "titulo", "autor", "editorial") },
        getLabel: (libro) => `${libro.titulo} · ${libro.editorial}`,
        create: {
            label: "Registrar libro",
            fields: bookFields(authorField(), currentYear),
            submitDisabled: !authorResult?.success,
            submit: (field, values) => createLibroAction({ session, ...bookData(field, values("autoresIds")) })
        },
        describe: (libro) => ({
            info: [info("Título", libro.titulo), info("Año de publicación", libro.añoPublicacion || undefined),
                info("Editorial", libro.editorial), info("Edición", libro.edicion),
                info("Autores", libro.autoresIds.map((id) => authorNames.get(id) ?? "Autor no disponible").join(", "))],
            forms: [{
                label: "Modificar libro",
                fields: bookFields(authorField(libro.autoresIds), currentYear, libro),
                submitDisabled: !authorResult?.success,
                submit: (field, values) => updateLibroAction({
                    session,
                    id: libro.id,
                    ...bookData(field, [...values("autoresIds"), ...libro.autoresIds.filter((id) => !authorNames.has(id))])
                })
            }],
            commands: [{ label: "Eliminar libro", confirm: `¿Querés eliminar «${libro.titulo}»?`, execute: () => deleteLibroAction(libro.id, session) }],
            queries: [{
                label: "Consultar disponibilidad",
                load: async () => pickData(await getLibroDisponibilidadAction(libro.id, session), ({ sedes }) => sedes.length
                    ? sedes.map(({ sedeNombre, sedeId, ejemplares }) => ({
                        title: sedeNombre ? `${sedeNombre} (sede ${sedeId})` : `Sede ${sedeId || "sin asignar"}`,
                        emptyMessage: "No hay ejemplares en esta sede.",
                        entries: ejemplares.map((item) => ({ id: item.id, label: `${item.codigo} · ${item.estadoName}` }))
                    }))
                    : [{ title: "Disponibilidad", entries: [], emptyMessage: "No hay ejemplares registrados para este libro." }])
            }]
        })
    });
}
