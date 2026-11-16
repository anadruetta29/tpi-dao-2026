import ViewModel from "./viewmodel";
import { Login } from "@/ui/components/login/login";

export function LoginRoute() {
    const { error, isLoading, onSubmit } = ViewModel();

    return (
        <>
            <Login  error={error} isLoading={isLoading} onSubmit={onSubmit} />
        </>        
    );
}
