import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { useViewModel } from "./viewmodel";

export function SolicitudesPrestamoRoute({ session, initialRecordId }: { session: Session; initialRecordId?: string }) {
    const view = useViewModel(session, initialRecordId);
    return <LibraryRecords view={view} />;
}
