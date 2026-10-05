-- Migração V5: Schema do Módulo de Atividades e Apontamento de Horas (Time Tracking)

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE SET NULL,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
    task_id VARCHAR(36) REFERENCES tasks(id) ON DELETE SET NULL,
    created_by_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Tabela de Apontamento de Horas (Time Logs)
CREATE TABLE IF NOT EXISTS time_logs (
    id VARCHAR(36) PRIMARY KEY,
    duration DOUBLE PRECISION NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    log_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    billable BOOLEAN NOT NULL DEFAULT FALSE,
    bill_rate NUMERIC(10, 2),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id VARCHAR(36) REFERENCES tasks(id) ON DELETE SET NULL,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITHOUT TIME ZONE
);

-- Índices otimizados
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities(start_time);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_deleted_at ON activities(deleted_at);

CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_project_id ON time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_time_logs_billable ON time_logs(billable);
CREATE INDEX IF NOT EXISTS idx_time_logs_deleted_at ON time_logs(deleted_at);
