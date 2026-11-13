import { ENV } from "../../../core/config/env";
import { Session } from "../../../domain/entities/session";

export class AuthStorageDataSource {

    private readonly storageKey: string;

    constructor(storageKey: string = ENV.STORAGE_SESSION_KEY) {
        this.storageKey = storageKey;
    }

    public getSession(): Session | null {
        try {
            if (typeof window === "undefined") return null;
            const raw = window.localStorage.getItem(this.storageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return Session.fromObject(parsed);
        } catch {
            return null;
        }
    }

    public saveSession(session: Session): void {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(this.storageKey, JSON.stringify(session.toPlainObject()));
    }

    public clearSession(): void {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(this.storageKey);
    }

}
