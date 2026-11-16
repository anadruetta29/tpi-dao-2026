import { type Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";

export function RemitosRoute({ session, initialRecordId, onOpen }: { session: Session; initialRecordId?: string; onOpen?: (target: DestinoBandeja) => void }) {
    const view = ViewModel(session, initialRecordId, onOpen);
    return <LibraryRecords view={view} />;
}
