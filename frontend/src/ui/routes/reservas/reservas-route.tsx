import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";

export function ReservasRoute({ session, initialRecordId }: { session: Session; initialRecordId?: string }) {
    const view = ViewModel(session, initialRecordId);
    return <LibraryRecords view={view} />;
}
