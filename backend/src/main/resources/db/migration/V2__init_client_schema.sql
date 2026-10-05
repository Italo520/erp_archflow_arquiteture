-- Criação e adequação da tabela clients para o módulo de clientes do ArchFlow ERP
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    legal_type VARCHAR(20) NOT NULL DEFAULT 'PF',
    document VARCHAR(50),
    razao_social VARCHAR(255),
    inscricao_estadual VARCHAR(50),
    address TEXT,
    geo_location JSONB,
    category VARCHAR(50) NOT NULL DEFAULT 'RESIDENTIAL',
    status VARCHAR(50) NOT NULL DEFAULT 'PROSPECT',
    rating DOUBLE PRECISION DEFAULT 5.0,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    avatar VARCHAR(500),
    notes TEXT,
    contact_preference VARCHAR(50) DEFAULT 'WHATSAPP',
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    last_interaction_at TIMESTAMP WITHOUT TIME ZONE
);

-- Garantir colunas e tipos caso a tabela já existisse
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'legal_type' AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE clients ALTER COLUMN legal_type TYPE VARCHAR(20) USING legal_type::VARCHAR(20);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'category' AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE clients ALTER COLUMN category TYPE VARCHAR(50) USING category::VARCHAR(50);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'status' AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE clients ALTER COLUMN status TYPE VARCHAR(50) USING status::VARCHAR(50);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'contact_preference' AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE clients ALTER COLUMN contact_preference TYPE VARCHAR(50) USING contact_preference::VARCHAR(50);
    END IF;
END $$;

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
