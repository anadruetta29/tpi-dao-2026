import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol, type Usuario } from "@/domain/entities/usuario";
import { createUsuarioAction, getAllUsuariosAction, getUsuarioByIdAction, updateUsuarioAction } from "@/ui/actions/usuario/usuario.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { allOptions, info, pickData, type Field, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";

const activity = [
    { value: "true", label: "Activo" },
    { value: "false", label: "Inactivo" }
];

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
    {/* ===== Fetch data ===== */ }

    const fetchUsuarios = useCallback(async ({ role, activo }: { role: string; activo: string }) => {
        const result = await getAllUsuariosAction({
            session,
            role,
            activo: activo === "" ? undefined : activo === "true"
        });
        return pickData(result, (data) => data.usuarios);
    }, [session]);

    const fetchUsuarioDetail = useCallback(async (id: string) => {
        const result = await getUsuarioByIdAction(id, session);
        return pickData(result, (data) => data.usuario);
    }, [session]);

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "role", "activo");
    };

    const handleCreateUsuario = (field: ReadField) => {
        return createUsuarioAction({
            session,
            ...userData(field),
            password: field("password")
        });
    };

    const handleUpdateUsuario = (user: Usuario, field: ReadField) => {
        return updateUsuarioAction({
            session,
            id: user.id,
            ...userData(field),
            password: field("password") || undefined,
            activo: field("activo") === "true"
        });
    };

    const describeUsuario = (user: Usuario) => ({
        info: [
            info("Nombre", `${user.nombre} ${user.apellido}`),
            info("Correo electrónico", user.email),
            info("Rol", user.roleName),
            info("Estado", user.activo ? "Activo" : "Inactivo")
        ],
        forms: [{
            label: "Modificar usuario",
            fields: userFields(user),
            submit: (field: ReadField) => handleUpdateUsuario(user, field)
        }]
    });

    {/* ===== variables ===== */ }

    const getUsuarioLabel = (user: Usuario) => `${user.nombre} ${user.apellido} · ${user.roleName}`;

    const filterFields: Field[] = [
        { name: "role", label: "Rol", options: allOptions(Rol.toOptions()) },
        { name: "activo", label: "Estado", options: allOptions(activity) }
    ];

    return useLibraryRecordsViewModel({
        title: "Usuarios",
        initialFilters: { role: "", activo: "" },
        load: fetchUsuarios,
        loadDetail: fetchUsuarioDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getUsuarioLabel,
        create: {
            label: "Registrar usuario",
            fields: userFields(),
            submit: handleCreateUsuario
        },
        describe: describeUsuario
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
