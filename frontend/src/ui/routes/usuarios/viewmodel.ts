import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol, type Usuario } from "@/domain/entities/usuario";
import { createUsuarioAction, getAllUsuariosAction, getUsuarioByIdAction, updateUsuarioAction } from "@/ui/actions/usuario/usuario.actions";
import { allOptions, info, pickData, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";

const activity = [{ value: "true", label: "Activo" }, { value: "false", label: "Inactivo" }];

function userFields(user?: Usuario): Field[] {
    return [
        { name: "nombre", placeholder: "Ej. Ana", label: "Nombre", defaultValue: user?.nombre, required: true },
        { name: "apellido", placeholder: "Ej. Pérez", label: "Apellido", defaultValue: user?.apellido, required: true },
        { name: "email", placeholder: "nombre@ejemplo.com", label: "Correo electrónico", type: "email", defaultValue: user?.email, required: true },
        { name: "password", placeholder: "Ingresá una contraseña", label: user ? "Nueva contraseña (opcional)" : "Contraseña", type: "password", autoComplete: "new-password", required: !user },
        { name: "role", label: "Rol", options: Rol.toOptions(), defaultValue: user?.role.value },
        ...(user ? [{ name: "activo", label: "Estado", options: activity, defaultValue: String(user.activo) }] : [])
    ];
}

const userData = (field: ReadField) => ({
    ...readFields(field, "nombre", "apellido", "email"),
    role: Rol.fromString(field("role"))
});

export function useViewModel(session: Session) {
    const load = useCallback(async ({ role, activo }: { role: string; activo: string }) => pickData(await getAllUsuariosAction({
        session, role, activo: activo === "" ? undefined : activo === "true"
    }), (data) => data.usuarios), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getUsuarioByIdAction(id, session), (data) => data.usuario), [session]);

    return useLibraryRecordsViewModel({
        title: "Usuarios", initialFilters: { role: "", activo: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            { name: "role", label: "Rol", options: allOptions(Rol.toOptions()) },
            { name: "activo", label: "Estado", options: allOptions(activity) }
        ], submit: (field) => readFields(field, "role", "activo") },
        getLabel: (user) => `${user.nombre} ${user.apellido} · ${user.roleName}`,
        create: { label: "Registrar usuario", fields: userFields(), submit: (field) => createUsuarioAction({
            session, ...userData(field), password: field("password")
        }) },
        describe: (user) => ({
            info: [info("Nombre", `${user.nombre} ${user.apellido}`), info("Correo electrónico", user.email),
                info("Rol", user.roleName), info("Estado", user.activo ? "Activo" : "Inactivo")],
            forms: [{ label: "Modificar usuario", fields: userFields(user), submit: (field) => updateUsuarioAction({
                session, id: user.id, ...userData(field), password: field("password") || undefined, activo: field("activo") === "true"
            }) }]
        })
    });
}
