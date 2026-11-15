import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoMulta, MotivoMulta, type Multa } from "@/domain/entities/multa";
import { anularMultaAction, createMultaAction, getAllMultasAction, getMultaByIdAction, pagarMultaAction } from "@/ui/actions/multa/multa.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "socios", "prestamos");
    const filterSocio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const prestamo = useSelector("prestamoId", "Préstamo", "Buscá por libro o código de ejemplar");

    {/* ===== Fetch data ===== */ }

    const fetchMultas = useCallback(async ({ socioId, estado }: { socioId: string; estado: string }) => {
        const result = await getAllMultasAction({ session, socio_id: socioId, estado });
        return pickData(result, (data) => data.multas);
    }, [session]);

    const fetchMultaDetail = useCallback(async (id: string) => {
        const result = await getMultaByIdAction(id, session);
        return pickData(result, (data) => data.multa);
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        socio.reset();
        prestamo.reset();
        catalog.refresh();
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "socioId", "estado");
    };

    const handleCreateMulta = (field: ReadField) => {
        return createMultaAction({
            session,
            socio_id: field("socioId"),
            prestamo_id: field("prestamoId"),
            motivo: MotivoMulta.fromString(field("motivo")),
            monto: Number(field("monto"))
        });
    };

    const handlePagarMulta = (multa: Multa, field: ReadField) => {
        return pagarMultaAction(multa.id, field("fechaPago"), session);
    };

    const handleAnularMulta = (multa: Multa) => {
        return anularMultaAction(multa.id, session);
    };

    const socioNames = new Map((catalog.socios?.data ?? []).map(({ value, label }) => [value, label]));

    const describeMulta = (multa: Multa) => ({
        info: [
            info("Socio", socioNames.get(multa.socioId) ?? multa.socioId),
            info("Préstamo", multa.prestamoId),
            info("Motivo", multa.motivoName),
            info("Estado", multa.estadoName),
            info("Monto", `$${multa.monto}`),
            info("Emisión", multa.fechaEmision),
            info("Pago", multa.fechaPago)
        ],
        forms: multa.estadoEntity === EstadoMulta.PENDIENTE ? [{
            label: "Registrar pago",
            fields: [{ name: "fechaPago", placeholder: "Seleccioná la fecha de pago", label: "Fecha de pago", type: "date", required: true }],
            submit: (field: ReadField) => handlePagarMulta(multa, field)
        }] : [],
        commands: multa.estadoEntity === EstadoMulta.PENDIENTE ? [{
            label: "Anular multa",
            confirm: `¿Querés anular la multa ${multa.id}?`,
            execute: () => handleAnularMulta(multa)
        }] : []
    });

    {/* ===== variables ===== */ }

    const availablePrestamos = catalog?.prestamos ? pickData(catalog.prestamos, (items) =>
        items.filter(({ socioId }) => socioId === socio.selected)
    ) : null;

    const getMultaLabel = (multa: Multa) => {
        return `${multa.motivoName} · ${multa.estadoName} · $${multa.monto}`;
    };

    const filterFields: Field[] = [
        filterSocio.field(catalog?.socios ?? null),
        { name: "estado", label: "Estado", options: allOptions(EstadoMulta.toOptions()) }
    ];

    const createFields: Field[] = [
        socio.field(catalog?.socios ?? null, undefined, prestamo.reset),
        prestamo.field(socio.selected ? availablePrestamos ?? null : null, socio.selected ? undefined : "Seleccioná primero un socio."),
        { name: "motivo", label: "Motivo", options: MotivoMulta.toOptions() },
        { name: "monto", placeholder: "Ej. 1500", label: "Monto", type: "number", min: 0.01, step: 0.01, required: true }
    ];

    return useLibraryRecordsViewModel({
        title: "Multas",
        initialFilters: { socioId: "", estado: "" },
        load: fetchMultas,
        loadDetail: fetchMultaDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getMultaLabel,
        create: {
            label: "Registrar multa",
            onOpen: onOpenCreate,
            submitDisabled: !socio.selected || !prestamo.selected,
            fields: createFields,
            submit: handleCreateMulta
        },
        describe: describeMulta
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
