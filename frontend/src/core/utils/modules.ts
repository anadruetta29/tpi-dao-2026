import { AutoresRoute } from "@/ui/routes/autores/autores-route";
import { AvisosRoute } from "@/ui/routes/avisos/avisos-route";
import { BandejaRoute } from "@/ui/routes/bandeja/bandeja-route";
import { DevolucionesRoute } from "@/ui/routes/devoluciones/devoluciones-route";
import { LibrosRoute } from "@/ui/routes/libros/libros-route";
import { MultasRoute } from "@/ui/routes/multas/multas-route";
import { PrestamosRoute } from "@/ui/routes/prestamos/prestamos-route";
import { RemitosRoute } from "@/ui/routes/remitos/remitos-route";
import { ReservasRoute } from "@/ui/routes/reservas/reservas-route";
import { SedesRoute } from "@/ui/routes/sedes/sedes-route";
import { SociosRoute } from "@/ui/routes/socios/socios-route";
import { SolicitudesPrestamoRoute } from "@/ui/routes/solicitudes-prestamo/solicitudes-prestamo-route";
import { UsuariosRoute } from "@/ui/routes/usuarios/usuarios-route";
import { ConfiguracionRoute } from "@/ui/routes/configuracion/configuracion-route";

export const modules = [
    { area: "Operación", label: "Bandeja", Component: BandejaRoute },
    { area: "Operación", label: "Avisos", Component: AvisosRoute},
    { area: "Administración", label: "Sedes", Component: SedesRoute },
    { area: "Administración", label: "Usuarios", Component: UsuariosRoute, adminOnly: true },
    { area: "Administración", label: "Socios", Component: SociosRoute },
    { area: "Administración", label: "Configuración", Component: ConfiguracionRoute, adminOnly: true },
    { area: "Catálogo", label: "Libros", Component: LibrosRoute },
    { area: "Catálogo", label: "Autores", Component: AutoresRoute },
    { area: "Circulación", label: "Solicitudes de préstamo", Component: SolicitudesPrestamoRoute },
    { area: "Circulación", label: "Préstamos", Component: PrestamosRoute },
    { area: "Circulación", label: "Reservas", Component: ReservasRoute },
    { area: "Circulación", label: "Devoluciones", Component: DevolucionesRoute },
    { area: "Circulación", label: "Multas", Component: MultasRoute },
    { area: "Logística", label: "Remitos", Component: RemitosRoute }
] as const;

export type ModuleLabel = (typeof modules)[number]["label"];