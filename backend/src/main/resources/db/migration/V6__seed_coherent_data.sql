-- Migração V6: Carga de dados fictícios coerentes e estruturados para demonstração e homologação do ArchFlow ERP

-- 1. Equipe / Usuários Adicionais (com senha padrão Admin@123456)
INSERT INTO users (id, full_name, email, password_hash, role, created_at, updated_at)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Mariana Vasconcellos (Arquiteta Titular)', 'mariana.vasconcellos@archflow.com', '$2a$12$ZZxalSGU9LrPVSMhHt6RIekJdt9rx6wr8N2WJe63cwYqz1ivBHv7y', 'EDITOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c2222222-2222-2222-2222-222222222222', 'Carlos Mendonça (Engenheiro Fiscal)', 'carlos.mendonca@archflow.com', '$2a$12$ZZxalSGU9LrPVSMhHt6RIekJdt9rx6wr8N2WJe63cwYqz1ivBHv7y', 'EDITOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c3333333-3333-3333-3333-333333333333', 'Júlia Paiva (Designer de Interiores)', 'julia.paiva@archflow.com', '$2a$12$ZZxalSGU9LrPVSMhHt6RIekJdt9rx6wr8N2WJe63cwYqz1ivBHv7y', 'VIEWER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- 2. Clientes Realistas de Alto Padrão (Residenciais, Corporativos e Comerciais)
INSERT INTO clients (id, name, email, phone, website, legal_type, document, razao_social, inscricao_estadual, address, category, status, rating, total_spent, avatar, notes, contact_preference, user_id, created_at, updated_at, last_interaction_at)
VALUES 
    ('a0000001-0000-0000-0000-000000000001', 'Dr. Fernando Bittencourt', 'fernando.bittencourt@medicina.com.br', '(11) 98765-4321', NULL, 'PF', '123.456.789-00', NULL, NULL, 'Alameda dos Flamboyants, 250 - Alphaville Residencial 2, Barueri - SP', 'RESIDENTIAL', 'ACTIVE', 5.0, 185000.00, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'Cliente muito criterioso com iluminação cênica, integração living-gourmet e esquadrias termoacústicas.', 'WHATSAPP', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    
    ('a0000002-0000-0000-0000-000000000002', 'Horizon Empreendimentos Imobiliários S.A.', 'contato@horizonincorporadora.com.br', '(11) 3210-9000', 'https://horizonincorporadora.com.br', 'PJ', '12.345.678/0001-90', 'Horizon Desenvolvimento Imobiliário S.A.', '112.334.556.778', 'Av. Brigadeiro Faria Lima, 3477 - 14º Andar - Itaim Bibi, São Paulo - SP', 'CORPORATE', 'ACTIVE', 4.8, 420000.00, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80', 'Contrato corporativo para retrofit dos lobbies, auditório e áreas de convivência da torre empresarial.', 'EMAIL', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    
    ('a0000003-0000-0000-0000-000000000003', 'Dra. Beatriz Montenegro', 'beatriz.montenegro@advocacia.com.br', '(11) 99123-8877', NULL, 'PF', '987.654.321-11', NULL, NULL, 'Rua Oscar Freire, 1120 - Apto 181 - Jardins, São Paulo - SP', 'RESIDENTIAL', 'ACTIVE', 4.9, 120000.00, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', 'Projeto de reforma integral de cobertura duplex com piscina suspensa e adega walk-in para 600 garrafas.', 'WHATSAPP', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    
    ('a0000004-0000-0000-0000-000000000004', 'Gastronomia & Arte Bistrô Ltda', 'gestao@artebistro.com.br', '(11) 3888-2211', 'https://artebistro.com.br', 'PJ', '45.678.901/0001-23', 'Gastronomia & Arte Bistrô Ltda', '987.654.321.000', 'Rua dos Pinheiros, 650 - Pinheiros, São Paulo - SP', 'COMMERCIAL', 'PROSPECT', 4.5, 0.00, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80', 'Proposta de arquitetura comercial para novo restaurante bistrô contemporâneo com bar speakeasy no mezanino.', 'IN_PERSON', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    
    ('a0000005-0000-0000-0000-000000000005', 'Lucas & Camila Esteves', 'lucas.esteves@estevesholding.com', '(19) 99654-1122', NULL, 'PF', '456.789.012-33', NULL, NULL, 'Rodovia Dom Pedro I, Km 120 - Quinta da Baroneza, Bragança Paulista - SP', 'RESIDENTIAL', 'ACTIVE', 5.0, 260000.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Residência de veraneio sustentável em estrutura mista (aço e madeira laminada colada) com vista para o vale.', 'WHATSAPP', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', CURRENT_TIMESTAMP - INTERVAL '200 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- 3. Projetos Arquitetônicos de Destaque
INSERT INTO projects (
    id, name, client_name, image_url, address, start_date, delivery_date, total_area, project_type, status,
    architectural_style, construction_type, number_of_floors, number_of_rooms, has_basement, has_garage,
    parking_spots, landscaping_area, environmental_license_required, estimated_end_date, actual_end_date,
    planned_cost, actual_cost, visibility, owner_id, client_id, created_at, updated_at
)
VALUES 
    (
        'b0000001-0000-0000-0000-000000000001',
        'Residência Alphaville - Casa do Lago',
        'Dr. Fernando Bittencourt',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'Alameda dos Flamboyants, 250 - Alphaville Residencial 2, Barueri - SP',
        CURRENT_TIMESTAMP - INTERVAL '90 days',
        CURRENT_TIMESTAMP + INTERVAL '120 days',
        680.0,
        'Residencial Unifamiliar',
        'CONSTRUCTION',
        'CONTEMPORANEO',
        'CONCRETO_ARMADO',
        2,
        5,
        TRUE,
        TRUE,
        4,
        320.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '120 days',
        NULL,
        3800000.00,
        2450000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '90 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000002-0000-0000-0000-000000000002',
        'Retrofit Corporativo Horizon Faria Lima',
        'Horizon Empreendimentos Imobiliários S.A.',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '60 days',
        CURRENT_TIMESTAMP + INTERVAL '240 days',
        1450.0,
        'Comercial Corporativo',
        'EXECUTIVE',
        'INDUSTRIAL',
        'STEEL_FRAME',
        3,
        0,
        TRUE,
        TRUE,
        25,
        180.0,
        TRUE,
        CURRENT_TIMESTAMP + INTERVAL '240 days',
        NULL,
        6200000.00,
        1800000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000002-0000-0000-0000-000000000002',
        CURRENT_TIMESTAMP - INTERVAL '60 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000003-0000-0000-0000-000000000003',
        'Cobertura Duplex Jardins - Interiores & Terraço',
        'Dra. Beatriz Montenegro',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'Rua Oscar Freire, 1120 - Apto 181 - Jardins, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP + INTERVAL '90 days',
        420.0,
        'Interiores de Alto Padrão',
        'PRELIMINARY',
        'MINIMALISTA',
        'DRYWALL',
        2,
        3,
        FALSE,
        TRUE,
        3,
        85.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '90 days',
        NULL,
        1950000.00,
        380000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000003-0000-0000-0000-000000000003',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000004-0000-0000-0000-000000000004',
        'Villa Toscana - Quinta da Baroneza',
        'Lucas & Camila Esteves',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'Rodovia Dom Pedro I, Km 120 - Quinta da Baroneza, Bragança Paulista - SP',
        CURRENT_TIMESTAMP - INTERVAL '360 days',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        1100.0,
        'Residencial de Campo',
        'COMPLETED',
        'ORGANICO',
        'HIBRIDA',
        2,
        6,
        FALSE,
        TRUE,
        6,
        950.0,
        TRUE,
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        7500000.00,
        7420000.00,
        'PUBLIC',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000005-0000-0000-0000-000000000005',
        CURRENT_TIMESTAMP - INTERVAL '360 days',
        CURRENT_TIMESTAMP - INTERVAL '20 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Colunas Kanban Padrão para Projetos
INSERT INTO project_kanban_columns (id, title, color, column_order, project_id, created_at, updated_at)
VALUES 
    ('k0000001-0000-0000-0000-000000000001', 'Estudo Preliminar & Briefing', '#6366F1', 1, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('k0000002-0000-0000-0000-000000000002', 'Anteprojeto & Maquete 3D', '#F59E0B', 2, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('k0000003-0000-0000-0000-000000000003', 'Projeto Executivo & Compatibilização', '#3B82F6', 3, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('k0000004-0000-0000-0000-000000000004', 'Acompanhamento de Obra', '#10B981', 4, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Atualizar current_column_id dos projetos para a coluna de execução
UPDATE projects SET current_column_id = 'k0000004-0000-0000-0000-000000000004' WHERE id = 'b0000001-0000-0000-0000-000000000001';

-- 5. Estágios (Stages) e Tarefas Técnicas de Arquitetura
INSERT INTO stages (id, name, stage_order, project_id, created_at, updated_at)
VALUES 
    ('s0000001-0000-0000-0000-000000000001', 'Fase 01 - Fundações e Estrutura', 1, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000002-0000-0000-0000-000000000002', 'Fase 02 - Alvenaria e Instalações MEP', 2, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000003-0000-0000-0000-000000000003', 'Fase 03 - Acabamentos e Marcenaria', 3, 'b0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, title, description, priority, due_date, position, approval_status, project_id, stage_id, assignee_id, created_at, updated_at)
VALUES 
    ('t0000001-0000-0000-0000-000000000001', 'Compatibilização BIM de vigas protendidas com dutos de ar-condicionado VRF', 'Verificar clashes no software Navisworks e ajustar pé-direito livre na circulação social.', 'URGENT', CURRENT_TIMESTAMP + INTERVAL '5 days', 1, 'APPROVED', 'b0000001-0000-0000-0000-000000000001', 's0000002-0000-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('t0000002-0000-0000-0000-000000000002', 'Detalhamento executivo das esquadrias de piso-teto em alumínio anodizado', 'Elaborar pranchas de detalhes 1:10 dos trilhos embutidos e drenagem linear oculta.', 'HIGH', CURRENT_TIMESTAMP + INTERVAL '12 days', 2, 'PENDING', 'b0000001-0000-0000-0000-000000000001', 's0000002-0000-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('t0000003-0000-0000-0000-000000000003', 'Especificação luminotécnica com protocolo DALI e fitas LED 2700K IRC95', 'Definir circuitos de automação e posicionamento de drivers remotos no forro de gesso.', 'MEDIUM', CURRENT_TIMESTAMP + INTERVAL '18 days', 3, 'PENDING', 'b0000001-0000-0000-0000-000000000001', 's0000003-0000-0000-0000-000000000003', 'c3333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('t0000004-0000-0000-0000-000000000004', 'Conferência in loco da concretagem da laje de cobertura e teste de estanqueidade', 'Inspecionar aplicação de manta asfáltica aluminizada e caimento para ralos ocultos.', 'HIGH', CURRENT_TIMESTAMP + INTERVAL '3 days', 4, 'APPROVED', 'b0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 'c2222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 6. Vistorias Técnicas de Obra & Punch List (Gestão de Pendências com Severidade)
INSERT INTO site_inspections (id, title, date, status, general_notes, weather_condition, project_id, inspector_id, created_at, updated_at)
VALUES 
    (
        'i0000001-0000-0000-0000-000000000001',
        'Vistoria Técnica Semanal #18 - Alvenarias e Instalações Embutidas',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        'COMPLETED',
        'Fiscalização geral do pavimento superior e verificação de passagens de tubulação hidráulica nos shafts.',
        'Ensolarado, 27°C',
        'b0000001-0000-0000-0000-000000000001',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'i0000002-0000-0000-0000-000000000002',
        'Vistoria de Fachada e Esquadrias Metálicas #07',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        'DRAFT',
        'Inspeção do prumo dos montantes verticais em alumínio na fachada oeste e ancoragem química.',
        'Parcialmente nublado, 23°C',
        'b0000002-0000-0000-0000-000000000002',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO punch_list_items (
    id, environment, contractor_trade, contractor_name, description, severity, status, due_date,
    before_photo_url, after_photo_url, resolution_notes, resolved_at, inspection_id, project_id, created_at, updated_at
)
VALUES 
    (
        'p0000001-0000-0000-0000-000000000001',
        'Suíte Master',
        'ELÉTRICA',
        'Volts Engenharia e Instalações',
        'Caixas 4x2 do interruptor de cabeceira instaladas a 85cm do piso, divergindo da cota de projeto (75cm).',
        'HIGH',
        'IN_PROGRESS',
        CURRENT_TIMESTAMP + INTERVAL '4 days',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        NULL,
        NULL,
        NULL,
        'i0000001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP
    ),
    (
        'p0000002-0000-0000-0000-000000000002',
        'Varanda Gourmet',
        'REVESTIMENTO',
        'Arte em Pedras e Porcelanatos Ltda',
        'Peça de porcelanato 120x120cm lascada no canto esquerdo próximo ao ralo linear.',
        'MEDIUM',
        'PENDING',
        CURRENT_TIMESTAMP + INTERVAL '8 days',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
        NULL,
        NULL,
        NULL,
        'i0000001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP
    ),
    (
        'p0000003-0000-0000-0000-000000000003',
        'Subsolo / Garagem',
        'HIDRÁULICA',
        'Hidrotec Soluções Prediais',
        'Tubulação de dreno do condensador sem caimento mínimo de 1%, causando retorno de umidade.',
        'CRITICAL',
        'RESOLVED',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=400&q=80',
        'Trecho corrigido com reposicionamento das abraçadeiras e novo teste de fluxo realizado com sucesso.',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        'i0000001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'p0000004-0000-0000-0000-000000000004',
        'Lobby Principal',
        'ESTRUTURA METÁLICA',
        'MetalTech Engenharia',
        'Falta de vedação perimetral em silicone estrutural na junção do painel de ACM com a pele de vidro.',
        'HIGH',
        'PENDING',
        CURRENT_TIMESTAMP + INTERVAL '6 days',
        'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=400&q=80',
        NULL,
        NULL,
        NULL,
        'i0000002-0000-0000-0000-000000000002',
        'b0000002-0000-0000-0000-000000000002',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Agenda de Atividades & Apontamento de Horas (Time Tracking)
INSERT INTO activities (id, type, title, description, duration, start_time, end_time, location, status, client_id, project_id, task_id, created_by_id, created_at, updated_at)
VALUES 
    (
        'd0000001-0000-0000-0000-000000000001',
        'MEETING',
        'Reunião Executiva de Aprovação de Acabamentos',
        'Apresentação de amostras físicas de mármores, marcenaria e metais sanitários para aprovação do casal.',
        90,
        CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '10 hours',
        CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '11 hours 30 minutes',
        'Showroom ArchFlow - Sala de Reunião Principal',
        'SCHEDULED',
        'a0000001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        NULL,
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'd0000002-0000-0000-0000-000000000002',
        'SITE_VISIT',
        'Visita Técnica de Fiscalização Estrutural e Concretagem',
        'Acompanhamento in loco da armadura das vigas e liberação de concretagem com engenheiro calculista.',
        180,
        CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '14 hours',
        CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '17 hours',
        'Canteiro Alphaville Residencial 2',
        'COMPLETED',
        'a0000001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        't0000004-0000-0000-0000-000000000004',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'd0000003-0000-0000-0000-000000000003',
        'DESIGN',
        'Sessão de Modelagem Paramétrica da Fachada Cinética',
        'Desenvolvimento de algoritmos no Grasshopper / Rhino para controle de insolação nos brises de alumínio.',
        240,
        CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '9 hours',
        CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '13 hours',
        'Estúdio ArchFlow - Estação BIM',
        'SCHEDULED',
        'a0000002-0000-0000-0000-000000000002',
        'b0000002-0000-0000-0000-000000000002',
        NULL,
        'c1111111-1111-1111-1111-111111111111',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO time_logs (id, duration, category, description, log_date, start_time, end_time, billable, bill_rate, user_id, project_id, task_id, client_id, created_at, updated_at)
VALUES 
    (
        'tl000001-0000-0000-0000-000000000001',
        4.5,
        'DESIGN',
        'Modelagem 3D e renderizações fotorrealistas no Lumion da área de lazer e piscina com borda infinita.',
        CURRENT_DATE - INTERVAL '1 day',
        '09:00:00',
        '13:30:00',
        TRUE,
        220.00,
        'c1111111-1111-1111-1111-111111111111',
        'b0000001-0000-0000-0000-000000000001',
        't0000001-0000-0000-0000-000000000001',
        'a0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'tl000002-0000-0000-0000-000000000002',
        3.0,
        'REVIEW',
        'Detalhamento e compatibilização de prumadas hidráulicas com projeto de forro de gesso.',
        CURRENT_DATE - INTERVAL '2 days',
        '14:00:00',
        '17:00:00',
        TRUE,
        250.00,
        'c2222222-2222-2222-2222-222222222222',
        'b0000001-0000-0000-0000-000000000001',
        't0000002-0000-0000-0000-000000000002',
        'a0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'tl000003-0000-0000-0000-000000000003',
        5.0,
        'DESIGN',
        'Detalhamento de marcenaria personalizada da suíte master, closet e banho senhor e senhora.',
        CURRENT_DATE - INTERVAL '3 days',
        '09:30:00',
        '14:30:00',
        TRUE,
        220.00,
        'c3333333-3333-3333-3333-333333333333',
        'b0000003-0000-0000-0000-000000000003',
        NULL,
        'a0000003-0000-0000-0000-000000000003',
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    ),
    (
        'tl000004-0000-0000-0000-000000000004',
        2.0,
        'MEETING',
        'Reunião técnica de alinhamento com engenheiro geotécnico e sondagem SPT do terreno.',
        CURRENT_DATE - INTERVAL '4 days',
        '10:00:00',
        '12:00:00',
        TRUE,
        300.00,
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000001-0000-0000-0000-000000000001',
        NULL,
        'a0000001-0000-0000-0000-000000000001',
        CURRENT_TIMESTAMP - INTERVAL '4 days',
        CURRENT_TIMESTAMP - INTERVAL '4 days'
    ),
    (
        'tl000005-0000-0000-0000-000000000005',
        1.5,
        'ADMIN',
        'Emissão de relatórios gerenciais e atualização do cronograma financeiro do projeto executivo.',
        CURRENT_DATE - INTERVAL '5 days',
        '16:00:00',
        '17:30:00',
        FALSE,
        NULL,
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000002-0000-0000-0000-000000000002',
        NULL,
        'a0000002-0000-0000-0000-000000000002',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    )
ON CONFLICT (id) DO NOTHING;
