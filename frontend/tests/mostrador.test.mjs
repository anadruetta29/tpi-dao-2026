import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

test("la búsqueda de mostrador encuentra préstamos por DNI, código y número dentro de la sede", async () => {
    const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
    const originalFetch = globalThis.fetch;
    try {
        const { buscarPrestamosMostradorAction } = await server.ssrLoadModule("/src/ui/actions/mostrador/mostrador.actions.ts");
        const requests = [];
        const session = { accessToken: "token-de-prueba" };
        const prestamos = [
            { id: 1, socio_id: 3, sede_id: 5, ejemplar_id: 6, estado: "ACTIVO" },
            { id: 2, socio_id: 3, sede_id: 5, ejemplar_id: 6, estado: "DEVUELTO" },
            { id: 3, socio_id: 3, sede_id: 7, ejemplar_id: 6, estado: "ACTIVO" }
        ];
        globalThis.fetch = async (url) => {
            const request = new URL(url, "http://localhost");
            const path = request.pathname.replace(/^\/api/, "");
            requests.push([path, Object.fromEntries(request.searchParams)]);
            if (path === "/socios") return Response.json({ socios: [{ id: 3, documento: "12345678" }] });
            if (path === "/ejemplares") return Response.json({ ejemplares: [{ id: 6, codigo: "AB-6" }] });
            if (path === "/prestamos/3") return Response.json(prestamos[2]);
            return Response.json({ prestamos });
        };

        assert.deepEqual((await buscarPrestamosMostradorAction(session, "5", "dni", "12345678")).data.map(({ id }) => id), ["1"]);
        assert.deepEqual((await buscarPrestamosMostradorAction(session, "5", "codigo", "ab-6")).data.map(({ id }) => id), ["1"]);
        assert.deepEqual((await buscarPrestamosMostradorAction(session, "5", "prestamo", "#3")).data, []);
        assert.deepEqual(requests, [
            ["/socios", { documento: "12345678" }],
            ["/prestamos", { socio_id: "3", sede_id: "5" }],
            ["/ejemplares", { sede_id: "5" }],
            ["/prestamos", { sede_id: "5" }],
            ["/prestamos/3", {}]
        ]);
    } finally {
        globalThis.fetch = originalFetch;
        await server.close();
    }
});

test("la bandeja separa los pendientes de origen y destino y muestra los vencimientos próximos", async () => {
    const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
    const originalFetch = globalThis.fetch;
    try {
        const { getPendientes } = await server.ssrLoadModule("/src/ui/routes/bandeja/viewmodel.tsx");
        const { localDateISO } = await server.ssrLoadModule("/src/ui/forms/handlers/local-date.ts");
        const solicitudes = [
            { id: 1, numero: "SOL-1", sede_origen_id: 5 },
            { id: 2, numero: "SOL-2", sede_origen_id: 6, sede_destino_id: 5 }
        ];
        const posterior = new Date();
        posterior.setDate(posterior.getDate() + 4);
        const requests = [];
        globalThis.fetch = async (url) => {
            const request = new URL(url, "http://localhost");
            const path = request.pathname.replace(/^\/api/, "");
            const params = Object.fromEntries(request.searchParams);
            requests.push([path, params]);
            if (path === "/solicitudes-prestamo") return Response.json({ solicitudes });
            if (path === "/prestamos") {
                return Response.json({ prestamos: [
                    { id: 3, fechaVencimiento: localDateISO(), sede_id: 5 },
                    { id: 4, fechaVencimiento: localDateISO(posterior), sede_id: 5 }
                ] });
            }
            if (path === "/reservas") return Response.json({ reservas: [{ id: 5, estado: "LISTA_PARA_RETIRO" }] });
            if (params.estado === "ACEPTADO") return Response.json({ remitos: [{ id: 6, numero: "REM-6" }] });
            if (params.estado === "EN_TRANSITO") return Response.json({ remitos: [{ id: 7, numero: "REM-7" }] });
            return Response.json({ remitos: [] });
        };

        const bandeja = await getPendientes({ accessToken: "token-de-prueba" }, "5");
        assert.deepEqual(bandeja.map(({ items }) => items.data.map(({ id }) => id)), [["1"], ["6"], ["7"], ["3"], ["5"]]);
        assert.deepEqual(requests.find(([ruta]) => ruta === "/reservas"), [
            "/reservas", { sede_id: "5", estado: "LISTA_PARA_RETIRO" }
        ]);
        assert.deepEqual(requests.find(([, params]) => params.estado === "ACEPTADO"), [
            "/remitos", { sede_origen_id: "5", estado: "ACEPTADO" }
        ]);
        assert.deepEqual(requests.find(([, params]) => params.estado === "EN_TRANSITO"), [
            "/remitos", { sede_destino_id: "5", estado: "EN_TRANSITO" }
        ]);
    } finally {
        globalThis.fetch = originalFetch;
        await server.close();
    }
});
