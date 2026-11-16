import type { Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { useViewModel } from "./viewmodel";
import { Bandeja } from "@/ui/components/bandeja/bandeja";

export function BandejaRoute({ session, onOpen, onDevolver }: {
    session: Session;
    onOpen: (destino: DestinoBandeja) => void;
    onDevolver: (prestamoId: string) => void;
}) {
    return <Bandeja view={useViewModel(session, onOpen, onDevolver)} />;
}
