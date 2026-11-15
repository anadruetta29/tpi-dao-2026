import { type SearchOption } from "@/ui/components/library-search-select/library-search-select";

type EjemplarDisponible = { sedeId: string; libroId: string };

export function opcionesSedeOrigen(
    sedes: SearchOption[],
    ejemplares: EjemplarDisponible[],
    libroId: string,
    sedeDestino: string,
    sedeRecepcionista?: string
): SearchOption[] {
    const stock = new Map<string, number>();
    for (const ejemplar of ejemplares) {
        if (ejemplar.libroId === libroId) {
            stock.set(ejemplar.sedeId, (stock.get(ejemplar.sedeId) ?? 0) + 1);
        }
    }

    const disponibles = sedes
        .filter(({ value }) => value !== sedeDestino
            && (!sedeRecepcionista || !sedeDestino || sedeDestino === sedeRecepcionista || value === sedeRecepcionista))
        .map((sede) => ({ ...sede, cantidad: stock.get(sede.value) ?? 0 }));
    if (!libroId) return disponibles.map(({ value, label }) => ({ value, label }));

    const sinStockEnDestino = Boolean(sedeDestino && !stock.get(sedeDestino));
    return disponibles
        .filter(({ cantidad }) => cantidad > 0)
        .sort((a, b) => b.cantidad - a.cantidad || a.label.localeCompare(b.label, "es"))
        .map(({ value, label, cantidad }, index) => ({
            value,
            label: `${sinStockEnDestino && index === 0 ? "Sugerida: " : ""}${label} · ${cantidad} disponible${cantidad === 1 ? "" : "s"}`
        }));
}
