import { Rol } from "@/domain/entities/rol";

export class UsuarioFilters {

    constructor(
        public role?: string | Rol | null,
        public activo?: boolean | null
    ) {}

    public static fromObject(obj: any): UsuarioFilters {
        if (!obj) return new UsuarioFilters();

        const rawRole = obj.filters?.role ?? obj.role;
        const rawActivo = obj.filters?.activo ?? obj.activo;

        const roleValue = rawRole instanceof Rol
            ? rawRole.value
            : (typeof rawRole === "string" && rawRole.trim() ? rawRole.trim() : null);

        const activoValue = typeof rawActivo === "boolean"
            ? rawActivo
            : rawActivo === "true"
                ? true
                : rawActivo === "false"
                    ? false
                    : null;

        return new UsuarioFilters(roleValue, activoValue);
    }

    public toApiParams(): Record<string, any> {
        const params: Record<string, any> = {};

        if (this.role) {
            params.role = this.role instanceof Rol ? this.role.value : this.role;
        }

        if (this.activo !== undefined && this.activo !== null) {
            params.activo = this.activo;
        }

        return params;
    }

}
