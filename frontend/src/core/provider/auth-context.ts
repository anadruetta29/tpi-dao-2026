import { createContext } from "react";
import { type Session } from "@/domain/entities/session";
import { type Usuario } from "@/domain/entities/usuario";
import { type LoginCommand } from "@/domain/use-cases/auth/login";

export interface AuthContextValue {
    session: Session | null;
    user: Usuario | null;
    isLoading: boolean;
    error: string | null;
    login: (command: LoginCommand) => Promise<boolean>;
    logout: () => void;
    refreshCurrentUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
