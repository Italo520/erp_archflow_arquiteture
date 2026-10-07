-- ============================================================================
-- Migração V14: Conversão da coluna status de clients para VARCHAR(50)
-- Garante compatibilidade com o Hibernate @Enumerated(EnumType.STRING)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'status' AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE clients ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE clients ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
        ALTER TABLE clients ALTER COLUMN status SET DEFAULT 'PROSPECT';
    END IF;

    -- Normalizar status de projetos que possam ter ficado como PLANNING
    UPDATE projects SET status = 'PRELIMINARY' WHERE status = 'PLANNING';
END $$;
