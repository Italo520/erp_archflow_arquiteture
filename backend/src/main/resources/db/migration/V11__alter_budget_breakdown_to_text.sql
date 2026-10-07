-- Migração V11: Ajustar tipo da coluna budget_breakdown para TEXT para compatibilidade com JPA String
ALTER TABLE budgets ALTER COLUMN budget_breakdown TYPE TEXT;
