import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { type DestinoBandeja } from "@/ui/routes/bandeja/viewmodel";
import ViewModel from "./viewmodel";

export function AvisosRoute({ session, onOpen }: { session: Session; onOpen?: (destino: DestinoBandeja) => void }) {
    const view = ViewModel(session, onOpen);
    return <LibraryRecords view={view} />;
}
