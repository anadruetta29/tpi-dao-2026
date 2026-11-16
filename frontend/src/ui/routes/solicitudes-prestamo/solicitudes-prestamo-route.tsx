import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import type { SolicitudInterbibliotecariaInicial } from "@/core/types";
import ViewModel from "./viewmodel";

export function SolicitudesPrestamoRoute({ session, initialRecordId, solicitudInicial }: {
    session: Session;
    initialRecordId?: string;
    solicitudInicial?: SolicitudInterbibliotecariaInicial;
}) {
    const view = ViewModel(session, initialRecordId, solicitudInicial);
    return <LibraryRecords view={view} />;
}
