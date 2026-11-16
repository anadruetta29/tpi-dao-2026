import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";

export function DevolucionesRoute({ session, prestamoInicialId }: { session: Session; prestamoInicialId?: string }) {
    const view = ViewModel(session, prestamoInicialId);
    return <LibraryRecords view={view} />;
}
