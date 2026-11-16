import { Layout } from "@/ui/layout/layout";
import ViewModel from "./viewmodel";

export function BibliotecaRoute() {
    const {
        session, Component, label, navigation, area, profile,
        openPending, openReturn, openInterbibliotecaria,
        initialRecordId, prestamoInicialId, solicitudInicial
    } = ViewModel();
    if (!session || !profile) return null;

    const props = {
        session,
        initialRecordId,
        prestamoInicialId,
        solicitudInicial,
        onOpen: openPending,
        onDevolver: openReturn,
        onSolicitarInterbibliotecaria: openInterbibliotecaria
    };
    const pageKey = [session.accessToken, label, initialRecordId, prestamoInicialId, solicitudInicial?.ejemplarId].join(":");
    return (
        <Layout navigation={navigation} area={area} profile={profile}>
            <Component key={pageKey} {...props} />
        </Layout>
    );
}
