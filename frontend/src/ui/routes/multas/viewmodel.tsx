import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { EstadoMulta, MotivoMulta, type Multa } from "@/domain/entities/multa";
import { anularMultaAction, createMultaAction, getAllMultasAction, getMultaByIdAction, pagarMultaAction } from "@/ui/actions/multa/multa.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, statusInfo, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

export default function ViewModel(session: Session, onOpen?: (target: DestinoBandeja) => void) {
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

    const handlePagarMulta = (multa: Multa) => {
        return pagarMultaAction(multa.id, localDateISO(), session);
    };

    const handleAnularMulta = (multa: Multa) => {
        return anularMultaAction(multa.id, session);
    };

    const socioNames = new Map((catalog.socios?.data ?? []).map(({ value, label }) => [value, label]));

    const describeMulta = (multa: Multa) => ({
        actions: onOpen && multa.prestamoId ? [{ label: "Abrir préstamo", onClick: () => onOpen({ modulo: "Préstamos", id: multa.prestamoId }) }] : [],
        info: [
            info("Socio", socioNames.get(multa.socioId) ?? multa.socioId),
            info("Préstamo", multa.prestamoId),
            info("Motivo", multa.motivoName),
            statusInfo(multa.estadoName),
            info("Monto", `$${multa.monto}`),
            info("Emisión", multa.fechaEmision),
            info("Pago", multa.fechaPago)
        ],
        commands: multa.estadoEntity === EstadoMulta.PENDIENTE ? [{
            label: "Registrar pago",
            tone: "primary" as const,
            confirm: `¿Querés registrar el pago de la multa ${multa.id}?`,
            execute: () => handlePagarMulta(multa)
        }, {
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
        const socioNombre = socioNames.get(multa.socioId) ?? `Socio #${multa.socioId}`;
        return `${socioNombre} · $${multa.monto}`;
    };

    const getMultaMeta = (multa: Multa) => {
        const emision = multa.fechaEmision ? String(multa.fechaEmision).slice(0, 10) : undefined;
        return [multa.motivoName, `Préstamo #${multa.prestamoId}`, emision].filter(Boolean).join(" · ");
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
        newestFirst: true,
        initialFilters: { socioId: "", estado: "" },
        load: fetchMultas,
        loadDetail: fetchMultaDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getMultaLabel,
        getMeta: getMultaMeta,
        getStatuses: (multa) => [multa.estadoName],
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

