import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

test("las sugerencias respetan el stock del título y el alcance de las sedes", async () => {
    const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
    try {
        const { opcionesSedeOrigen } = await server.ssrLoadModule("/src/ui/routes/solicitudes-prestamo/sedes-origen.ts");
        const sedes = [
            { value: "1", label: "Centro" },
            { value: "2", label: "Sur" },
            { value: "3", label: "Norte" }
        ];
        const ejemplares = [
            { sedeId: "2", libroId: "7" },
            { sedeId: "3", libroId: "7" },
            { sedeId: "3", libroId: "7" },
            { sedeId: "2", libroId: "8" }
        ];

        assert.deepEqual(
            opcionesSedeOrigen(sedes, ejemplares, "7", "1", "1").map(({ value }) => value),
            ["3", "2"]
        );
        assert.match(opcionesSedeOrigen(sedes, ejemplares, "7", "1", "1")[0].label, /Sugerida/);
        assert.ok(opcionesSedeOrigen(sedes, ejemplares, "7", "2", "1").length === 0);
        assert.doesNotMatch(opcionesSedeOrigen(sedes, ejemplares, "7", "2")[0].label, /Sugerida/);
    } finally {
        await server.close();
    }
});

test("el tablero distingue atrasos, incidencias y pendientes del estado de trazabilidad", async () => {
    const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
    try {
        const { Remito } = await server.ssrLoadModule("/src/domain/entities/remito.ts");
        const { filtrarRemitosPorSeguimiento } = await server.ssrLoadModule("/src/domain/filters/remito-filters.ts");
        const remitos = Remito.fromList([
            { id: 1, estado_actual: "EN_TRANSITO", dias_transito: 4 },
            { id: 2, estado_actual: "EN_TRANSITO", dias_transito: 1 },
            { id: 3, estado_actual: "CON_INCIDENCIA", dias_transito: 5 },
            { id: 4, estado_actual: "RECIBIDO", dias_transito: 5 },
            { id: 5, estado_actual: "ACEPTADO" }
        ]);
        const filtrar = (filtro) => filtrarRemitosPorSeguimiento(remitos, filtro).map(({ id }) => id);
        assert.deepEqual(filtrar("atrasados"), ["1"]);
        assert.deepEqual(filtrar("incidencias"), ["3"]);
        assert.deepEqual(filtrar("pendientes"), ["1", "2", "5"]);
    } finally {
        await server.close();
    }
});
