import { type Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";

export function DevolucionesRoute({ session, prestamoInicialId, onOpen }: { session: Session; prestamoInicialId?: string; onOpen?: (target: DestinoBandeja) => void }) {
    const view = ViewModel(session, prestamoInicialId, onOpen);
    return <LibraryRecords view={view} />;
}
