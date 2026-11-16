import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";
import type { DestinoBandeja } from "@/core/types";

export function AvisosRoute({ session, onOpen }: { session: Session; onOpen?: (destino: DestinoBandeja) => void }) {
    const view = ViewModel(session, onOpen);
    return <LibraryRecords view={view} />;
}
