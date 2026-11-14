import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

test("las operaciones de la biblioteca usan la ruta, filtros y cuerpo de la API", async () => {
    const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
    const originalFetch = globalThis.fetch;
    const session = { accessToken: "token-inventado" };
    const byId = { id: "5" };
    const validUser = { id: 5, nombre: "Ana", apellido: "Pérez", role: "ADMIN", activo: true };
    let expected;
    let fixture;
    let count = 0;

    try {
        globalThis.fetch = async (url, init) => {
            const endpoint = new URL(url, "http://localhost");
            count += 1;
            assert.deepEqual(
                [init.method, endpoint.pathname.replace(/^\/api/, ""), Object.fromEntries(endpoint.searchParams),
                    init.headers.Authorization, init.body && JSON.parse(init.body)],
                expected
            );
            return fixture === undefined ? new Response(null, { status: 204 }) : Response.json(fixture);
        };

        async function source(name, className) {
            return new (await server.ssrLoadModule(`/src/infrastructure/datasource/api/${name}-api.ts`))[className]();
        }

        async function request(api, operation, args, method, path, { query = {}, body, response = { id: 5 } } = {}) {
            fixture = method === "DELETE" && path.startsWith("/libros/") ? undefined : response;
            expected = [method, path, query, path === "/auth/login" ? undefined : "Bearer token-inventado", body];
            const before = count;
            const result = await api[operation]({ session, ...args });
            assert.equal(count, before + 1, operation);
            return result;
        }

        const status = (value) => ({ getValue: () => value });
        const sede = { nombre: "Central", telefono: "123", email: "sede@example.org", horarioAtencion: "09:00 - 17:30" };
        const persona = { nombre: "Ana", apellido: "Pérez", email: "ana@example.org" };
        const socio = { ...persona, documento: "12345678", telefono: "123" };
        const libro = { titulo: "Libro", añoPublicacion: 2020, editorial: "Editorial", edicion: "1" };

        const auth = await source("auth", "AuthApiDataSource");
        const credentials = { email: persona.email, password: "contraseña" };
        const login = await request(auth, "login", credentials, "POST", "/auth/login", {
            body: credentials, response: { access_token: "token", user: validUser }
        });
        assert.equal(login.accessToken, "token");
        assert.equal(login.user.role.value, "ADMIN");
        const profile = await request(auth, "getCurrentUser", {}, "GET", "/auth/me", { response: validUser });
        assert.equal(profile.user.id, "5");

        const sedes = await source("sede", "SedeApiDataSource");
        await request(sedes, "getAllSedes", { estado: status("ACTIVA") }, "GET", "/sedes", { query: { estado: "ACTIVA" }, response: { sedes: [] } });
        await request(sedes, "getSedeById", byId, "GET", "/sedes/5");
        await request(sedes, "createSede", sede, "POST", "/sedes", { body: sede });
        await request(sedes, "updateSede", { ...byId, ...sede }, "PUT", "/sedes/5", { body: sede });
        await request(sedes, "deleteSede", byId, "DELETE", "/sedes/5");

        const usuarios = await source("usuario", "UsuarioApiDataSource");
        await request(usuarios, "getAllUsuarios", { role: "ADMIN", activo: false }, "GET", "/usuarios",
            { query: { role: "ADMIN", activo: "false" }, response: { usuarios: [] } });
        await request(usuarios, "getUsuarioById", byId, "GET", "/usuarios/5");
        await request(usuarios, "createUsuario", { ...persona, role: "ADMIN", password: "secreta" }, "POST", "/usuarios",
            { body: { ...persona, role: "ADMIN", password: "secreta" } });
        await request(usuarios, "updateUsuario", { ...byId, activo: false }, "PUT", "/usuarios/5", { body: { activo: false } });

        const socios = await source("socio", "SocioApiDataSource");
        const { EstadoSocio } = await server.ssrLoadModule("/src/domain/entities/estado-socio.ts");
        await request(socios, "getAllSocios", { q: "Ana Pérez", documento: "12345678", estado: EstadoSocio.HABILITADO }, "GET", "/socios",
            { query: { q: "Ana Pérez", documento: "12345678", estado: "HABILITADO" }, response: { socios: [] } });
        await request(socios, "getSocioById", byId, "GET", "/socios/5");
        await request(socios, "getSocioPrestamos", byId, "GET", "/socios/5/prestamos", { response: { prestamos: [] } });
        await request(socios, "getSocioMultas", byId, "GET", "/socios/5/multas", { response: { multas: [] } });
        await request(socios, "createSocio", socio, "POST", "/socios", { body: socio });
        await request(socios, "updateSocio", { ...byId, ...socio }, "PUT", "/socios/5", { body: socio });
        const enabled = await request(socios, "updateSocio", { ...byId, habilitar: true }, "PUT", "/socios/5",
            { body: { habilitar: true }, response: { id: 5, ...socio, estado: "HABILITADO" } });
        assert.equal(enabled.socio.estado.value, "HABILITADO");
        await request(socios, "deleteSocio", byId, "DELETE", "/socios/5");

        const libros = await source("libro", "LibroApiDataSource");
        const bookQuery = { titulo: "Libro", autor: "Ana", editorial: "Editorial" };
        await request(libros, "getAllLibros", bookQuery, "GET", "/libros", { query: bookQuery, response: { libros: [] } });
        await request(libros, "getLibroById", byId, "GET", "/libros/5");
        const availability = await request(libros, "getLibroDisponibilidad", byId, "GET", "/libros/5/disponibilidad",
            { response: { libro_id: 5, sedes: [{ sede_id: 3, ejemplares: [{ id: 4, codigo: "C-1", estado: "DISPONIBLE" }] }] } });
        assert.deepEqual([availability.libroId, availability.sedes[0].sedeId, availability.sedes[0].ejemplares[0].estado.value], ["5", "3", "DISPONIBLE"]);
        await request(libros, "updateLibro", { ...byId, ...libro, autoresIds: ["4"] }, "PUT", "/libros/5", { body: { ...libro, autor_ids: [4] } });
        await request(libros, "deleteLibro", byId, "DELETE", "/libros/5");

        const ejemplares = await source("ejemplar", "EjemplarApiDataSource");
        const ejemplarQuery = { libro_id: "5", sede_id: "3", estado: "DISPONIBLE" };
        await request(ejemplares, "getAllEjemplares", ejemplarQuery, "GET", "/ejemplares", { query: ejemplarQuery, response: { ejemplares: [] } });
        const { ejemplar } = await request(ejemplares, "getEjemplarById", byId, "GET", "/ejemplares/5",
            { response: { id: 5, libro_id: 2, sede_id: 3, codigo: "C-1" } });
        assert.deepEqual([ejemplar.libroId, ejemplar.sedeId], ["2", "3"]);
        await request(ejemplares, "createEjemplar", { codigo: "C-1", libro_id: "2", sede_id: "3" }, "POST", "/ejemplares",
            { body: { codigo: "C-1", libro_id: 2, sede_id: 3 } });

        const autores = await source("autor", "AutorApiDataSource");
        await request(autores, "getAllAutores", {}, "GET", "/autores", { response: { autores: [] } });
        const autor = { nombre: persona.nombre, apellido: persona.apellido };
        await request(autores, "createAutor", autor, "POST", "/autores", { body: autor });

        const solicitudes = await source("solicitud-prestamo", "SolicitudPrestamoApiDataSource");
        const { TipoPrestamo, EstadoSolicitud } = await server.ssrLoadModule("/src/domain/entities/solicitud-prestamo.ts");
        await request(solicitudes, "getAllSolicitudesPrestamo", { tipo: TipoPrestamo.LOCAL, estado: EstadoSolicitud.PENDIENTE, sedeId: "3" },
            "GET", "/solicitudes-prestamo", { query: { tipo: "LOCAL", estado: "PENDIENTE", sede_id: "3" }, response: { solicitudes: [] } });
        await request(solicitudes, "getSolicitudPrestamoById", byId, "GET", "/solicitudes-prestamo/5");
        const local = { socioId: "1", ejemplarId: "2", sedeOrigenId: "3" };
        const localBody = { socio_id: 1, ejemplar_id: 2, sede_origen_id: 3 };
        await request(solicitudes, "createSolicitudLocal", local, "POST", "/solicitudes-prestamo/local", { body: localBody });
        const { recepcionistas } = await request(solicitudes, "getRecepcionistas", {}, "GET", "/solicitudes-prestamo/recepcionistas",
            { response: { recepcionistas: [{ id: 7, nombre: "Ana", apellido: "Pérez" }] } });
        assert.equal(recepcionistas[0].id, "7");
        await request(solicitudes, "createSolicitudInterbibliotecaria",
            { recepcionistaId: "7", ejemplarId: "2", sedeOrigenId: "3", sedeDestinoId: "4" }, "POST", "/solicitudes-prestamo/interbibliotecario",
            { body: { recepcionista_id: 7, ejemplar_id: 2, sede_origen_id: 3, sede_destino_id: 4 } });
        await request(solicitudes, "updateSolicitudEstado", { ...byId, estado: EstadoSolicitud.APROBADA }, "PATCH", "/solicitudes-prestamo/5/estado",
            { body: { estado: "APROBADA" } });

        const prestamos = await source("prestamo", "PrestamoApiDataSource");
        const loanQuery = { socio_id: "1", sede_id: "3", estado: "ACTIVO" };
        await request(prestamos, "getAllPrestamos", loanQuery, "GET", "/prestamos", { query: loanQuery, response: { prestamos: [] } });
        await request(prestamos, "getPrestamoById", byId, "GET", "/prestamos/5");
        const cancelado = await request(prestamos, "cancelarPrestamo", byId, "PATCH", "/prestamos/5/cancelar",
            { body: {}, response: { id: 5, estado: "DEVUELTO", fechaDevolucion: "2026-11-14" } });
        assert.equal(cancelado.prestamo.estado.value, "DEVUELTO");
        await request(prestamos, "createPrestamo", { solicitud_id: "5", modalidad: "DOMICILIO" }, "POST", "/prestamos",
            { body: { solicitud_id: 5, modalidad: "DOMICILIO" } });

        const reservas = await source("reserva", "ReservaApiDataSource");
        const { EstadoReserva } = await server.ssrLoadModule("/src/domain/entities/estado-reserva.ts");
        const reserve = { libroId: "2", socioId: "1", sedeId: "3" };
        await request(reservas, "getAllReservas", { ...reserve, estado: EstadoReserva.ACTIVA }, "GET", "/reservas",
            { query: { libro_id: "2", socio_id: "1", sede_id: "3", estado: "ACTIVA" }, response: { reservas: [] } });
        await request(reservas, "getReservaById", byId, "GET", "/reservas/5");
        await request(reservas, "createReserva", reserve, "POST", "/reservas", { body: { libro_id: 2, socio_id: 1, sede_id: 3 } });
        await request(reservas, "updateReservaEstado", { ...byId, estado: EstadoReserva.CANCELADA }, "PATCH", "/reservas/5/estado",
            { body: { estado: "CANCELADA" } });

        const remitos = await source("remito", "RemitoApiDataSource");
        const remitoQuery = { sede_origen_id: "3", sede_destino_id: "4", estado: "EMPACADO" };
        await request(remitos, "getAllRemitos", remitoQuery, "GET", "/remitos", { query: remitoQuery, response: { remitos: [] } });
        await request(remitos, "registrarDespacho", { ...byId, fechaDespacho: "2026-11-14" }, "PATCH", "/remitos/5/despacho",
            { body: { fechaDespacho: "2026-11-14" } });
        const trace = await request(remitos, "getTrazabilidad", byId, "GET", "/remitos/5/trazabilidad",
            { response: { remito_id: 5, historial: [{ id: 8, estado: "EN_TRANSITO", fechaInicio: "2026-11-14" }] } });
        assert.equal(trace.historial[0].estado.value, "EN_TRANSITO");

        const devoluciones = await source("devolucion", "DevolucionApiDataSource");
        await request(devoluciones, "getAllDevoluciones", {}, "GET", "/devoluciones", { response: { devoluciones: [] } });
        await request(devoluciones, "getDevolucionById", byId, "GET", "/devoluciones/5");
        const date = "2026-11-14";
        await request(devoluciones, "createDevolucion", { prestamoId: "8", fecha: date, estadoDevuelto: status("DANADO") }, "POST", "/devoluciones",
            { body: { prestamo_id: 8, fecha: date, estadoDevuelto: "DANADO" } });

        const multas = await source("multa", "MultaApiDataSource");
        const fineQuery = { socio_id: "1", estado: "PENDIENTE" };
        await request(multas, "getAllMultas", fineQuery, "GET", "/multas", { query: fineQuery, response: { multas: [] } });
        await request(multas, "getMultaById", byId, "GET", "/multas/5");
        await request(multas, "createMulta", { socio_id: "1", prestamo_id: "8", motivo: "EXTRAVIO", monto: 42 }, "POST", "/multas",
            { body: { socio_id: 1, prestamo_id: 8, motivo: "EXTRAVIO", monto: 42 } });
        await request(multas, "pagarMulta", { ...byId, fechaPago: date }, "PATCH", "/multas/5/pagar", { body: { fechaPago: date } });
        await request(multas, "anularMulta", byId, "PATCH", "/multas/5/anular", { body: {} });
    } finally {
        globalThis.fetch = originalFetch;
        await server.close();
    }
});
