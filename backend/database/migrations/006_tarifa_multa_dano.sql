DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'motivomulta') THEN
        ALTER TYPE motivomulta ADD VALUE IF NOT EXISTS 'DANO';
    END IF;
END$$;

INSERT INTO tarifas_multa (motivo, monto)
VALUES ('DANO', 5000.0)
ON CONFLICT (motivo) DO NOTHING;
