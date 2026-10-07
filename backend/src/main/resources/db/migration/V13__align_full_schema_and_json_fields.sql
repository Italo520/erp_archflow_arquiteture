-- ============================================================================
-- Migração V13: Alinhamento Estrutural e Colunas JSON para Next.js e Prisma
-- ============================================================================

-- 1. Tabela projects: colunas de fases, documentos e tags
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS attached_documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_tags TEXT[] DEFAULT ARRAY[]::text[];

-- 2. Tabela tasks: colunas JSON de apoio, tags e metadados
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tag TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS historico JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Tabela activities: anexos e notas complementares
ALTER TABLE activities ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS notes TEXT;

-- 4. Tabela deliverables: revisão, tags e metadados
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS review_comments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS due_dates TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 5. Tabela time_logs: vínculo opcional de fatura e tags
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(36);
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::text[];

-- 6. Tabela notifications: compatibilidade de URL/link
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(500);

-- 7. Tabela password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT uq_password_reset_email_token UNIQUE (email, token)
);

-- 8. Tabela system_notification_rules
CREATE TABLE IF NOT EXISTS system_notification_rules (
    id VARCHAR(36) PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sys_notif_rule UNIQUE (role, event_type)
);

-- 9. Tabela user_notification_preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_notif_pref UNIQUE (user_id, event_type)
);
