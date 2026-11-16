import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import ViewModel from "./viewmodel";

export function UsuariosRoute({ session }: { session: Session }) {
    const view = ViewModel(session);
    return <LibraryRecords view={view} />;
}
