BEGIN;

ALTER TABLE solicitudes_prestamo ADD COLUMN IF NOT EXISTS ejemplar_ids JSON;

ALTER TABLE prestamos
    ADD COLUMN IF NOT EXISTS ejemplar_ids JSON,
    ADD COLUMN IF NOT EXISTS ejemplares_devueltos_ids JSON;

ALTER TABLE devoluciones
    ADD COLUMN IF NOT EXISTS ejemplar_id INTEGER REFERENCES ejemplares(id);

UPDATE devoluciones AS devolucion
SET ejemplar_id = prestamo.ejemplar_id
FROM prestamos AS prestamo
WHERE devolucion.prestamo_id = prestamo.id
  AND devolucion.ejemplar_id IS NULL
  AND prestamo.ejemplar_ids IS NULL;

CREATE INDEX IF NOT EXISTS ix_devoluciones_ejemplar_id ON devoluciones (ejemplar_id);

COMMIT;
