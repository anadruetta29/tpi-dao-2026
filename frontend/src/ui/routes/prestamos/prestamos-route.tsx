import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { ViewModel } from "./viewmodel";

export function PrestamosRoute({ session, initialRecordId, onDevolver }: { session: Session; initialRecordId?: string; onDevolver?: (prestamoId: string) => void }) {
    const view = ViewModel(session, initialRecordId, onDevolver);
    return <LibraryRecords view={view} />;
}
