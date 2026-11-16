
export function fechaTexto(fecha?: string | Date | null) {
    return fecha instanceof Date
        ? fecha.toISOString().slice(0, 10)
        : fecha?.slice(0, 10) ?? "";
}