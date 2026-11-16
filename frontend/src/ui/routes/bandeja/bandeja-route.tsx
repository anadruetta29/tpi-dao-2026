import type { Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { useViewModel } from "./viewmodel";
import { Bandeja } from "@/ui/components/bandeja/bandeja";

type Props = {
    session: Session;
    onOpen: (destino: DestinoBandeja) => void;
    onDevolver: (prestamoId: string) => void;
};

export function BandejaRoute({
    session,
    onOpen,
    onDevolver
}: Props) {
    const {
        recepcionista,
        sedes,
        buscarEnSede,
        togglePrestamoRapido,
        refresh,
        feedback,
        sedeId,
        sedeNombre,
        socioField,
        ejemplaresField,
        buscar,
        buscando,
        mostrador,
        busyId,
        pagarMultaRapido,
        entregarReservaRapido,
        prestamoRapidoAbierto,
        avisosSinLeer,
        marcarAvisoLeido,
        grupos,
        ejecutarAccion,
        prestarRapido,
        devolverRapido
    } = useViewModel(session);

    return (
        <Bandeja
            recepcionista={recepcionista}
            sedes={sedes}
            buscarEnSede={buscarEnSede}
            togglePrestamoRapido={togglePrestamoRapido}
            refresh={refresh}
            feedback={feedback}
            sedeId={sedeId}
            sedeNombre={sedeNombre}
            socioField={socioField}
            ejemplaresField={ejemplaresField}
            buscar={buscar}
            buscando={buscando}
            mostrador={mostrador}
            busyId={busyId}
            pagarMultaRapido={pagarMultaRapido}
            entregarReservaRapido={entregarReservaRapido}
            prestamoRapidoAbierto={prestamoRapidoAbierto}
            avisosSinLeer={avisosSinLeer}
            marcarAvisoLeido={marcarAvisoLeido}
            grupos={grupos}
            ejecutarAccion={ejecutarAccion}
            prestarRapido={prestarRapido}
            devolverRapido={devolverRapido}
            onOpen={onOpen}
            onDevolver={onDevolver}
        />
    );
}
