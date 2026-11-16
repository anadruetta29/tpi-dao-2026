CREATE TABLE IF NOT EXISTS remito_incidencias (
    id SERIAL PRIMARY KEY,
    remito_id INTEGER NOT NULL REFERENCES remitos(id) ON DELETE CASCADE,
    ejemplar_id INTEGER NOT NULL REFERENCES ejemplares(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL,
    observacion TEXT NOT NULL,
    UNIQUE (remito_id, ejemplar_id)
);

CREATE INDEX IF NOT EXISTS ix_remito_incidencias_remito_id ON remito_incidencias (remito_id);
