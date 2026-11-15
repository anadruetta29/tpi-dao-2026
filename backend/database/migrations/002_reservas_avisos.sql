BEGIN;

ALTER TYPE estadoreserva ADD VALUE IF NOT EXISTS 'LISTA_PARA_RETIRO';
ALTER TYPE estadoreserva ADD VALUE IF NOT EXISTS 'RETIRADA';

COMMIT;

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
            AND table_name = 'reservas' AND column_name = 'fecha_limite_retiro'
    ) THEN
        ALTER TABLE reservas ADD COLUMN fecha_limite_retiro DATE;

        UPDATE reservas AS r
        SET estado = 'LISTA_PARA_RETIRO',
            fecha_limite_retiro = CURRENT_DATE + 2,
            sede_id = pendientes.sede_id
        FROM (
            SELECT DISTINCT ON (r.ejemplar_id) r.id, e.sede_id
            FROM reservas AS r
            JOIN ejemplares AS e ON e.id = r.ejemplar_id
            WHERE r.estado = 'ATENDIDA' AND e.estado = 'RESERVADO'
            ORDER BY r.ejemplar_id, r.id DESC
        ) AS pendientes
        WHERE r.id = pendientes.id;
    END IF;
END
$$;

ALTER TABLE reservas ADD COLUMN IF NOT EXISTS prestamo_id INTEGER REFERENCES prestamos(id);
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS renovaciones INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS avisos (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATE NOT NULL,
    sede_id INTEGER REFERENCES sedes(id),
    socio_id INTEGER REFERENCES socios(id),
    reserva_id INTEGER REFERENCES reservas(id),
    prestamo_id INTEGER REFERENCES prestamos(id),
    fecha_email DATE
);

CREATE INDEX IF NOT EXISTS ix_avisos_sede_id ON avisos (sede_id);

CREATE TABLE IF NOT EXISTS avisos_lecturas (
    aviso_id INTEGER NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (aviso_id, usuario_id)
);

COMMIT;
