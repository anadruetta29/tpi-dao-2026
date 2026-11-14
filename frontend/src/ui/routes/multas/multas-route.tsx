import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { useViewModel } from "./viewmodel";

export function MultasRoute({ session }: { session: Session }) {
    const view = useViewModel(session);
    return <LibraryRecords view={view} />;
}
