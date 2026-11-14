import { type Session } from "@/domain/entities/session";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { useViewModel } from "./viewmodel";
import { LibroEjemplares } from "./libro-ejemplares";

export function LibrosRoute({ session }: { session: Session }) {
    const view = useViewModel(session);
    return <LibraryRecords view={view} renderDetailContent={(id) => <LibroEjemplares key={id} session={session} libroId={id} />} />;
}
