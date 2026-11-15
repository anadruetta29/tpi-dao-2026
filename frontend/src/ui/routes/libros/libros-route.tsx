import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { useViewModel } from "./viewmodel";
import { LibroEjemplares, type SolicitudInterbibliotecariaInicial } from "./libro-ejemplares";

export function LibrosRoute({ session, onSolicitarInterbibliotecaria }: {
    session: Session;
    onSolicitarInterbibliotecaria?: (inicial: SolicitudInterbibliotecariaInicial) => void;
}) {
    const view = useViewModel(session);
    return (
        <LibraryRecords
            view={view}
            renderDetailContent={(id) => (
                <LibroEjemplares
                    key={id}
                    session={session}
                    libroId={id}
                    onSolicitarInterbibliotecaria={onSolicitarInterbibliotecaria}
                />
            )}
        />
    );
}
