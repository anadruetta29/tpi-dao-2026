import { Layout } from "@/ui/layout/layout";
import { useViewModel } from "./viewmodel";

export function BibliotecaRoute() {
    const { session, Component, label, navigation, area, profile, openPending, openReturn, initialRecordId, prestamoInicialId } = useViewModel();
    if (!session || !profile) return null;

    const props = { session, initialRecordId, prestamoInicialId, onOpen: openPending, onDevolver: openReturn };
    const pageKey = [session.accessToken, label, initialRecordId, prestamoInicialId].join(":");
    return (
        <Layout navigation={navigation} area={area} profile={profile}>
            <Component key={pageKey} {...props} />
        </Layout>
    );
}
