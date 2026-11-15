import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
import { EstadoSede, type Sede } from "@/domain/entities/sede";
import { ErrorMessages } from "@/domain/messages";
import { createSedeAction, deleteSedeAction, getAllSedesAction, getSedeByIdAction, updateSedeAction } from "@/ui/actions/sede/sede.actions";
import { useAuth } from "@/ui/hooks/use-auth";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { allOptions, info, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { onTimeInput } from "./horario-input";

const horaPattern = "(?:[01][0-9]|2[0-3]):[0-5][0-9]";
const rangoHorario = new RegExp(`^(${horaPattern})\\s*-\\s*(${horaPattern})$`);

const timeField = {
    pattern: horaPattern,
    required: true,
    inputMode: "numeric",
    onInput: onTimeInput
} as const;

function sedeFields(sede?: Sede): Field[] {
    const horario = rangoHorario.exec(sede?.horarioAtencion.trim() ?? "");
    return [
        { name: "nombre", placeholder: "Ej. Biblioteca Central", label: "Nombre", defaultValue: sede?.nombre, required: true },
        { name: "telefono", placeholder: "Ej. 11 5555 1234", label: "Teléfono", type: "tel", defaultValue: sede?.telefono, required: true },
        { name: "email", placeholder: "sede@ejemplo.com", label: "Correo electrónico", type: "email", defaultValue: sede?.email, required: true },
        { ...timeField, name: "apertura", placeholder: "Ingresá la hora de apertura", label: "Apertura", defaultValue: horario?.[1] },
        { ...timeField, name: "cierre", placeholder: "Ingresá la hora de cierre", label: "Cierre", defaultValue: horario?.[2] }
    ];
}

function sedeData(field: ReadField) {
    const apertura = field("apertura");
    const cierre = field("cierre");
    const horarioAtencion = `${apertura} - ${cierre}`;
    if (!rangoHorario.test(horarioAtencion) || apertura >= cierre) return null;

    return { ...readFields(field, "nombre", "telefono", "email"), horarioAtencion };
}

export function useViewModel(session: Session) {
    const { user } = useAuth();

    {/* ===== Fetch data ===== */ }

    const fetchSedes = useCallback((estado: string) => {
        return getAllSedesAction({
            session,
            estado: estado ? EstadoSede.fromString(estado) : undefined
        });
    }, [session]);

    const fetchSedeDetail = useCallback((id: string) => {
        return getSedeByIdAction({ id, session });
    }, [session]);

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return field("estado");
    };

    const handleCreateSede = async (field: ReadField) => {
        const data = sedeData(field);
        return data
            ? createSedeAction({ session, ...data })
            : { success: false, error: ErrorMessages.SEDE_HORARIO_INVALIDO };
    };

    const handleUpdateSede = async (sede: Sede, field: ReadField) => {
        const data = sedeData(field);
        return data
            ? updateSedeAction({ session, id: sede.id, ...data })
            : { success: false, error: ErrorMessages.SEDE_HORARIO_INVALIDO };
    };

    const handleDeleteSede = (sede: Sede) => {
        return deleteSedeAction({ session, id: sede.id });
    };

    const describeSede = (sede: Sede) => ({
        info: [
            info("Nombre", sede.nombre),
            info("Teléfono", sede.telefono),
            info("Correo electrónico", sede.email),
            info("Horario de atención", sede.horarioAtencion),
            info("Estado", sede.estadoName)
        ],
        forms: canWrite ? [{
            label: "Modificar sede",
            fields: sedeFields(sede),
            submit: (field: ReadField) => handleUpdateSede(sede, field)
        }] : [],
        commands: canWrite && sede.estadoEntity === EstadoSede.ACTIVA ? [{
            label: "Dar de baja",
            confirm: `¿Querés dar de baja la sede ${sede.nombre}?`,
            execute: () => handleDeleteSede(sede)
        }] : []
    });

    {/* ===== variables ===== */ }

    const canWrite = user?.roleEntity === Rol.ADMIN;

    const getSedeLabel = (sede: Sede) => sede.nombre;

    const getSedeMeta = (sede: Sede) => [sede.horarioAtencion, sede.estadoName].filter(Boolean).join(" · ");

    const filterFields: Field[] = [
        { name: "estado", label: "Estado", options: allOptions(EstadoSede.toOptions()) }
    ];

    return useLibraryRecordsViewModel({
        title: "Sedes",
        initialFilters: "",
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        load: fetchSedes,
        loadDetail: fetchSedeDetail,
        getLabel: getSedeLabel,
        getMeta: getSedeMeta,
        create: canWrite ? {
            label: "Registrar sede",
            fields: sedeFields(),
            submit: handleCreateSede
        } : undefined,
        describe: describeSede
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
