import { Layout } from "@/ui/layout/layout";
import { useViewModel } from "./viewmodel";

export function BibliotecaRoute() {
    const { session, Component, navigation, area, profile } = useViewModel();
    if (!session || !profile) return null;

    return (
        <Layout navigation={navigation} area={area} profile={profile}>
            <Component key={session.accessToken} session={session} />
        </Layout>
    );
}
