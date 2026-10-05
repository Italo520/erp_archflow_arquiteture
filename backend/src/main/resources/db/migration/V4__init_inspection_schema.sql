-- Migração V4: Schema do Módulo de Vistorias Técnicas & Punch List do ArchFlow ERP

-- Tabela de Vistorias Técnicas de Obra
CREATE TABLE IF NOT EXISTS site_inspections (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    general_notes TEXT,
    weather_condition VARCHAR(100),
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    inspector_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Tabela de Itens de Pendência de Obra (Punch List)
CREATE TABLE IF NOT EXISTS punch_list_items (
    id VARCHAR(36) PRIMARY KEY,
    environment VARCHAR(100) NOT NULL,
    contractor_trade VARCHAR(100) NOT NULL,
    contractor_name VARCHAR(255),
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    due_date TIMESTAMP WITHOUT TIME ZONE,
    before_photo_url VARCHAR(500),
    after_photo_url VARCHAR(500),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    inspection_id VARCHAR(36) NOT NULL REFERENCES site_inspections(id) ON DELETE CASCADE,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_site_inspections_project_id ON site_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_site_inspections_status ON site_inspections(status);
CREATE INDEX IF NOT EXISTS idx_site_inspections_date ON site_inspections(date);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_inspection_id ON punch_list_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_project_id ON punch_list_items(project_id);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_status ON punch_list_items(status);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_trade ON punch_list_items(contractor_trade);
