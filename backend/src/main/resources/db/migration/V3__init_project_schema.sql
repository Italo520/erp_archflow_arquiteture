-- Migração V3: Schema do Módulo de Projetos e Kanban do ArchFlow ERP

-- Tabela de Colunas Kanban do Projeto
CREATE TABLE IF NOT EXISTS project_kanban_columns (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    column_order INT NOT NULL DEFAULT 0,
    project_id VARCHAR(36),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Tabela de Projetos Arquitetônicos
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    current_column_id VARCHAR(36) REFERENCES project_kanban_columns(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    address VARCHAR(255),
    start_date TIMESTAMP WITHOUT TIME ZONE,
    delivery_date TIMESTAMP WITHOUT TIME ZONE,
    total_area DOUBLE PRECISION,
    project_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'CONCEPTUAL',
    
    -- Especificações Arquitetônicas
    architectural_style VARCHAR(50),
    construction_type VARCHAR(50),
    number_of_floors INT,
    number_of_rooms INT,
    has_basement BOOLEAN NOT NULL DEFAULT FALSE,
    has_garage BOOLEAN NOT NULL DEFAULT FALSE,
    parking_spots INT,
    landscaping_area DOUBLE PRECISION,
    environmental_license_required BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Custos e Prazos
    estimated_end_date TIMESTAMP WITHOUT TIME ZONE,
    actual_end_date TIMESTAMP WITHOUT TIME ZONE,
    planned_cost NUMERIC(12, 2) DEFAULT 0.00,
    actual_cost NUMERIC(12, 2) DEFAULT 0.00,
    visibility VARCHAR(50) NOT NULL DEFAULT 'TEAM',
    
    -- Associações e Auditoria
    owner_id VARCHAR(36) NOT NULL REFERENCES users(id),
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Vincular chave estrangeira de project_kanban_columns com projects
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_project_kanban_columns_project'
    ) THEN
        ALTER TABLE project_kanban_columns 
        ADD CONSTRAINT fk_project_kanban_columns_project 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Tabela de Estágios (Stages)
CREATE TABLE IF NOT EXISTS stages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stage_order INT NOT NULL DEFAULT 0,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Tabela de Tarefas (Tasks)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    due_date TIMESTAMP WITHOUT TIME ZONE,
    position INT NOT NULL DEFAULT 0,
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_id VARCHAR(36) NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    assignee_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_project_columns_project_id ON project_kanban_columns(project_id);
CREATE INDEX IF NOT EXISTS idx_stages_project_id ON stages(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage_id ON tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
