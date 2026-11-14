import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

test("catálogo y remitos respetan el contrato HTTP del backend", async () => {
    const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
    const originalFetch = globalThis.fetch;
    const requests = [];
    try {
        const { LibroApiDataSource } = await server.ssrLoadModule("/src/infrastructure/datasource/api/libro-api.ts");
        const { RemitoApiDataSource } = await server.ssrLoadModule("/src/infrastructure/datasource/api/remito-api.ts");
        const session = { accessToken: "token-de-prueba" };
        globalThis.fetch = async (url, init) => {
            requests.push([url, init.method, init.headers.Authorization, init.body && JSON.parse(init.body)]);
            const data = String(url).endsWith("/libros")
                ? { id: 8, titulo: "Libro", autor_ids: [4] }
                : { id: 12, sede_origen_id: 6, sede_destino_id: 7, ejemplar_ids: [18] };
            return Response.json(data);
        };
        const libros = new LibroApiDataSource();
        const remitos = new RemitoApiDataSource();
        const libro = (await libros.createLibro({
            session, titulo: "Libro", añoPublicacion: 2020, editorial: "Editorial", edicion: "1", autoresIds: ["4"]
        })).libro;
        await remitos.createRemito({ session, ejemplaresIds: ["18"], sede_origen_id: "6", sede_destino_id: "7" });
        await remitos.registrarRecepcion({ session, id: "12", conIncidencia: true, fechaRecepcion: "2026-11-14" });
        const { remito } = await remitos.getRemitoById({ session, id: "12" });
        assert.deepEqual(requests.map(([url, ...rest]) => [new URL(url, "http://localhost").pathname.replace(/^\/api/, ""), ...rest]), [
            ["/libros", "POST", "Bearer token-de-prueba", { titulo: "Libro", añoPublicacion: 2020, editorial: "Editorial", edicion: "1", autor_ids: [4] }],
            ["/remitos", "POST", "Bearer token-de-prueba", { ejemplar_ids: [18], sede_origen_id: 6, sede_destino_id: 7 }],
            ["/remitos/12/recepcion", "PATCH", "Bearer token-de-prueba", { fechaRecepcion: "2026-11-14", con_incidencia: true }],
            ["/remitos/12", "GET", "Bearer token-de-prueba", undefined]
        ]);
        assert.deepEqual(libro.autoresIds, ["4"]);
        assert.deepEqual([remito.sedeOrigenId, remito.sedeDestinoId, remito.ejemplaresIds], ["6", "7", ["18"]]);
    } finally {
        globalThis.fetch = originalFetch;
        await server.close();
    }
});
