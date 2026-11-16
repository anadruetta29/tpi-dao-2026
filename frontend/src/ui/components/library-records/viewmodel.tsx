export type StatusBadgeView = { label: string; tone: "active" | "success" | "danger" | "attention" | "neutral" };

const successful = new Set(["Disponible", "Activo", "Activa", "Habilitado", "Aprobada", "Retirada", "Entregado", "Pagada", "Recibido", "Devuelto"]);
const ongoing = new Set(["En tránsito", "Empacado", "Despachado", "Aceptado", "Prestado", "Reservado"]);
const urgent = new Set(["Vencido", "Vencida", "Atrasado", "Con incidencia", "Dañado", "Destruido", "Extraviado", "Inhabilitado", "Rechazada"]);
const pending = new Set(["Pendiente", "Lista para retiro", "Lista para retirar", "En revisión", "Nuevo", "Pendiente de pago", "Pendiente de lectura", "Falta aprobación"]);

export function statusBadge(label: string, tone?: StatusBadgeView["tone"]): StatusBadgeView {
    return {
        label,
        tone: tone ?? (urgent.has(label) ? "danger" : ongoing.has(label) ? "active" : successful.has(label) ? "success" : pending.has(label) ? "attention" : "neutral")
    };
}
import type { LibraryIconName } from "@/ui/components/library-icon/library-icon";

const moduleIcons: Partial<Record<string, LibraryIconName>> = {
    Bandeja: "inbox", Avisos: "bell", Sedes: "building", Usuarios: "users", Socios: "card", Configuración: "sliders",
    Libros: "book", Autores: "feather", "Ejemplares físicos": "shelf", "Solicitudes de préstamo": "clipboard",
    Préstamos: "book", Reservas: "calendar", Devoluciones: "undo", Multas: "receipt", Remitos: "truck"
};

export function moduleIcon(title: string): LibraryIconName {
    return moduleIcons[title] ?? "shelf";
}

