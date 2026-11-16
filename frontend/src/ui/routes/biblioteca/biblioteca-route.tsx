import { Layout } from "@/ui/layout/layout";
import ViewModel from "./viewmodel";
import type { ThemeView } from "@/ui/layout/viewmodel";

export function BibliotecaRoute({ theme }: { theme: ThemeView }) {
    const {
        session, Component, label, navigation, navigationRef, area, branch, profile,
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
        <Layout navigation={navigation} navigationRef={navigationRef} area={area} branch={branch} profile={profile} theme={theme}>
            <Component key={pageKey} {...props} />
        </Layout>
    );
}
