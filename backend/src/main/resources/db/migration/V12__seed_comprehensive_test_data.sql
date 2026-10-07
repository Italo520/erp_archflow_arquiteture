-- Migração V12: Carga Completa e Abrangente de Dados Fictícios de Teste (ArchFlow ERP)
-- Cobre 100% das 16 tabelas de negócio do PostgreSQL com casos realistas de arquitetura e engenharia.
-- Idempotente (ON CONFLICT DO NOTHING) e compatível com Hibernate / Spring Boot.

-- ============================================================================
-- 1. NOVOS CLIENTES DE ALTO PADRÃO (Residencial, Corporativo, Comercial, Institucional)
-- ============================================================================
INSERT INTO clients (
    id, name, email, phone, website, legal_type, document, razao_social, inscricao_estadual,
    address, category, status, rating, total_spent, avatar, notes, contact_preference,
    user_id, created_at, updated_at, last_interaction_at
)
VALUES 
    (
        'a0000010-0000-0000-0000-000000000010',
        'Vinícola Terroir da Serra Ltda',
        'diretoria@terroirdaserra.com.br',
        '(54) 3455-1200',
        'https://terroirdaserra.com.br',
        'PJ',
        '88.901.234/0001-55',
        'Terroir da Serra Vitivinicultura & Enoturismo Ltda',
        '098.765.432.110',
        'Estrada dos Vinhedos, Km 14 - Vale dos Vinhedos, Bento Gonçalves - RS',
        'COMMERCIAL',
        'ACTIVE',
        5.0,
        580000.00,
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=200&q=80',
        'Projeto de enoturismo com cantina de fermentação gravitacional, caves subterrâneas e wine bar panorâmico.',
        'EMAIL',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '150 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'a0000011-0000-0000-0000-000000000011',
        'Associação Residencial Quinta dos Pinhais',
        'administracao@quintadospinhais.org.br',
        '(12) 3663-8899',
        'https://quintadospinhais.org.br',
        'PJ',
        '55.432.109/0001-44',
        'Associação dos Proprietários Quinta dos Pinhais',
        NULL,
        'Av. das Hortênsias, 2200 - Alto da Boa Vista, Campos do Jordão - SP',
        'RESIDENTIAL',
        'ACTIVE',
        4.9,
        340000.00,
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80',
        'Masterplan de revitalização do clubhouse, quadras cobertas de tênis e trilhas ecológicas.',
        'WHATSAPP',
        'c1111111-1111-1111-1111-111111111111',
        CURRENT_TIMESTAMP - INTERVAL '110 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    ),
    (
        'a0000012-0000-0000-0000-000000000012',
        'Roberto & Helena Silveira',
        'roberto.silveira@silveirainvest.com',
        '(11) 97123-4567',
        NULL,
        'PF',
        '334.556.778-99',
        NULL,
        NULL,
        'Rua Bélgica, 410 - Jardim Europa, São Paulo - SP',
        'RESIDENTIAL',
        'ACTIVE',
        4.8,
        290000.00,
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        'Residência modernista em concreto aparente com painéis de madeira cumaru e pátio interno arborizado.',
        'WHATSAPP',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '80 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '4 days'
    ),
    (
        'a0000013-0000-0000-0000-000000000013',
        'Hospital & Maternidade São Lucas S.A.',
        'obras.expansao@saolucassaude.com.br',
        '(31) 3245-7000',
        'https://saolucassaude.com.br',
        'PJ',
        '19.876.543/0001-21',
        'Complexo Hospitalar São Lucas S.A.',
        '062.334.889.001',
        'Av. do Contorno, 5800 - Funcionários, Belo Horizonte - MG',
        'INSTITUTIONAL',
        'ACTIVE',
        5.0,
        920000.00,
        'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=200&q=80',
        'Arquitetura hospitalar: nova ala materno-infantil com centro obstétrico humanizado e UTI neonatal.',
        'EMAIL',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '210 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'a0000014-0000-0000-0000-000000000014',
        'Arena Beach Sports & Lounge Bar',
        'contato@arenabeachsangra.com.br',
        '(21) 98877-6655',
        'https://arenabeachsangra.com.br',
        'PJ',
        '41.234.567/0001-89',
        'Arena Rio Esportes de Areia e Entretenimento Ltda',
        '87.654.321',
        'Av. Lúcio Costa, 8500 - Barra da Tijuca, Rio de Janeiro - RJ',
        'COMMERCIAL',
        'ACTIVE',
        4.7,
        210000.00,
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80',
        'Complexo com 8 quadras de beach tennis, vestiários ecológicos, loja de artigos esportivos e rooftop bar.',
        'WHATSAPP',
        'c1111111-1111-1111-1111-111111111111',
        CURRENT_TIMESTAMP - INTERVAL '65 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ),
    (
        'a0000015-0000-0000-0000-000000000015',
        'Dra. Camila Fagundes',
        'camila.fagundes@dermato.med.br',
        '(11) 99554-3322',
        NULL,
        'PF',
        '221.334.556-77',
        NULL,
        NULL,
        'Rua Haddock Lobo, 1307 - Apto 142 - Cerqueira César, São Paulo - SP',
        'RESIDENTIAL',
        'ACTIVE',
        5.0,
        145000.00,
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        'Reforma de apartamento de 280m² com conceito aberto, closet amplo e acabamentos minerais suaves.',
        'WHATSAPP',
        'c3333333-3333-3333-3333-333333333333',
        CURRENT_TIMESTAMP - INTERVAL '45 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'a0000016-0000-0000-0000-000000000016',
        'Galeria de Arte Contemporânea Lumina',
        'curadoria@galerialumina.art.br',
        '(11) 3062-4411',
        'https://galerialumina.art.br',
        'PJ',
        '28.765.432/0001-90',
        'Lumina Promoções Culturais & Artes Visuais Ltda',
        '109.876.543.210',
        'Rua Estados Unidos, 1600 - Jardim América, São Paulo - SP',
        'INSTITUTIONAL',
        'ACTIVE',
        4.9,
        380000.00,
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=200&q=80',
        'Espaço expositivo com pé-direito duplo, iluminação cênica DMX dimerizável e reserva técnica climatizada.',
        'EMAIL',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '95 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '6 days'
    ),
    (
        'a0000017-0000-0000-0000-000000000017',
        'TechHub Inovação Coworking S.A.',
        'expansao@techhubspaces.io',
        '(11) 4003-8820',
        'https://techhubspaces.io',
        'PJ',
        '33.123.987/0001-05',
        'TechHub Gestão de Espaços Compartilhados S.A.',
        '118.990.223.445',
        'Rua Butantã, 468 - 8º ao 11º Andar - Pinheiros, São Paulo - SP',
        'COMMERCIAL',
        'ACTIVE',
        4.8,
        650000.00,
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80',
        'Retrofit corporativo de 4 lajes corporativas com foco em acústica para podcasts e certificação LEED Gold.',
        'EMAIL',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '130 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'a0000018-0000-0000-0000-000000000018',
        'Pousada Boutique Canto Verde',
        'reservas.diretoria@cantoverdeba.com.br',
        '(73) 3575-1122',
        'https://cantoverdeba.com.br',
        'PJ',
        '72.345.678/0001-33',
        'Canto Verde Hotelaria e Lazer Ltda',
        NULL,
        'Praia do Espelho, s/n - Trancoso, Porto Seguro - BA',
        'COMMERCIAL',
        'ACTIVE',
        5.0,
        490000.00,
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80',
        '12 bangalôs integrados à mata nativa com arquitetura vernacular baiana, pau-a-pique e telhas de demolição.',
        'WHATSAPP',
        'c1111111-1111-1111-1111-111111111111',
        CURRENT_TIMESTAMP - INTERVAL '170 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '4 days'
    ),
    (
        'a0000019-0000-0000-0000-000000000019',
        'Marcelo Drummond',
        'marcelo.drummond@agroholding.com.br',
        '(31) 99888-7711',
        NULL,
        'PF',
        '554.667.889-00',
        NULL,
        NULL,
        'Condomínio Retiro das Pedras, Alameda das Acácias, 90 - Nova Lima - MG',
        'RESIDENTIAL',
        'ACTIVE',
        4.9,
        275000.00,
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        'Casa de campo em declive acentuado sobre pilotis metálicos com vista panorâmica para a Serra do Rola-Moça.',
        'WHATSAPP',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '50 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'a0000020-0000-0000-0000-000000000020',
        'Mercado Gastronômico Vila Madalena',
        'operacoes@foodhallvilamada.com.br',
        '(11) 3812-9900',
        'https://foodhallvilamada.com.br',
        'PJ',
        '61.987.654/0001-12',
        'Vila Madalena Centro Gastronômico & Cultura Urbana Ltda',
        '114.556.778.990',
        'Rua Wisard, 305 - Vila Madalena, São Paulo - SP',
        'COMMERCIAL',
        'ACTIVE',
        4.8,
        520000.00,
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        'Food hall com 14 operações gastronômicas artesanais, praça central com teto retrátil e palco acústico.',
        'EMAIL',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '140 days',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 2. NOVOS PROJETOS ARQUITETÔNICOS COMPLETOS (Diversidade de Estilos e Tipologias)
-- ============================================================================
INSERT INTO projects (
    id, name, client_name, image_url, address, start_date, delivery_date, total_area, project_type, status,
    architectural_style, construction_type, number_of_floors, number_of_rooms, has_basement, has_garage,
    parking_spots, landscaping_area, environmental_license_required, estimated_end_date, actual_end_date,
    planned_cost, actual_cost, visibility, owner_id, client_id, created_at, updated_at
)
VALUES 
    (
        'b0000010-0000-0000-0000-000000000010',
        'Vinícola Boutique Terroir - Pavilhão de Degustação',
        'Vinícola Terroir da Serra Ltda',
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
        'Estrada dos Vinhedos, Km 14 - Vale dos Vinhedos, Bento Gonçalves - RS',
        CURRENT_TIMESTAMP - INTERVAL '120 days',
        CURRENT_TIMESTAMP + INTERVAL '180 days',
        1450.0,
        'Comercial / Agroindustrial',
        'CONSTRUCTION',
        'RUSTICO',
        'HIBRIDA',
        2,
        12,
        TRUE,
        TRUE,
        25,
        3200.0,
        TRUE,
        CURRENT_TIMESTAMP + INTERVAL '180 days',
        NULL,
        6500000.00,
        3850000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000010-0000-0000-0000-000000000010',
        CURRENT_TIMESTAMP - INTERVAL '120 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000011-0000-0000-0000-000000000011',
        'Masterplan Urbanístico & Clubhouse Quinta dos Pinhais',
        'Associação Residencial Quinta dos Pinhais',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'Av. das Hortênsias, 2200 - Alto da Boa Vista, Campos do Jordão - SP',
        CURRENT_TIMESTAMP - INTERVAL '90 days',
        CURRENT_TIMESTAMP + INTERVAL '90 days',
        2800.0,
        'Residencial / Urbanístico',
        'EXECUTIVE',
        'CONTEMPORANEO',
        'MADEIRA',
        2,
        8,
        FALSE,
        TRUE,
        40,
        8500.0,
        TRUE,
        CURRENT_TIMESTAMP + INTERVAL '90 days',
        NULL,
        4200000.00,
        1450000.00,
        'TEAM',
        'c1111111-1111-1111-1111-111111111111',
        'a0000011-0000-0000-0000-000000000011',
        CURRENT_TIMESTAMP - INTERVAL '90 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000012-0000-0000-0000-000000000012',
        'Residência Silveira - Casa Brutalista Jardim Europa',
        'Roberto & Helena Silveira',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'Rua Bélgica, 410 - Jardim Europa, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '70 days',
        CURRENT_TIMESTAMP + INTERVAL '150 days',
        720.0,
        'Residencial Unifamiliar',
        'CONSTRUCTION',
        'MODERNISTA',
        'CONCRETO_ARMADO',
        3,
        6,
        TRUE,
        TRUE,
        6,
        280.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '150 days',
        NULL,
        4800000.00,
        2900000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000012-0000-0000-0000-000000000012',
        CURRENT_TIMESTAMP - INTERVAL '70 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000013-0000-0000-0000-000000000013',
        'Nova Ala Materno-Infantil Hospital São Lucas',
        'Hospital & Maternidade São Lucas S.A.',
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        'Av. do Contorno, 5800 - Funcionários, Belo Horizonte - MG',
        CURRENT_TIMESTAMP - INTERVAL '180 days',
        CURRENT_TIMESTAMP + INTERVAL '240 days',
        3400.0,
        'Institucional Hospitalar',
        'CONSTRUCTION',
        'CONTEMPORANEO',
        'ALVENARIA',
        5,
        45,
        TRUE,
        TRUE,
        80,
        450.0,
        TRUE,
        CURRENT_TIMESTAMP + INTERVAL '240 days',
        NULL,
        12500000.00,
        7100000.00,
        'TEAM',
        'c2222222-2222-2222-2222-222222222222',
        'a0000013-0000-0000-0000-000000000013',
        CURRENT_TIMESTAMP - INTERVAL '180 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000014-0000-0000-0000-000000000014',
        'Complexo Esportivo Arena Beach Barra',
        'Arena Beach Sports & Lounge Bar',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
        'Av. Lúcio Costa, 8500 - Barra da Tijuca, Rio de Janeiro - RJ',
        CURRENT_TIMESTAMP - INTERVAL '50 days',
        CURRENT_TIMESTAMP + INTERVAL '60 days',
        1900.0,
        'Comercial Esportivo',
        'CONSTRUCTION',
        'INDUSTRIAL',
        'STEEL_FRAME',
        2,
        10,
        FALSE,
        TRUE,
        30,
        1100.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '60 days',
        NULL,
        2300000.00,
        1750000.00,
        'TEAM',
        'c1111111-1111-1111-1111-111111111111',
        'a0000014-0000-0000-0000-000000000014',
        CURRENT_TIMESTAMP - INTERVAL '50 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000015-0000-0000-0000-000000000015',
        'Reforma de Interiores Duplex Jardins',
        'Dra. Camila Fagundes',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        'Rua Haddock Lobo, 1307 - Apto 142 - Cerqueira César, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '35 days',
        CURRENT_TIMESTAMP + INTERVAL '45 days',
        280.0,
        'Residencial Interiores',
        'CONSTRUCTION',
        'MINIMALISTA',
        'DRYWALL',
        2,
        4,
        FALSE,
        TRUE,
        3,
        45.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '45 days',
        NULL,
        1600000.00,
        1120000.00,
        'TEAM',
        'c3333333-3333-3333-3333-333333333333',
        'a0000015-0000-0000-0000-000000000015',
        CURRENT_TIMESTAMP - INTERVAL '35 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000016-0000-0000-0000-000000000016',
        'Galeria de Arte Contemporânea Lumina',
        'Galeria de Arte Contemporânea Lumina',
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        'Rua Estados Unidos, 1600 - Jardim América, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '85 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        540.0,
        'Institucional Cultural',
        'COMPLETED',
        'MINIMALISTA',
        'ALVENARIA',
        2,
        5,
        FALSE,
        TRUE,
        8,
        120.0,
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        2800000.00,
        2780000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000016-0000-0000-0000-000000000016',
        CURRENT_TIMESTAMP - INTERVAL '85 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000017-0000-0000-0000-000000000017',
        'Retrofit Corporativo TechHub Faria Lima',
        'TechHub Inovação Coworking S.A.',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
        'Rua Butantã, 468 - 8º ao 11º Andar - Pinheiros, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '105 days',
        CURRENT_TIMESTAMP + INTERVAL '75 days',
        3100.0,
        'Comercial Corporativo',
        'CONSTRUCTION',
        'INDUSTRIAL',
        'HIBRIDA',
        4,
        24,
        FALSE,
        TRUE,
        60,
        210.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '75 days',
        NULL,
        5400000.00,
        3420000.00,
        'TEAM',
        'c2222222-2222-2222-2222-222222222222',
        'a0000017-0000-0000-0000-000000000017',
        CURRENT_TIMESTAMP - INTERVAL '105 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000018-0000-0000-0000-000000000018',
        'Pousada Boutique Canto Verde - Trancoso',
        'Pousada Boutique Canto Verde',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'Praia do Espelho, s/n - Trancoso, Porto Seguro - BA',
        CURRENT_TIMESTAMP - INTERVAL '140 days',
        CURRENT_TIMESTAMP + INTERVAL '120 days',
        1600.0,
        'Comercial Hoteleiro',
        'CONSTRUCTION',
        'RUSTICO',
        'MADEIRA',
        1,
        14,
        FALSE,
        FALSE,
        15,
        4200.0,
        TRUE,
        CURRENT_TIMESTAMP + INTERVAL '120 days',
        NULL,
        3900000.00,
        2680000.00,
        'TEAM',
        'c1111111-1111-1111-1111-111111111111',
        'a0000018-0000-0000-0000-000000000018',
        CURRENT_TIMESTAMP - INTERVAL '140 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000019-0000-0000-0000-000000000019',
        'Residência Drummond - Casa das Montanhas',
        'Marcelo Drummond',
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        'Condomínio Retiro das Pedras, Alameda das Acácias, 90 - Nova Lima - MG',
        CURRENT_TIMESTAMP - INTERVAL '40 days',
        CURRENT_TIMESTAMP + INTERVAL '140 days',
        520.0,
        'Residencial Unifamiliar',
        'PLANNING',
        'CONTEMPORANEO',
        'STEEL_FRAME',
        2,
        4,
        FALSE,
        TRUE,
        4,
        600.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '140 days',
        NULL,
        3200000.00,
        450000.00,
        'TEAM',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'a0000019-0000-0000-0000-000000000019',
        CURRENT_TIMESTAMP - INTERVAL '40 days',
        CURRENT_TIMESTAMP
    ),
    (
        'b0000020-0000-0000-0000-000000000020',
        'Food Hall Mercado Vila Madalena',
        'Mercado Gastronômico Vila Madalena',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        'Rua Wisard, 305 - Vila Madalena, São Paulo - SP',
        CURRENT_TIMESTAMP - INTERVAL '110 days',
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        1350.0,
        'Comercial Gastronômico',
        'CONSTRUCTION',
        'INDUSTRIAL',
        'HIBRIDA',
        2,
        16,
        FALSE,
        TRUE,
        20,
        180.0,
        FALSE,
        CURRENT_TIMESTAMP + INTERVAL '30 days',
        NULL,
        4600000.00,
        3920000.00,
        'TEAM',
        'c2222222-2222-2222-2222-222222222222',
        'a0000020-0000-0000-0000-000000000020',
        CURRENT_TIMESTAMP - INTERVAL '110 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 3. COLUNAS KANBAN DOS NOVOS PROJETOS
-- ============================================================================
INSERT INTO project_kanban_columns (id, project_id, title, color, column_order, created_at, updated_at)
VALUES 
    -- Projeto b0000010
    ('kc000010-0001-0000-0000-000000000001', 'b0000010-0000-0000-0000-000000000010', 'Planejamento & Briefing', '#3b82f6', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000010-0002-0000-0000-000000000002', 'b0000010-0000-0000-0000-000000000010', 'Em Andamento', '#10b981', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000010-0003-0000-0000-000000000003', 'b0000010-0000-0000-0000-000000000010', 'Revisão Técnica', '#f59e0b', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000010-0004-0000-0000-000000000004', 'b0000010-0000-0000-0000-000000000010', 'Concluído', '#6b7280', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Projeto b0000011
    ('kc000011-0001-0000-0000-000000000001', 'b0000011-0000-0000-0000-000000000011', 'Concepção Urbanística', '#3b82f6', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000011-0002-0000-0000-000000000002', 'b0000011-0000-0000-0000-000000000011', 'Anteprojeto', '#10b981', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000011-0003-0000-0000-000000000003', 'b0000011-0000-0000-0000-000000000011', 'Aprovação Ambiental', '#f59e0b', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000011-0004-0000-0000-000000000004', 'b0000011-0000-0000-0000-000000000011', 'Executivo Finalizado', '#6b7280', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Projeto b0000012
    ('kc000012-0001-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000012', 'Estudo Preliminar', '#3b82f6', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000012-0002-0000-0000-000000000002', 'b0000012-0000-0000-0000-000000000012', 'Detalhamento Concreto', '#10b981', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000012-0003-0000-0000-000000000003', 'b0000012-0000-0000-0000-000000000012', 'Obra & Estrutura', '#f59e0b', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000012-0004-0000-0000-000000000004', 'b0000012-0000-0000-0000-000000000012', 'Entrega das Chaves', '#6b7280', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Projeto b0000013
    ('kc000013-0001-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000013', 'Vigilância Sanitária', '#3b82f6', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000013-0002-0000-0000-000000000002', 'b0000013-0000-0000-0000-000000000013', 'Instalações Hospitalares', '#10b981', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000013-0003-0000-0000-000000000003', 'b0000013-0000-0000-0000-000000000013', 'Gases Medicinais & Climatização', '#f59e0b', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kc000013-0004-0000-0000-000000000004', 'b0000013-0000-0000-0000-000000000013', 'Comissionamento Concluído', '#6b7280', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 4. ETAPAS DE PROJETOS (stages)
-- ============================================================================
INSERT INTO stages (id, name, stage_order, project_id, created_at, updated_at)
VALUES 
    -- Etapas b0000010 (Vinícola)
    ('s0000010-0001-0000-0000-000000000001', 'Levantamento & Programa de Necessidades', 0, 'b0000010-0000-0000-0000-000000000010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000010-0002-0000-0000-000000000002', 'Anteprojeto da Cantina e Caves', 1, 'b0000010-0000-0000-0000-000000000010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000010-0003-0000-0000-000000000003', 'Projeto Executivo & Arquitetura de Interiores', 2, 'b0000010-0000-0000-0000-000000000010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Etapas b0000011 (Quinta dos Pinhais)
    ('s0000011-0001-0000-0000-000000000001', 'Masterplan & Zoneamento Ambiental', 0, 'b0000011-0000-0000-0000-000000000011', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000011-0002-0000-0000-000000000002', 'Projeto Arquitetônico do Clubhouse', 1, 'b0000011-0000-0000-0000-000000000011', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000011-0003-0000-0000-000000000003', 'Executivo Paisagístico & Quadras', 2, 'b0000011-0000-0000-0000-000000000011', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Etapas b0000012 (Casa Silveira)
    ('s0000012-0001-0000-0000-000000000001', 'Conceituação & Maquete Volumétrica 3D', 0, 'b0000012-0000-0000-0000-000000000012', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000012-0002-0000-0000-000000000002', 'Compatibilização de Estrutura de Concreto', 1, 'b0000012-0000-0000-0000-000000000012', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000012-0003-0000-0000-000000000003', 'Executivo de Acabamentos e Caixilhos Ocultos', 2, 'b0000012-0000-0000-0000-000000000012', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Etapas b0000013 (Hospital São Lucas)
    ('s0000013-0001-0000-0000-000000000001', 'Fluxos Hospitalares & Aprovação RDC 50', 0, 'b0000013-0000-0000-0000-000000000013', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000013-0002-0000-0000-000000000002', 'Compatibilização BIM Climatização/Gases', 1, 'b0000013-0000-0000-0000-000000000013', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('s0000013-0003-0000-0000-000000000003', 'Acompanhamento e Fiscalização de Obra', 2, 'b0000013-0000-0000-0000-000000000013', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 5. TAREFAS DOS PROJETOS (tasks)
-- ============================================================================
INSERT INTO tasks (
    id, title, description, priority, due_date, position, stage_id, project_id,
    assignee_id, approval_status, created_at, updated_at
)
VALUES 
    -- Tarefas b0000010 (Vinícola)
    (
        't0000010-0001-0000-0000-000000000001',
        'Modelagem 3D do Pavilhão de Degustação em BIM',
        'Modelar no Revit o pavilhão central com tesouras metálicas aparentes e vedações em vidro duplo.',
        'HIGH',
        CURRENT_TIMESTAMP + INTERVAL '10 days',
        0,
        's0000010-0002-0000-0000-000000000002',
        'b0000010-0000-0000-0000-000000000010',
        'c1111111-1111-1111-1111-111111111111',
        'APPROVED',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP
    ),
    (
        't0000010-0002-0000-0000-000000000002',
        'Cálculo e Detalhamento da Climatização Passiva das Caves',
        'Estudo geotérmico e dimensionamento das paredes de contenção em pedra basalto.',
        'HIGH',
        CURRENT_TIMESTAMP + INTERVAL '20 days',
        1,
        's0000010-0002-0000-0000-000000000002',
        'b0000010-0000-0000-0000-000000000010',
        'c2222222-2222-2222-2222-222222222222',
        'PENDING',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        CURRENT_TIMESTAMP
    ),
    (
        't0000010-0003-0000-0000-000000000003',
        'Especificação dos Móveis de Degustação e Balcão Wine Bar',
        'Marcenaria técnica em madeira de carvalho de reaproveitamento de barris.',
        'MEDIUM',
        CURRENT_TIMESTAMP + INTERVAL '35 days',
        2,
        's0000010-0003-0000-0000-000000000003',
        'b0000010-0000-0000-0000-000000000010',
        'c3333333-3333-3333-3333-333333333333',
        'PENDING',
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        CURRENT_TIMESTAMP
    ),

    -- Tarefas b0000012 (Casa Silveira)
    (
        't0000012-0001-0000-0000-000000000001',
        'Paginação das Formas de Madeira do Concreto Aparente',
        'Definir pranchas de madeira ripada para paginação visual e furação das gravatas.',
        'URGENT',
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        0,
        's0000012-0002-0000-0000-000000000002',
        'b0000012-0000-0000-0000-000000000012',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'APPROVED',
        CURRENT_TIMESTAMP - INTERVAL '25 days',
        CURRENT_TIMESTAMP
    ),
    (
        't0000012-0002-0000-0000-000000000002',
        'Detalhamento dos Caixilhos Minimalistas Embutidos no Piso',
        'Perfil Schüco embutido nivelado ao piso de tecnocimento sem ressaltos.',
        'HIGH',
        CURRENT_TIMESTAMP + INTERVAL '15 days',
        1,
        's0000012-0003-0000-0000-000000000003',
        'b0000012-0000-0000-0000-000000000012',
        'c1111111-1111-1111-1111-111111111111',
        'APPROVED',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        CURRENT_TIMESTAMP
    ),

    -- Tarefas b0000013 (Hospital São Lucas)
    (
        't0000013-0001-0000-0000-000000000001',
        'Adequação de Exaustão com Filtros HEPA nas UTIs Neonatais',
        'Compatibilizar traçado de dutos de pressão negativa com vigas de transição.',
        'URGENT',
        CURRENT_TIMESTAMP + INTERVAL '5 days',
        0,
        's0000013-0002-0000-0000-000000000002',
        'b0000013-0000-0000-0000-000000000013',
        'c2222222-2222-2222-2222-222222222222',
        'APPROVED',
        CURRENT_TIMESTAMP - INTERVAL '40 days',
        CURRENT_TIMESTAMP
    ),
    (
        't0000013-0002-0000-0000-000000000002',
        'Especificação de Piso Vinílico Condutivo com Canto Curvo Hospitalar',
        'Rodapé hospitalar em meia-cana em manta homogênea soldada a quente.',
        'MEDIUM',
        CURRENT_TIMESTAMP + INTERVAL '25 days',
        1,
        's0000013-0003-0000-0000-000000000003',
        'b0000013-0000-0000-0000-000000000013',
        'c3333333-3333-3333-3333-333333333333',
        'PENDING',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 6. ALOCAÇÃO DE MEMBROS DA EQUIPE NOS PROJETOS (project_members)
-- ============================================================================
INSERT INTO project_members (id, project_id, user_id, role, hourly_rate, joined_at, created_at, updated_at)
VALUES 
    -- Vinícola Terroir
    ('pm000010-0001-0000-0000-000000000001', 'b0000010-0000-0000-0000-000000000010', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', 'OWNER', 220.00, CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pm000010-0002-0000-0000-000000000002', 'b0000010-0000-0000-0000-000000000010', 'c1111111-1111-1111-1111-111111111111', 'EDITOR', 180.00, CURRENT_TIMESTAMP - INTERVAL '115 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pm000010-0003-0000-0000-000000000003', 'b0000010-0000-0000-0000-000000000010', 'c2222222-2222-2222-2222-222222222222', 'EDITOR', 160.00, CURRENT_TIMESTAMP - INTERVAL '110 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Quinta dos Pinhais
    ('pm000011-0001-0000-0000-000000000001', 'b0000011-0000-0000-0000-000000000011', 'c1111111-1111-1111-1111-111111111111', 'OWNER', 180.00, CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pm000011-0002-0000-0000-000000000002', 'b0000011-0000-0000-0000-000000000011', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', 'VIEWER', 220.00, CURRENT_TIMESTAMP - INTERVAL '85 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Casa Silveira
    ('pm000012-0001-0000-0000-000000000001', 'b0000012-0000-0000-0000-000000000012', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', 'OWNER', 220.00, CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pm000012-0002-0000-0000-000000000002', 'b0000012-0000-0000-0000-000000000012', 'c3333333-3333-3333-3333-333333333333', 'EDITOR', 110.00, CURRENT_TIMESTAMP - INTERVAL '65 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

    -- Hospital São Lucas
    ('pm000013-0001-0000-0000-000000000001', 'b0000013-0000-0000-0000-000000000013', 'c2222222-2222-2222-2222-222222222222', 'OWNER', 190.00, CURRENT_TIMESTAMP - INTERVAL '180 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pm000013-0002-0000-0000-000000000002', 'b0000013-0000-0000-0000-000000000013', 'c1111111-1111-1111-1111-111111111111', 'EDITOR', 180.00, CURRENT_TIMESTAMP - INTERVAL '170 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('pm000013-0003-0000-0000-000000000003', 'b0000013-0000-0000-0000-000000000013', '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f', 'VIEWER', 220.00, CURRENT_TIMESTAMP - INTERVAL '170 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 7. ESTIMATIVAS TÉCNICAS (estimates) - Popular tabela atualmente zerada
-- ============================================================================
INSERT INTO estimates (
    id, project_id, estimated_hours, estimated_cost, actual_hours, actual_cost, status, notes, created_at, updated_at
)
VALUES 
    -- Projetos existentes
    (
        'est00001-0000-0000-0000-000000000001',
        'b0000001-0000-0000-0000-000000000001',
        640.0,
        96000.00,
        520.0,
        78000.00,
        'IN_PROGRESS',
        'Estimativa arquitetônica e de detalhamento executivo para residência de alto padrão.',
        CURRENT_TIMESTAMP - INTERVAL '80 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00002-0000-0000-0000-000000000002',
        'b0000002-0000-0000-0000-000000000002',
        1100.0,
        185000.00,
        890.0,
        149000.00,
        'IN_PROGRESS',
        'Retrofit corporativo com múltiplos subprojetos de climatização e instalações.',
        CURRENT_TIMESTAMP - INTERVAL '110 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00003-0000-0000-0000-000000000003',
        'b0000003-0000-0000-0000-000000000003',
        380.0,
        57000.00,
        360.0,
        54000.00,
        'COMPLETED',
        'Reforma de interiores residencial de cobertura duplex com marcenaria sob medida.',
        CURRENT_TIMESTAMP - INTERVAL '38 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00004-0000-0000-0000-000000000004',
        'b0000004-0000-0000-0000-000000000004',
        450.0,
        72000.00,
        120.0,
        19200.00,
        'APPROVED',
        'Projeto de pavilhão de lazer e paisagismo integrado.',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        CURRENT_TIMESTAMP
    ),

    -- Novos Projetos
    (
        'est00010-0000-0000-0000-000000000010',
        'b0000010-0000-0000-0000-000000000010',
        1400.0,
        252000.00,
        880.0,
        158400.00,
        'IN_PROGRESS',
        'Complexo enológico: arquitetura bioclimática e integração com vinhedos.',
        CURRENT_TIMESTAMP - INTERVAL '120 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00011-0000-0000-0000-000000000011',
        'b0000011-0000-0000-0000-000000000011',
        980.0,
        166600.00,
        640.0,
        108800.00,
        'IN_PROGRESS',
        'Masterplan e projeto arquitetônico do clubhouse em estrutura de madeira laminada.',
        CURRENT_TIMESTAMP - INTERVAL '90 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00012-0000-0000-0000-000000000012',
        'b0000012-0000-0000-0000-000000000012',
        750.0,
        142500.00,
        510.0,
        96900.00,
        'IN_PROGRESS',
        'Residência em concreto aparente e cálculo minucioso de escoramento.',
        CURRENT_TIMESTAMP - INTERVAL '70 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00013-0000-0000-0000-000000000013',
        'b0000013-0000-0000-0000-000000000013',
        2200.0,
        418000.00,
        1650.0,
        313500.00,
        'IN_PROGRESS',
        'Ala hospitalar: alto índice de horas técnicas de compatibilização multidisciplinar.',
        CURRENT_TIMESTAMP - INTERVAL '180 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00014-0000-0000-0000-000000000014',
        'b0000014-0000-0000-0000-000000000014',
        520.0,
        83200.00,
        430.0,
        68800.00,
        'IN_PROGRESS',
        'Complexo esportivo comercial com montagem rápida em steel frame.',
        CURRENT_TIMESTAMP - INTERVAL '50 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00015-0000-0000-0000-000000000015',
        'b0000015-0000-0000-0000-000000000015',
        310.0,
        46500.00,
        240.0,
        36000.00,
        'IN_PROGRESS',
        'Reforma de interiores em duplex com projeto luminotécnico e marcenaria.',
        CURRENT_TIMESTAMP - INTERVAL '35 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00016-0000-0000-0000-000000000016',
        'b0000016-0000-0000-0000-000000000016',
        600.0,
        108000.00,
        590.0,
        106200.00,
        'COMPLETED',
        'Galeria de arte contemporânea concluída no prazo estimado.',
        CURRENT_TIMESTAMP - INTERVAL '85 days',
        CURRENT_TIMESTAMP
    ),
    (
        'est00017-0000-0000-0000-000000000017',
        'b0000017-0000-0000-0000-000000000017',
        1250.0,
        225000.00,
        920.0,
        165600.00,
        'IN_PROGRESS',
        'Retrofit corporativo com requisitos de sustentabilidade LEED.',
        CURRENT_TIMESTAMP - INTERVAL '105 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 8. ORÇAMENTOS ESTRUTURADOS DOS PROJETOS (budgets)
-- ============================================================================
INSERT INTO budgets (
    id, project_id, total_budget, spent_amount, remaining_amount, budget_breakdown, status, created_at, updated_at
)
VALUES 
    (
        'bg000010-0000-0000-0000-000000000010',
        'b0000010-0000-0000-0000-000000000010',
        6500000.00,
        3850000.00,
        2650000.00,
        '{"fundacoes_escavacao": 720000, "estrutura_metalica_madeira": 1650000, "climatizacao_caves": 850000, "acabamentos_pedra": 630000}',
        'IN_EXECUTION',
        CURRENT_TIMESTAMP - INTERVAL '120 days',
        CURRENT_TIMESTAMP
    ),
    (
        'bg000011-0000-0000-0000-000000000011',
        'b0000011-0000-0000-0000-000000000011',
        4200000.00,
        1450000.00,
        2750000.00,
        '{"terraplenagem_vias": 550000, "estrutura_clubhouse": 1200000, "piscinas_lazer": 800000, "paisagismo_nativo": 650000}',
        'APPROVED',
        CURRENT_TIMESTAMP - INTERVAL '90 days',
        CURRENT_TIMESTAMP
    ),
    (
        'bg000012-0000-0000-0000-000000000012',
        'b0000012-0000-0000-0000-000000000012',
        4800000.00,
        2900000.00,
        1900000.00,
        '{"concreto_aparente_formas": 1400000, "caixilhos_schuco": 890000, "impermeabilizacao": 320000, "automacao_residencial": 290000}',
        'IN_EXECUTION',
        CURRENT_TIMESTAMP - INTERVAL '70 days',
        CURRENT_TIMESTAMP
    ),
    (
        'bg000013-0000-0000-0000-000000000013',
        'b0000013-0000-0000-0000-000000000013',
        12500000.00,
        7100000.00,
        5400000.00,
        '{"gases_medicinais": 1850000, "climatizacao_hepa": 2300000, "blindagem_radiologica": 950000, "instalacoes_eletricas_uti": 2000000}',
        'IN_EXECUTION',
        CURRENT_TIMESTAMP - INTERVAL '180 days',
        CURRENT_TIMESTAMP
    ),
    (
        'bg000014-0000-0000-0000-000000000014',
        'b0000014-0000-0000-0000-000000000014',
        2300000.00,
        1750000.00,
        550000.00,
        '{"areia_drenagem_quadras": 380000, "cobertura_tensil": 620000, "vestiarios_vestiarios": 450000, "som_iluminacao_led": 300000}',
        'IN_EXECUTION',
        CURRENT_TIMESTAMP - INTERVAL '50 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 9. ENTREGÁVEIS OFICIAIS DOS PROJETOS (deliverables)
-- ============================================================================
INSERT INTO deliverables (
    id, name, type, description, file_url, file_size, mime_type, version, status, revision_count,
    project_id, task_id, created_by_id, approved_by_id, created_at, updated_at
)
VALUES 
    (
        'd0000010-0001-0000-0000-000000000001',
        'Caderno 01/03 - Cortes e Fachadas Vinícola Terroir',
        'PLANTS',
        'Cortes esquemáticos evidenciando a ventilação cruzada e o desnível natural das caves subterrâneas.',
        '/api/v1/storage/download/cortes_vinicola_r02.pdf',
        24500000,
        'application/pdf',
        2,
        'APPROVED',
        1,
        'b0000010-0000-0000-0000-000000000010',
        't0000010-0001-0000-0000-000000000001',
        'c1111111-1111-1111-1111-111111111111',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '18 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    ),
    (
        'd0000010-0002-0000-0000-000000000002',
        'Memorial Descritivo de Acabamentos Rústicos e Pedras Nativas',
        'SPECIFICATIONS',
        'Especificação técnica de pedra basalto cortada a mão e madeiras nobres tratadas com óleo vegetal.',
        '/api/v1/storage/download/memorial_acabamentos_vinicola.pdf',
        8100000,
        'application/pdf',
        1,
        'APPROVED',
        0,
        'b0000010-0000-0000-0000-000000000010',
        NULL,
        'c3333333-3333-3333-3333-333333333333',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '12 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'd0000012-0001-0000-0000-000000000001',
        'Prancha Executiva - Paginação de Formas Concreto Aparente',
        'PLANTS',
        'Detalhamento milimétrico de juntas de dilatação, encontro com caixilhos e estanqueidade de laje.',
        '/api/v1/storage/download/paginacao_concreto_silveira.pdf',
        19200000,
        'application/pdf',
        3,
        'APPROVED',
        2,
        'b0000012-0000-0000-0000-000000000012',
        't0000012-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '22 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ),
    (
        'd0000013-0001-0000-0000-000000000001',
        'Modelo BIM Federado - Ala Materno-Infantil (IFC 4.0)',
        '3D_MODEL',
        'Modelo completo compatibilizado com detecção de 0 interferências críticas (Clash Detection Navisworks).',
        '/api/v1/storage/download/modelo_bim_hospital_r03.ifc',
        68400000,
        'application/octet-stream',
        3,
        'APPROVED',
        2,
        'b0000013-0000-0000-0000-000000000013',
        't0000013-0001-0000-0000-000000000001',
        'c2222222-2222-2222-2222-222222222222',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 10. APONTAMENTOS DE HORAS TÉCNICAS (time_logs)
-- ============================================================================
INSERT INTO time_logs (
    id, user_id, project_id, task_id, client_id, duration, category, description,
    date, log_date, start_time, end_time, billable, bill_rate, created_at, updated_at
)
VALUES 
    (
        'tl000010-0001-0000-0000-000000000001',
        'c1111111-1111-1111-1111-111111111111',
        'b0000010-0000-0000-0000-000000000010',
        't0000010-0001-0000-0000-000000000001',
        'a0000010-0000-0000-0000-000000000010',
        4.5,
        'DESIGN',
        'Modelagem paramétrica da cobertura do pavilhão de degustação no Revit.',
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_DATE - INTERVAL '3 days',
        '09:00:00',
        '13:30:00',
        TRUE,
        180.00,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'tl000010-0002-0000-0000-000000000002',
        'c2222222-2222-2222-2222-222222222222',
        'b0000010-0000-0000-0000-000000000010',
        't0000010-0002-0000-0000-000000000002',
        'a0000010-0000-0000-0000-000000000010',
        3.0,
        'SITE_VISIT',
        'Visita técnica no terreno para conferência do ensaio de permeabilidade do solo.',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE - INTERVAL '5 days',
        '14:00:00',
        '17:00:00',
        TRUE,
        160.00,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'tl000012-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000012-0000-0000-0000-000000000012',
        't0000012-0001-0000-0000-000000000001',
        'a0000012-0000-0000-0000-000000000012',
        5.0,
        'DESIGN',
        'Alinhamento estético e detalhamento executivo das empenas de concreto aparente.',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE - INTERVAL '2 days',
        '08:30:00',
        '13:30:00',
        TRUE,
        220.00,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'tl000013-0001-0000-0000-000000000001',
        'c2222222-2222-2222-2222-222222222222',
        'b0000013-0000-0000-0000-000000000013',
        't0000013-0001-0000-0000-000000000001',
        'a0000013-0000-0000-0000-000000000013',
        6.0,
        'MEETING',
        'Reunião técnica com engenharia clínica e fiscalização da ANVISA para aprovação de layout.',
        CURRENT_DATE - INTERVAL '4 days',
        CURRENT_DATE - INTERVAL '4 days',
        '09:00:00',
        '15:00:00',
        TRUE,
        190.00,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 11. AGENDA TÉCNICA E ATIVIDADES (activities)
-- ============================================================================
INSERT INTO activities (
    id, title, type, description, duration, start_time, end_time, location, participants,
    status, client_id, project_id, task_id, created_by_id, created_at, updated_at
)
VALUES 
    (
        'act00010-0001-0000-0000-000000000001',
        'Apresentação de Estudo Preliminar aos Sócios da Vinícola',
        'MEETING',
        'Apresentação do conceito volumétrico e fluxo de enoturismo com degustação guiada.',
        120,
        CURRENT_TIMESTAMP + INTERVAL '2 days',
        CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '2 hours',
        'Sala de Reuniões Principal - ArchFlow Office',
        ARRAY['mariana.vasconcellos@archflow.com', 'diretoria@terroirdaserra.com.br'],
        'SCHEDULED',
        'a0000010-0000-0000-0000-000000000010',
        'b0000010-0000-0000-0000-000000000010',
        NULL,
        'c1111111-1111-1111-1111-111111111111',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'act00012-0001-0000-0000-000000000001',
        'Vistoria de Desforma de Concreto Aparente - Residência Silveira',
        'SITE_VISIT',
        'Inspeção da primeira concretagem da empena da sala com teste de cura química e textura.',
        90,
        CURRENT_TIMESTAMP + INTERVAL '3 days',
        CURRENT_TIMESTAMP + INTERVAL '3 days' + INTERVAL '90 minutes',
        'Canteiro de Obras - Rua Bélgica, 410, Jardim Europa - SP',
        ARRAY['admin@archflow.com', 'carlos.mendonca@archflow.com'],
        'SCHEDULED',
        'a0000012-0000-0000-0000-000000000012',
        'b0000012-0000-0000-0000-000000000012',
        't0000012-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'act00013-0001-0000-0000-000000000001',
        'Alinhamento Técnico com Vigilância Sanitária',
        'CALL',
        'Chamada de alinhamento com a equipe técnica da prefeitura sobre fluxo de expurgo e farmácia satélite.',
        60,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour',
        'Google Meet',
        ARRAY['carlos.mendonca@archflow.com', 'obras.expansao@saolucassaude.com.br'],
        'COMPLETED',
        'a0000013-0000-0000-0000-000000000013',
        'b0000013-0000-0000-0000-000000000013',
        NULL,
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 12. VISTORIAS TÉCNICAS E ITENS DE PUNCH LIST
-- ============================================================================
INSERT INTO site_inspections (
    id, title, date, status, general_notes, weather_condition, project_id, inspector_id, created_at, updated_at
)
VALUES 
    (
        'insp0010-0001-0000-0000-000000000001',
        'Vistoria de Fundações e Terraplenagem das Caves',
        CURRENT_TIMESTAMP - INTERVAL '45 days',
        'COMPLETED',
        'Fundações em estacas escavadas executadas conforme cota de apoio. Nível do lençol freático estável.',
        'Ensolarado (24°C)',
        'b0000010-0000-0000-0000-000000000010',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '45 days',
        CURRENT_TIMESTAMP
    ),
    (
        'insp0012-0001-0000-0000-000000000001',
        'Vistoria de Armação e Alinhamento de Formas - Casa Silveira',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        'COMPLETED',
        'Espaçadores plásticos conferidos garantindo cobrimento mínimo de 3cm para proteção contra carbonatação.',
        'Nublado (19°C)',
        'b0000012-0000-0000-0000-000000000012',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        CURRENT_TIMESTAMP
    ),
    (
        'insp0013-0001-0000-0000-000000000001',
        'Vistoria de Pré-Comissionamento de Gases e Ar Condicionado UTI',
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        'COMPLETED',
        'Testes de estanqueidade das tubulações de oxigênio e vácuo clínico com 100% de conformidade.',
        'Chuvoso (21°C)',
        'b0000013-0000-0000-0000-000000000013',
        'c2222222-2222-2222-2222-222222222222',
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO punch_list_items (
    id, inspection_id, project_id, environment, contractor_trade, contractor_name,
    description, severity, status, due_date, before_photo_url, after_photo_url,
    resolution_notes, resolved_at, created_at, updated_at
)
VALUES 
    (
        'pli00010-0001-0000-0000-000000000001',
        'insp0010-0001-0000-0000-000000000001',
        'b0000010-0000-0000-0000-000000000010',
        'Cave Subterrânea 01',
        'Impermeabilização',
        'VedaTech Soluções Estruturais',
        'Umidade pontual na junta de dilatação entre o bloco de apoio e o muro de contenção.',
        'HIGH',
        'RESOLVED',
        CURRENT_TIMESTAMP - INTERVAL '20 days',
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        'Injeção de poliuretano hidrofílico realizada e teste de estanqueidade aprovado.',
        CURRENT_TIMESTAMP - INTERVAL '18 days',
        CURRENT_TIMESTAMP - INTERVAL '45 days',
        CURRENT_TIMESTAMP
    ),
    (
        'pli00012-0001-0000-0000-000000000001',
        'insp0012-0001-0000-0000-000000000001',
        'b0000012-0000-0000-0000-000000000012',
        'Living Integrado',
        'Esquadrias Metálicas',
        'Esquadrias Alpha Prime',
        'Trilho inferior do caixilho com desnível de 4mm em relação à soleira acabada.',
        'MEDIUM',
        'IN_PROGRESS',
        CURRENT_TIMESTAMP + INTERVAL '5 days',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        NULL,
        'Equipe no local fazendo o calçamento e nivelamento a laser.',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '15 days',
        CURRENT_TIMESTAMP
    ),
    (
        'pli00013-0001-0000-0000-000000000001',
        'insp0013-0001-0000-0000-000000000001',
        'b0000013-0000-0000-0000-000000000013',
        'UTI Neonatal Leito 04',
        'Gases Medicinais',
        'AirMed Engenharia Hospitalar',
        'Ponto de óxido nitroso com encaixe rígido fora do padrão DIN exigido pela especificação.',
        'CRITICAL',
        'RESOLVED',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
        'Válvula substituída pelo modelo importado DIN e recalibrada com laudo de teste emitido.',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 13. NOTIFICAÇÕES DO SISTEMA (notifications)
-- ============================================================================
INSERT INTO notifications (
    id, user_id, title, message, type, related_entity_id, related_entity_type,
    action_url, read, created_at, updated_at
)
VALUES 
    (
        'not00010-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'Novo Entregável Aprovado',
        'O Caderno de Cortes e Fachadas da Vinícola Terroir foi formalmente aprovado pelo cliente.',
        'SUCCESS',
        'd0000010-0001-0000-0000-000000000001',
        'DELIVERABLE',
        '/projects/b0000010-0000-0000-0000-000000000010?tab=deliverables',
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '4 hours',
        CURRENT_TIMESTAMP
    ),
    (
        'not00012-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'Item de Punch List em Andamento',
        'O ajuste do trilho de caixilho minimalista na Residência Silveira está com prazo próximo.',
        'WARNING',
        'pli00012-0001-0000-0000-000000000001',
        'INSPECTION',
        '/inspections/insp0012-0001-0000-0000-000000000001',
        FALSE,
        CURRENT_TIMESTAMP - INTERVAL '8 hours',
        CURRENT_TIMESTAMP
    ),
    (
        'not00013-0001-0000-0000-000000000001',
        'c2222222-2222-2222-2222-222222222222',
        'Resolução Crítica de Obra Concluída',
        'A válvula do ponto de gases medicinais na UTI Neonatal foi substituída e laudo emitido com sucesso.',
        'SUCCESS',
        'pli00013-0001-0000-0000-000000000001',
        'INSPECTION',
        '/inspections/insp0013-0001-0000-0000-000000000001',
        TRUE,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 14. LOGS DE AUDITORIA DO SISTEMA (audit_logs)
-- ============================================================================
INSERT INTO audit_logs (
    id, user_id, project_id, action, entity_type, entity_id, changes, ip_address, user_agent, created_at
)
VALUES 
    (
        'al000010-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000010-0000-0000-0000-000000000010',
        'CREATE',
        'PROJECT',
        'b0000010-0000-0000-0000-000000000010',
        '{"name": "Vinícola Boutique Terroir - Pavilhão de Degustação", "status": "CONSTRUCTION"}',
        '127.0.0.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ArchFlowClient/1.0',
        CURRENT_TIMESTAMP - INTERVAL '120 days'
    ),
    (
        'al000012-0001-0000-0000-000000000001',
        '07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f',
        'b0000012-0000-0000-0000-000000000012',
        'APPROVE',
        'DELIVERABLE',
        'd0000012-0001-0000-0000-000000000001',
        '{"status": "APPROVED", "approver": "07ad7cab-eed3-4cb6-98cb-40bc5f51ef8f"}',
        '127.0.0.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ArchFlowClient/1.0',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ),
    (
        'al000013-0001-0000-0000-000000000001',
        'c2222222-2222-2222-2222-222222222222',
        'b0000013-0000-0000-0000-000000000013',
        'STATUS_CHANGE',
        'PUNCH_LIST_ITEM',
        'pli00013-0001-0000-0000-000000000001',
        '{"oldStatus": "PENDING", "newStatus": "RESOLVED"}',
        '127.0.0.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ArchFlowClient/1.0',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;
