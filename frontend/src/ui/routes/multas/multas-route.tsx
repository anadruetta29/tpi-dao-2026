import { type Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";

export function MultasRoute({ session, onOpen }: { session: Session; onOpen?: (target: DestinoBandeja) => void }) {
    const view = ViewModel(session, onOpen);
    return <LibraryRecords view={view} />;
}
