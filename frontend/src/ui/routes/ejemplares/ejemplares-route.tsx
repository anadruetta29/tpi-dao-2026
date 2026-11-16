import type { Session } from "@/domain/entities/session";
import type { SolicitudInterbibliotecariaInicial } from "@/core/types";
import ViewModel from "./viewmodel";
import Ejemplares from "@/ui/components/ejemplares/ejemplares";

export function EjemplaresRoute({ session, libroId, onSolicitarInterbibliotecaria }: {
    session: Session;
    libroId: string;
    onSolicitarInterbibliotecaria?: (initial: SolicitudInterbibliotecariaInicial) => void;
}) {
    return <Ejemplares {...ViewModel(session, libroId, onSolicitarInterbibliotecaria)} />;
}
