-- Migração V9: Carga de dados avançados (Membros de Equipe, Entregáveis, Orçamentos, Notificações)

-- 1. Membros de Equipe Alocados nos Projetos
INSERT INTO project_members (id, project_id, user_id, role, hourly_rate, joined_at)
VALUES 
    ('m0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 'ARCHITECT', 180.00, CURRENT_TIMESTAMP - INTERVAL '60 days'),
    ('m0000002-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'c2222222-2222-2222-2222-222222222222', 'ENGINEER', 160.00, CURRENT_TIMESTAMP - INTERVAL '50 days'),
    ('m0000003-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'c3333333-3333-3333-3333-333333333333', 'DESIGNER', 110.00, CURRENT_TIMESTAMP - INTERVAL '40 days'),
    ('m0000004-0000-0000-0000-000000000004', 'b0000002-0000-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', 'ARCHITECT', 180.00, CURRENT_TIMESTAMP - INTERVAL '45 days'),
    ('m0000005-0000-0000-0000-000000000005', 'b0000003-0000-0000-0000-000000000003', 'c3333333-3333-3333-3333-333333333333', 'DESIGNER', 110.00, CURRENT_TIMESTAMP - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- 2. Entregáveis Oficiais dos Projetos (Plantas, Modelos 3D, Cadernos)
INSERT INTO deliverables (id, name, type, description, file_url, file_size, mime_type, version, status, revision_count, project_id, task_id, created_by_id, approved_by_id, created_at, updated_at)
VALUES 
    (
        'd0000001-0000-0000-0000-000000000001',
        'Prancha 01/04 - Plantas Baixas e Layout Executivo',
        'PLANTS',
        'Plantas baixas cotadas do térreo e pavimento superior com layout de marcenaria e paginação de piso porcelanato 120x120.',
        '/api/v1/storage/download/planta_baixa_r04.pdf',
        14890000,
        'application/pdf',
        3,
        'APPROVED',
        2,
        'b0000001-0000-0000-0000-000000000001',
        't0000001-0000-0000-0000-000000000001',
        'c1111111-1111-1111-1111-111111111111',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'd0000002-0000-0000-0000-000000000002',
        'Prancha 02/04 - Cortes Esquemáticos e Elevações',
        'PLANTS',
        'Cortes longitudinais e transversais indicando alturas de peitoril, forro e detalhe de caixilharia oculta.',
        '/api/v1/storage/download/cortes_elevacoes_v2.pdf',
        18950000,
        'application/pdf',
        2,
        'IN_REVIEW',
        1,
        'b0000001-0000-0000-0000-000000000001',
        't0000002-0000-0000-0000-000000000002',
        'c1111111-1111-1111-1111-111111111111',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '8 days',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'd0000003-0000-0000-0000-000000000003',
        'Caderno de Detalhes - Cozinha Gourmet & Banhos',
        'SPECIFICATIONS',
        'Detalhamento de bancadas em quartzo Calacatta, cubas esculpidas, nichos iluminados e marcenaria técnica.',
        '/api/v1/storage/download/caderno_detalhes_v1.pdf',
        9200000,
        'application/pdf',
        1,
        'DRAFT',
        0,
        'b0000001-0000-0000-0000-000000000001',
        't0000003-0000-0000-0000-000000000003',
        'c3333333-3333-3333-3333-333333333333',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP
    ),
    (
        'd0000004-0000-0000-0000-000000000004',
        'Modelo BIM Federado (Arquitetura + Estrutura + MEP)',
        '3D_MODEL',
        'Arquivo IFC federado para compatibilização no Navisworks e extração de quantitativos de aço e concreto.',
        '/api/v1/storage/download/modelo_bim_horizon.ifc',
        52400000,
        'application/octet-stream',
        1,
        'APPROVED',
        0,
        'b0000002-0000-0000-0000-000000000002',
        NULL,
        'c1111111-1111-1111-1111-111111111111',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Orçamentos Estruturados dos Projetos
INSERT INTO budgets (id, project_id, total_budget, spent_amount, remaining_amount, budget_breakdown, status, created_at, updated_at)
VALUES 
    (
        'bg000001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        3800000.00,
        2450000.00,
        1350000.00,
        '{"fundacao": 380000, "estrutura": 850000, "esquadrias": 420000, "mep": 390000, "acabamentos": 410000}',
        'IN_EXECUTION',
        CURRENT_TIMESTAMP - INTERVAL '60 days',
        CURRENT_TIMESTAMP
    ),
    (
        'bg000002-0000-0000-0000-000000000002',
        'b0000002-0000-0000-0000-000000000002',
        6200000.00,
        1800000.00,
        4400000.00,
        '{"demolicao": 250000, "reforco_metalico": 950000, "climatizacao_vrf": 600000}',
        'IN_EXECUTION',
        CURRENT_TIMESTAMP - INTERVAL '45 days',
        CURRENT_TIMESTAMP
    ),
    (
        'bg000003-0000-0000-0000-000000000003',
        'b0000003-0000-0000-0000-000000000003',
        1950000.00,
        380000.00,
        1570000.00,
        '{"marcenaria": 650000, "iluminacao": 220000, "revestimentos": 310000}',
        'APPROVED',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Notificações do Sistema para o Administrador
INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, related_entity_type, action_url, read, created_at)
VALUES 
    (
        'n0000001-0000-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'Entregável Aprovado pelo Cliente',
        'A Prancha 01/04 - Plantas Baixas e Layout Executivo foi aprovada pelo Dr. Fernando Bittencourt.',
        'SUCCESS',
        'd0000001-0000-0000-0000-000000000001',
        'DELIVERABLE',
        '/projects/b0000001-0000-0000-0000-000000000001?tab=deliverables',
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '2 hours'
    ),
    (
        'n0000002-0000-0000-0000-000000000002',
        'Vistoria Técnica de Obra Agendada',
        'Vistoria de concretagem da laje e teste de estanqueidade programada para amanhã às 10:00.',
        'INFO',
        'b0000001-0000-0000-0000-000000000001',
        'INSPECTION',
        '/inspections',
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '5 hours'
    ),
    (
        'n0000003-0000-0000-0000-000000000003',
        'Prazo Próximo de Entrega de Fase',
        'A fase de Compatibilização do Retrofit Horizon Faria Lima vence em 5 dias.',
        'WARNING',
        'b0000002-0000-0000-0000-000000000002',
        'PROJECT',
        '/projects/b0000002-0000-0000-0000-000000000002?tab=overview',
        TRUE,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Logs de Auditoria Inicial
INSERT INTO audit_logs (id, user_id, project_id, action, entity_type, entity_id, changes, ip_address, created_at)
VALUES 
    (
        'al000001-0000-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000001-0000-0000-0000-000000000001',
        'STATUS_CHANGE',
        'PROJECT',
        'b0000001-0000-0000-0000-000000000001',
        '{"oldStatus": "EXECUTIVE", "newStatus": "CONSTRUCTION"}',
        '127.0.0.1',
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    ),
    (
        'al000002-0000-0000-0000-000000000002',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000001-0000-0000-0000-000000000001',
        'APPROVE',
        'DELIVERABLE',
        'd0000001-0000-0000-0000-000000000001',
        '{"status": "APPROVED"}',
        '127.0.0.1',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    )
ON CONFLICT (id) DO NOTHING;
