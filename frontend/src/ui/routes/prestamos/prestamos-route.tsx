import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { useViewModel } from "./viewmodel";

export function PrestamosRoute({ session, initialRecordId, onDevolver }: { session: Session; initialRecordId?: string; onDevolver?: (prestamoId: string) => void }) {
    const view = useViewModel(session, initialRecordId, onDevolver);
    return <LibraryRecords view={view} />;
}
