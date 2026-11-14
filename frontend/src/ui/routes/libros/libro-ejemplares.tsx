import { type Session } from "@/domain/entities/session";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { useEjemplaresViewModel } from "./ejemplares-viewmodel";

export function LibroEjemplares({ session, libroId }: { session: Session; libroId: string }) {
    const { records, loadingSedes, sedesError, noActiveSedes, retrySedes } = useEjemplaresViewModel(session, libroId);
    return (
        <>
            {loadingSedes && <LibraryStatus>Cargando sedes...</LibraryStatus>}
            {sedesError && (
                <div>
                    <LibraryStatus kind="error">{sedesError}</LibraryStatus>
                    <LibraryButton onClick={retrySedes}>Reintentar carga de sedes</LibraryButton>
                </div>
            )}
            {noActiveSedes && <LibraryStatus kind="empty">Necesitás una sede activa para registrar un ejemplar.</LibraryStatus>}
            <LibraryRecords view={records} headingLevel={2} />
        </>
    );
}
