import { Rol } from "@/domain/entities/rol";
import type { Session } from "@/domain/entities/session";
import type { SolicitudInterbibliotecariaInicial } from "@/core/types";
import ViewModel from "./viewmodel";
import Ejemplares from "@/ui/components/ejemplares/ejemplares";

type Props = {
    session: Session;
    libroId: string;
    onSolicitarInterbibliotecaria?: (
        inicial: SolicitudInterbibliotecariaInicial
    ) => void;
};

export function EjemplaresRoute({
    session,
    libroId,
    onSolicitarInterbibliotecaria
}: Props) {
    const {
        records,
        loadingSedes,
        sedesError,
        noActiveSedes,
        retrySedes,
        disponibilidad,
        refreshDisponibilidad
    } = ViewModel(session, libroId);

    const sedePropia = session.user?.sedeId ?? "";

    const recepcionista =
        session.user?.roleEntity === Rol.RECEPCIONISTA;

    return (
        <Ejemplares
            records={records}
            loadingSedes={loadingSedes}
            sedesError={sedesError}
            noActiveSedes={noActiveSedes}
            retrySedes={retrySedes}
            disponibilidad={disponibilidad}
            refreshDisponibilidad={refreshDisponibilidad}
            sedePropia={sedePropia}
            recepcionista={recepcionista}
            onSolicitarInterbibliotecaria={onSolicitarInterbibliotecaria}
        />
    );
}
