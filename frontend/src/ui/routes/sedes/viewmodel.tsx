import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
import { EstadoSede, type Sede } from "@/domain/entities/sede";
import { ErrorMessages } from "@/domain/messages";
import { createSedeAction, deleteSedeAction, getAllSedesAction, getSedeByIdAction, updateSedeAction } from "@/ui/actions/sede/sede.actions";
import { useAuth } from "@/ui/hooks/use-auth";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { allOptions, info, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { sedeData, sedeFields } from "@/core/utils/sedes";

export default function ViewModel(session: Session) {
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

