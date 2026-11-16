import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import type { SolicitudInterbibliotecariaInicial } from "@/core/types";
import { EjemplaresRoute } from "../ejemplares/ejemplares-route";
import ViewModel from "./viewmodel";

export function LibrosRoute({
    session,
    onSolicitarInterbibliotecaria
}: {
    session: Session;
    onSolicitarInterbibliotecaria?: (inicial: SolicitudInterbibliotecariaInicial) => void;
}) {
    const view = ViewModel(session);

    return (
        <LibraryRecords
            view={view}
            renderDetailContent={(id) => (
                <EjemplaresRoute
                    key={id}
                    session={session}
                    libroId={id}
                    onSolicitarInterbibliotecaria={onSolicitarInterbibliotecaria}
                />
            )}
        />
    );
}