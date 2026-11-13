import { BaseEntity } from "./base-entity";
import { Usuario } from "./usuario";

export { Usuario } from "./usuario";

export class Session extends BaseEntity {

    // ======== Constructor ======== //

    constructor(
        public accessToken: string = "",
        public user?: Usuario | null
    ) {
        super();
    }

    // ======== Static Factories & Methods ======== //

    public static from(raw: any): Session | null {
        return Session.fromObject(raw);
    }

    public static fromObject(obj: any): Session | null {
        if (!obj) return null;

        const accessToken = obj.accessToken || obj.access_token || obj.token || "";
        const user = obj.user || obj.usuario ? Usuario.fromObject(obj.user || obj.usuario) : null;

        return new Session(
            accessToken,
            user
        );
    }

}
