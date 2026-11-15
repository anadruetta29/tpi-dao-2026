import { type ActionState } from "@/core/types";
import { EstadoPrestamo, type Prestamo } from "@/domain/entities/prestamo";
import { type Session } from "@/domain/entities/session";
import { getAllEjemplaresAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getAllPrestamosAction, getPrestamoByIdAction } from "@/ui/actions/prestamo/prestamo.actions";
import { getAllSociosAction } from "@/ui/actions/socio/socio.actions";

export type CriterioMostrador = "dni" | "codigo" | "prestamo";

const noEncontrado: ActionState<Prestamo[]> = { success: true, data: [] };

function enMostrador(prestamo: Prestamo, sedeId: string): boolean {
    return prestamo.estado !== EstadoPrestamo.DEVUELTO && (!sedeId || prestamo.sedeId === sedeId);
}

export async function buscarPrestamosMostradorAction(
    session: Session,
    sedeId: string,
    criterio: CriterioMostrador,
    valor: string
): Promise<ActionState<Prestamo[]>> {
    const texto = valor.trim();
    if (!texto) return noEncontrado;

    if (criterio === "prestamo") {
        const id = texto.replace(/^#/, "");
        if (!/^[1-9]\d*$/.test(id)) {
            return { success: false, error: "Ingresá un número de préstamo válido." };
        }
        const resultado = await getPrestamoByIdAction(id, session);
        if (!resultado.success || !resultado.data) return { success: false, error: resultado.error };
        const { prestamo } = resultado.data;
        return { success: true, data: enMostrador(prestamo, sedeId) ? [prestamo] : [] };
    }

    if (criterio === "dni") {
        if (!/^\d{7,8}$/.test(texto) || Number(texto) === 0) {
            return { success: false, error: "Ingresá un DNI de 7 u 8 dígitos." };
        }
        const resultado = await getAllSociosAction({ session, documento: texto });
        if (!resultado.success) return { success: false, error: resultado.error };
        const socio = resultado.data?.find(({ documento }) => documento === texto);
        if (!socio) return noEncontrado;
        const prestamos = await getAllPrestamosAction({ session, sede_id: sedeId, socio_id: socio.id });
        if (!prestamos.success || !prestamos.data) return { success: false, error: prestamos.error };
        return { success: true, data: prestamos.data.prestamos.filter((prestamo) => enMostrador(prestamo, sedeId)) };
    }

    const ejemplares = await getAllEjemplaresAction({ session, sede_id: sedeId });
    if (!ejemplares.success || !ejemplares.data) return { success: false, error: ejemplares.error };
    const codigo = texto.toLowerCase();
    const ejemplarIds = new Set(ejemplares.data.ejemplares
        .filter((ejemplar) => ejemplar.codigo.toLowerCase() === codigo)
        .map(({ id }) => id));
    if (!ejemplarIds.size) return noEncontrado;
    const prestamos = await getAllPrestamosAction({ session, sede_id: sedeId });
    if (!prestamos.success || !prestamos.data) return { success: false, error: prestamos.error };
    return {
        success: true,
        data: prestamos.data.prestamos.filter((prestamo) => {
            if (!enMostrador(prestamo, sedeId)) return false;
            const ids = "ejemplaresIds" in prestamo && Array.isArray(prestamo.ejemplaresIds)
                ? prestamo.ejemplaresIds : [prestamo.ejemplarId];
            const devueltos = "ejemplaresDevueltosIds" in prestamo && Array.isArray(prestamo.ejemplaresDevueltosIds)
                ? prestamo.ejemplaresDevueltosIds : [];
            return ids.some((id) => ejemplarIds.has(id) && !devueltos.includes(id));
        })
    };
}
