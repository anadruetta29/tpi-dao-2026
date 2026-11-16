import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { type TarifaMulta } from "@/domain/entities/tarifa-multa";
import { getAllTarifasMultaAction, updateTarifaMultaAction } from "@/ui/actions/configuracion/configuracion.actions";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";

export default function ViewModel(session: Session) {
    {/* ===== Fetch data ===== */ }

    const fetchTarifas = useCallback(async () => {
        const result = await getAllTarifasMultaAction(session);
        return pickData(result, (data) => data.tarifas);
    }, [session]);

    {/* ===== handlers functions ===== */ }

    const handleUpdateTarifa = (tarifa: TarifaMulta, field: ReadField) => {
        return updateTarifaMultaAction({
            session,
            motivo: tarifa.motivo,
            monto: Number(field("monto"))
        });
    };

    const describeTarifa = (tarifa: TarifaMulta) => ({
        info: [
            info("Motivo", tarifa.motivoName),
            info("Aplicación", tarifa.aplicacionLabel),
            info("Monto actual", `$${tarifa.monto}`)
        ],
        forms: [{
            label: "Modificar monto",
            fields: [
                {
                    name: "monto",
                    label: "Nuevo monto ($)",
                    placeholder: "Ej. 1500",
                    type: "number",
                    min: 0.01,
                    step: 0.01,
                    defaultValue: String(tarifa.monto),
                    required: true
                }
            ],
            submit: (field: ReadField) => handleUpdateTarifa(tarifa, field)
        }]
    });

    {/* ===== variables ===== */ }

    const getTarifaLabel = (tarifa: TarifaMulta) => tarifa.motivoName;

    const getTarifaMeta = (tarifa: TarifaMulta) => `${tarifa.aplicacionLabel} · $${tarifa.monto}`;

    return useLibraryRecordsViewModel({
        title: "Configuración",
        initialFilters: null,
        load: fetchTarifas,
        getDisplayId: (_, index) => `#${index + 1}`,
        getLabel: getTarifaLabel,
        getMeta: getTarifaMeta,
        describeRecord: describeTarifa
    });
}
