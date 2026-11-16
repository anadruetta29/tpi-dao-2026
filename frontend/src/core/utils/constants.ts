import { allOptions } from "@/ui/routes/use-library-records-viewmodel";

export const tiposAviso = allOptions([
    { value: "RESERVA_LISTA", label: "Reserva lista" },
    { value: "PRESTAMO_POR_VENCER", label: "Vencimiento próximo" },
    { value: "PRESTAMO_ATRASADO", label: "Préstamo atrasado" }
]);

export const estadosLectura = allOptions([
    { value: "pendiente", label: "Pendientes de lectura" },
    { value: "leido", label: "Leídos" }
]);

