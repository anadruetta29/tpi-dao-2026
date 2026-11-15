import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { type SolicitudInterbibliotecariaInicial } from "@/ui/routes/libros/libro-ejemplares";
import { useViewModel } from "./viewmodel";

export function SolicitudesPrestamoRoute({ session, initialRecordId, solicitudInicial }: {
    session: Session;
    initialRecordId?: string;
    solicitudInicial?: SolicitudInterbibliotecariaInicial;
}) {
    const view = useViewModel(session, initialRecordId, solicitudInicial);
    return <LibraryRecords view={view} />;
}
