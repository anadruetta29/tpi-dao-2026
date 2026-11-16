import ViewModel from "./viewmodel";
import { Login } from "@/ui/components/login/login";
import type { ThemeView } from "@/ui/layout/viewmodel";

export function LoginRoute({ theme }: { theme: ThemeView }) {
    return <Login {...ViewModel()} theme={theme} />;
}
