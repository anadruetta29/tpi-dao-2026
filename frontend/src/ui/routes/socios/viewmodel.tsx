import { useCallback } from "react";
import { type ActionState } from "@/core/types";
import { type Session } from "@/domain/entities/session";
import { EstadoSocio, type Socio } from "@/domain/entities/socio";
import {
    createSocioAction,
    deleteSocioAction,
    getAllSociosAction,
    getSocioByIdAction,
    getSocioMultasAction,
    getSocioPrestamosAction,
    updateSocioAction
} from "@/ui/actions/socio/socio.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { digitsInput, lettersInput } from "@/ui/forms/handlers/input-format";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { allOptions, info, pickData, type DetailSection, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";

const nameFormat = {
    pattern: "(?=.{2,100}$)\\p{L}+(?: +\\p{L}+)*",
    minLength: 2,
    maxLength: 100,
    title: "Ingresá entre 2 y 100 caracteres, solo letras y espacios.",
    onInput: lettersInput
};

function socioFields(socio?: Socio): Field[] {
    return [
        { name: "nombre", placeholder: "Ej. Ana", label: "Nombre", defaultValue: socio?.nombre, required: true, ...nameFormat },
        { name: "apellido", placeholder: "Ej. Pérez", label: "Apellido", defaultValue: socio?.apellido, required: true, ...nameFormat },
        {
            name: "documento", placeholder: "Ej. 30123456", label: "DNI", defaultValue: socio?.documento, required: true,
            inputMode: "numeric", pattern: "(?=[0-9]*[1-9])[0-9]{7,8}",
            title: "Ingresá un DNI positivo de 7 u 8 dígitos.", onInput: digitsInput(8)
        },
        { name: "email", placeholder: "socio@ejemplo.com", label: "Correo electrónico", type: "email", defaultValue: socio?.email, required: true },
        {
            name: "telefono", placeholder: "Ej. 1155551234", label: "Teléfono", type: "tel", defaultValue: socio?.telefono,
            required: true, inputMode: "numeric", pattern: "[0-9]{1,10}",
            title: "Ingresá hasta 10 dígitos.", onInput: digitsInput(10)
        }
    ];
}

const socioData = (field: ReadField) => readFields(field, "nombre", "apellido", "documento", "email", "telefono");

export function useViewModel(session: Session) {
    {/* ===== Fetch data ===== */ }

    const fetchSocios = useCallback((filters: { q: string; documento: string; estado: string }) => {
        return getAllSociosAction({
            session,
            ...filters,
            estado: filters.estado ? EstadoSocio.fromString(filters.estado) : undefined
        });
    }, [session]);

    const fetchSocioDetail = useCallback((id: string) => {
        return getSocioByIdAction({ id, session });
    }, [session]);

    const fetchSocioPrestamos = async (socioId: string): Promise<ActionState<DetailSection[]>> => {
        const result = await getSocioPrestamosAction({ id: socioId, session });
        return pickData(result, (prestamos) => [{
            title: "Historial de préstamos",
            emptyMessage: "El socio no tiene préstamos.",
            entries: prestamos.map((item) => ({
                id: item.id,
                label: `Préstamo ${item.id} · ${item.estadoName} · Vence: ${info("", item.fechaVencimiento).value}`
            }))
        }]);
    };

    const fetchSocioMultas = async (socioId: string): Promise<ActionState<DetailSection[]>> => {
        const result = await getSocioMultasAction({ id: socioId, session });
        return pickData(result, (multas) => [{
            title: "Historial de multas",
            emptyMessage: "El socio no tiene multas.",
            entries: multas.map((item) => ({
                id: item.id,
                label: `Multa ${item.id} · ${item.motivoName} · ${item.estadoName} · $${item.monto}`
            }))
        }]);
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "q", "documento", "estado");
    };

    const handleCreateSocio = (field: ReadField) => {
        return createSocioAction({
            session,
            ...socioData(field)
        });
    };

    const handleUpdateSocio = (socio: Socio, field: ReadField) => {
        return updateSocioAction({
            id: socio.id,
            session,
            ...socioData(field)
        });
    };

    const handleToggleBaja = (socio: Socio) => {
        if (socio.estadoEntity === EstadoSocio.HABILITADO) {
            return deleteSocioAction({ id: socio.id, session });
        }
        return updateSocioAction({ id: socio.id, session, habilitar: true });
    };

    const describeSocio = (socio: Socio) => ({
        info: [
            info("Nombre", `${socio.nombre} ${socio.apellido}`),
            info("Documento", socio.documento),
            info("Correo electrónico", socio.email),
            info("Teléfono", socio.telefono),
            info("Estado", socio.estadoName)
        ],
        forms: [{
            label: "Modificar socio",
            fields: socioFields(socio),
            submit: (field: ReadField) => handleUpdateSocio(socio, field)
        }],
        commands: socio.estadoEntity === EstadoSocio.HABILITADO ? [{
            label: "Dar de baja",
            confirm: `¿Querés inhabilitar a ${socio.nombre} ${socio.apellido}?`,
            execute: () => handleToggleBaja(socio)
        }] : [{
            label: "Volver a habilitar",
            confirm: `¿Querés volver a habilitar a ${socio.nombre} ${socio.apellido}?`,
            tone: "primary" as const,
            execute: () => handleToggleBaja(socio)
        }],
        queries: [
            {
                label: "Historial de préstamos",
                load: () => fetchSocioPrestamos(socio.id)
            },
            {
                label: "Historial de multas",
                load: () => fetchSocioMultas(socio.id)
            }
        ]
    });

    {/* ===== variables ===== */ }

    const getSocioLabel = (socio: Socio) => `${socio.nombre} ${socio.apellido}`;

    const getSocioMeta = (socio: Socio) => {
        return [socio.documento ? `DNI ${socio.documento}` : "", socio.estadoName].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        { name: "q", placeholder: "Pepe Perez", label: "Nombre o apellido" },
        { name: "documento", placeholder: "Ej. 30123456", label: "Documento" },
        { name: "estado", label: "Estado", options: allOptions(EstadoSocio.toOptions()) }
    ];

    return useLibraryRecordsViewModel({
        title: "Socios",
        initialFilters: { q: "", documento: "", estado: "" },
        load: fetchSocios,
        loadDetail: fetchSocioDetail,
        filter: {
            label: "Buscar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getSocioLabel,
        getMeta: getSocioMeta,
        create: {
            label: "Registrar socio",
            fields: socioFields(),
            submit: handleCreateSocio
        },
        describe: describeSocio
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
