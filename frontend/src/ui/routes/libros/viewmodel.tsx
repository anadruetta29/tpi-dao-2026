import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { type Libro } from "@/domain/entities/libro";
import { createLibroAction, deleteLibroAction, getAllLibrosAction, getLibroByIdAction, updateLibroAction} from "@/ui/actions/libro/libro.actions";
import { type LibraryChoicesProps } from "@/ui/components/library-choices/library-choices";
import { useMultipleSelector } from "@/ui/hooks/use-selector";
import { info, pickData, useLibraryRecordsViewModel} from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField, type ReadFieldValues} from "@/ui/forms/handlers/read-form";
import { bookFields } from "@/core/utils/book-fields";
import { useAutores } from "@/ui/hooks/use-autores";
import type { LibroFilters } from "@/core/types";
import { filterFields } from "@/core/utils/constants";

export default function ViewModel(session: Session) {

    const bookData = (field: ReadField, autoresIds: string[]) => ({
        ...readFields(field, "titulo", "editorial", "edicion"),
        añoPublicacion: Number(field("añoPublicacion")),
        autoresIds
    });

    const [currentYear] = useState(() => new Date().getFullYear());

    const authorSelector = useMultipleSelector(
        "autoresIds",
        "Autores",
        "Buscá por nombre o apellido"
    );

    const {
        authorResult,
        authorOptions,
        authorNames,
        retryAuthors
    } = useAutores(session);

    // ===== Author field =====

    const buildAuthorField = (
        selected: string[] = []
    ): LibraryChoicesProps => {
        const field: LibraryChoicesProps = {
            name: "autoresIds",
            label: "Autores",
            choices: authorOptions.map((option) => ({
                ...option,
                selected: selected.includes(option.value)
            }))
        };

        if (!authorResult) {
            field.status = {
                kind: "loading",
                message: "Cargando autores..."
            };
        } else if (!authorResult.success) {
            field.status = {
                kind: "error",
                message: authorResult.error || "No se pudieron cargar los autores."
            };
            field.retry = retryAuthors;
        } else if (authorOptions.length === 0) {
            field.status = {
                kind: "empty",
                message: "Todavía no hay autores. Podés registrarlos en Autores."
            };
        }

        return field;
    };

    // ===== Fetch data =====

    const fetchLibros = useCallback(async (filters: LibroFilters) => {
        const result = await getAllLibrosAction({
            session,
            ...filters
        });

        return pickData(result, (data) => data.libros);
    }, [session]);

    const fetchLibroDetail = useCallback(async (id: string) => {
        const result = await getLibroByIdAction(id, session);

        return pickData(result, (data) => data.libro);
    }, [session]);

    // ===== Handlers =====

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "titulo", "autor", "editorial");
    };

    const handleCreateLibro = (
        field: ReadField,
        values: ReadFieldValues
    ) => {
        return createLibroAction({
            session,
            ...bookData(field, values("autoresIds"))
        });
    };

    const handleUpdateLibro = (
        libro: Libro,
        field: ReadField,
        values: ReadFieldValues
    ) => {
        const autoresSeleccionados = values("autoresIds");

        const autoresNoDisponibles = libro.autoresIds.filter(
            (id) => !authorNames.has(id)
        );

        return updateLibroAction({
            session,
            id: libro.id,
            ...bookData(field, [
                ...autoresSeleccionados,
                ...autoresNoDisponibles
            ])
        });
    };

    const handleDeleteLibro = (libro: Libro) => {
        return deleteLibroAction(libro.id, session);
    };

    // ===== Book description =====

    const describeLibro = (libro: Libro) => ({
        info: [
            info("Título", libro.titulo),
            info("Año de publicación", libro.añoPublicacion || undefined),
            info("Editorial", libro.editorial),
            info("Edición", libro.edicion),
            info(
                "Autores",
                libro.autoresIds
                    .map((id) => authorNames.get(id) ?? "Autor no disponible")
                    .join(", ")
            )
        ],
        forms: [{
            label: "Modificar libro",
            fields: bookFields(
                {
                    kind: "choices",
                    ...buildAuthorField(libro.autoresIds)
                },
                currentYear,
                libro
            ),
            submitDisabled: !authorResult?.success,
            submit: (field: ReadField, values: ReadFieldValues) =>
                handleUpdateLibro(libro, field, values)
        }],
        commands: [{
            label: "Eliminar libro",
            confirm: `¿Querés eliminar «${libro.titulo}»?`,
            execute: () => handleDeleteLibro(libro)
        }]
    });

    // ===== Display data =====

    const getLibroLabel = (libro: Libro) => libro.titulo;

    const getLibroMeta = (libro: Libro) => {
        const autores = libro.autoresIds
            .map((id) => authorNames.get(id))
            .filter(Boolean)
            .join(", ");

        return [autores, libro.editorial]
            .filter(Boolean)
            .join(" · ");
    };

    // ===== Create fields =====

    const createFields = bookFields(
        {
            ...authorSelector.field(authorResult, "Cargando autores..."),
            required: false,
            retry: authorResult?.success === false
                ? retryAuthors
                : undefined
        },
        currentYear
    );

    return useLibraryRecordsViewModel({
        title: "Libros",
        initialFilters: {
            titulo: "",
            autor: "",
            editorial: ""
        },
        load: fetchLibros,
        loadDetail: fetchLibroDetail,
        filter: {
            label: "Buscar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getLibroLabel,
        getMeta: getLibroMeta,
        create: {
            label: "Registrar libro",
            onOpen: authorSelector.reset,
            fields: createFields,
            submitDisabled: !authorResult?.success,
            submit: handleCreateLibro
        },
        describe: describeLibro
    });
}
