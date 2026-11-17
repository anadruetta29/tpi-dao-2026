import type { Session } from "@/domain/entities/session";
import { Reportes } from "@/ui/components/reportes/reportes";
import { useViewModel } from "./viewmodel";

export function ReportesRoute({ session }: { session: Session }) {
    return <Reportes view={useViewModel(session)} />;
}
