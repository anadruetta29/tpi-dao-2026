import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoSocio, type Socio } from "@/domain/entities/socio";
import { createSocioAction, deleteSocioAction, getAllSociosAction, getSocioByIdAction, getSocioMultasAction, getSocioPrestamosAction, updateSocioAction } from "@/ui/actions/socio/socio.actions";
import { allOptions, info, pickData, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";

function socioFields(socio?: Socio): Field[] {
    return [
        { name: "nombre", placeholder: "Ej. Ana", label: "Nombre", defaultValue: socio?.nombre, required: true },
        { name: "apellido", placeholder: "Ej. Pérez", label: "Apellido", defaultValue: socio?.apellido, required: true },
        { name: "documento", placeholder: "Ej. 30123456", label: "Documento", defaultValue: socio?.documento, required: true },
        { name: "email", placeholder: "socio@ejemplo.com", label: "Correo electrónico", type: "email", defaultValue: socio?.email, required: true },
        { name: "telefono", placeholder: "Ej. 11 5555 1234", label: "Teléfono", type: "tel", defaultValue: socio?.telefono, required: true }
    ];
}

const socioData = (field: ReadField) => readFields(field, "nombre", "apellido", "documento", "email", "telefono");

export function useViewModel(session: Session) {
    const load = useCallback((filters: { q: string; documento: string; estado: string }) => getAllSociosAction({
        session, ...filters, estado: filters.estado ? EstadoSocio.fromString(filters.estado) : undefined
    }), [session]);
    const loadDetail = useCallback((id: string) => getSocioByIdAction({ id, session }), [session]);

    return useLibraryRecordsViewModel({
        title: "Socios", initialFilters: { q: "", documento: "", estado: "" },
        load, loadDetail,
        filter: {
            label: "Buscar",
            fields: [
                { name: "q", placeholder: "Pepe Perez", label: "Nombre o apellido" },
                { name: "documento", placeholder: "Ej. 30123456", label: "Documento" },
                { name: "estado", label: "Estado", options: allOptions(EstadoSocio.toOptions()) }
            ],
            submit: (field) => readFields(field, "q", "documento", "estado")
        },
        getLabel: (socio) => `${socio.nombre} ${socio.apellido} · ${socio.documento} · ${socio.estadoName}`,
        create: { label: "Registrar socio", fields: socioFields(), submit: (field) => createSocioAction({ session, ...socioData(field) }) },
        describe: (socio) => ({
            info: [info("Nombre", `${socio.nombre} ${socio.apellido}`), info("Documento", socio.documento),
                info("Correo electrónico", socio.email), info("Teléfono", socio.telefono), info("Estado", socio.estadoName)],
            forms: [{
                label: "Modificar socio", fields: socioFields(socio),
                submit: (field) => updateSocioAction({ id: socio.id, session, ...socioData(field) })
            }],
            commands: socio.estadoEntity === EstadoSocio.HABILITADO ? [{
                label: "Dar de baja", confirm: `¿Querés inhabilitar a ${socio.nombre} ${socio.apellido}?`,
                execute: () => deleteSocioAction({ id: socio.id, session })
            }] : [],
            queries: [{
                label: "Historial de préstamos",
                load: async () => pickData(await getSocioPrestamosAction({ id: socio.id, session }), (prestamos) => [{
                    title: "Historial de préstamos", emptyMessage: "El socio no tiene préstamos.",
                    entries: prestamos.map((item) => ({ id: item.id, label: `Préstamo ${item.id} · ${item.estadoName} · Vence: ${info("", item.fechaVencimiento).value}` }))
                }])
            }, {
                label: "Historial de multas",
                load: async () => pickData(await getSocioMultasAction({ id: socio.id, session }), (multas) => [{
                    title: "Historial de multas", emptyMessage: "El socio no tiene multas.",
                    entries: multas.map((item) => ({ id: item.id, label: `Multa ${item.id} · ${item.motivoName} · ${item.estadoName} · $${item.monto}` }))
                }])
            }]
        })
    });
}
