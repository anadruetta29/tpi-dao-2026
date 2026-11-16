export async function getPendientes(
    session: Session,
    sedeId: string
): Promise<Grupo[]> {
    const [
        solicitudes,
        despachos,
        recepciones,
        prestamos,
        reservas
    ] = await Promise.all([
        getSolicitudesPendientes(session, sedeId),
        getRemitosParaDespachar(session, sedeId),
        getRemitosParaRecibir(session, sedeId),
        getPrestamosPorVencer(session, sedeId),
        getReservasParaRetirar(session, sedeId)
    ]);

    return [
        solicitudes,
        despachos,
        recepciones,
        prestamos,
        reservas
    ];
}