BEGIN;

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS sede_id INTEGER REFERENCES sedes(id);

CREATE INDEX IF NOT EXISTS ix_usuarios_sede_id ON usuarios (sede_id);

ALTER TABLE remitos
    ADD COLUMN IF NOT EXISTS solicitud_id INTEGER REFERENCES solicitudes_prestamo(id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_remitos_solicitud_id ON remitos (solicitud_id);

ALTER TABLE historiales_estado_remito
    ADD COLUMN IF NOT EXISTS responsable_id INTEGER,
    ADD COLUMN IF NOT EXISTS responsable_nombre VARCHAR(201);

ALTER TYPE estadoenvio ADD VALUE IF NOT EXISTS 'ACEPTADO';

COMMIT;
