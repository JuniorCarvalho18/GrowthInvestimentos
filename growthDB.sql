-- ============================================
-- GROWTH INVESTIMENTOS - SQL SIMPLIFICADO
-- (SEM PROCEDURES - Para evitar erro 1558)
-- ============================================

DROP DATABASE IF EXISTS growth;
CREATE DATABASE growth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE growth;

-- ============================================
-- TABELAS
-- ============================================

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- Insere o admin padrão (Senha 123456 já criptografada com BCRYPT)
INSERT INTO admins (usuario, senha) VALUES 
('admin', '$2y$10$YHtTDQEjxSIr.UCLmj/JD.VN7UD4hMBOtJNzfdjxW3s1TmcMyaOYK');

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    foto LONGTEXT,
    senha VARCHAR(255) NOT NULL,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    tokens DECIMAL(10,2) DEFAULT 0.00,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cnpj (cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    meta DECIMAL(10,2) NOT NULL,
    arrecadado DECIMAL(10,2) DEFAULT 0.00,
    previsao DATE,
    local VARCHAR(255),
    imagem TEXT,
    categoria VARCHAR(50) DEFAULT 'Geral',
    status ENUM('ativo', 'concluido', 'cancelado') DEFAULT 'ativo',
    impacto_estimado TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE investimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    valor_investido DECIMAL(10,2) NOT NULL,
    tokens_ganhos DECIMAL(10,2) DEFAULT 0.00,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    impacto_gerado TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_projeto (projeto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    investimento_id INT,
    quantidade DECIMAL(10,2) NOT NULL,
    tipo ENUM('ganho', 'gasto', 'bonus') DEFAULT 'ganho',
    descricao VARCHAR(255),
    data_ganho DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (investimento_id) REFERENCES investimentos(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE marketplace (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_item VARCHAR(100) NOT NULL,
    descricao TEXT,
    tokens_necessarios DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    imagem TEXT,
    disponibilidade BOOLEAN DEFAULT TRUE,
    quantidade_disponivel INT DEFAULT 0,
    INDEX idx_disponibilidade (disponibilidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resgates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    item_id INT NOT NULL,
    tokens_gastos DECIMAL(10,2) NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovado', 'enviado', 'concluido') DEFAULT 'pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES marketplace(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50),
    titulo VARCHAR(100),
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_lida (lida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    categoria VARCHAR(50),
    imagem TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_data (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_curtidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_curtida (post_id, usuario_id),
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE post_comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    usuario_id INT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE projeto_avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projeto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    nota INT NOT NULL,
    comentario TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_avaliacao (projeto_id, usuario_id),
    INDEX idx_projeto (projeto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Usuários (senha: senha123)
INSERT INTO usuarios (nome, email, cnpj, senha, saldo, tokens) VALUES
('João Silva', 'joao@growth.com', '12.345.678/0001-90', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1000.00, 50.00),
('Maria Santos', 'maria@growth.com', '98.765.432/0001-10', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 750.00, 30.00),
('Carlos Oliveira', 'carlos@growth.com', '11.222.333/0001-44', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 500.00, 20.00),
('Ana Paula', 'ana@growth.com', '22.333.444/0001-55', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1500.00, 80.00),
('Pedro Costa', 'pedro@growth.com', '33.444.555/0001-66', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2000.00, 100.00);

-- Projetos
INSERT INTO projetos (nome, descricao, meta, arrecadado, previsao, local, categoria, impacto_estimado, status) VALUES
('Fazenda Solar Comunitária', 'Instalação de painéis solares para geração de energia limpa em comunidade local.', 50000.00, 12500.00, '2025-12-31', 'São Paulo, SP', 'Energia Renovável', 'Redução de 50 toneladas de CO2/ano', 'ativo'),
('Reflorestamento Amazônia', 'Projeto de plantio de 10.000 árvores nativas na região amazônica.', 35000.00, 8750.00, '2025-10-15', 'Amazonas, AM', 'Reflorestamento', 'Plantio de 10.000 árvores nativas', 'ativo'),
('Reciclagem Comunitária', 'Implementação de centro de reciclagem em bairro periférico.', 25000.00, 18750.00, '2025-08-30', 'Rio de Janeiro, RJ', 'Reciclagem', 'Processamento de 5 toneladas/mês', 'ativo'),
('Tratamento de Água', 'Sistema de filtração e purificação de água para comunidade.', 40000.00, 5000.00, '2025-11-20', 'Minas Gerais, MG', 'Tratamento de Água', 'Água limpa para 500 famílias', 'ativo'),
('Horta Urbana Coletiva', 'Criação de horta comunitária em área urbana.', 15000.00, 12000.00, '2025-07-15', 'Curitiba, PR', 'Agricultura Sustentável', 'Produção de 2 toneladas/mês', 'ativo');

-- Marketplace
INSERT INTO marketplace (nome_item, descricao, tokens_necessarios, categoria, disponibilidade, quantidade_disponivel) VALUES
('Curso de Energia Solar', 'Curso online completo sobre instalação de painéis solares.', 100.00, 'Educação', TRUE, 50),
('Kit de Compostagem', 'Kit completo para compostagem doméstica.', 200.00, 'Equipamentos', TRUE, 30),
('Desconto 20% em Produtos Eco', 'Voucher de 20% de desconto em produtos sustentáveis.', 50.00, 'Descontos', TRUE, 100),
('Consultoria Ambiental', '2 horas de consultoria especializada.', 300.00, 'Serviços', TRUE, 20),
('Plano VIP Marketplace', 'Acesso premium ao marketplace por 6 meses.', 500.00, 'Premium', TRUE, 10);

-- Avaliações
INSERT INTO projeto_avaliacoes (projeto_id, usuario_id, autor, nota, comentario) VALUES
(1, 1, 'João Silva', 5, 'Excelente projeto! Os resultados superaram as expectativas.'),
(1, 2, 'Maria Santos', 4, 'Muito bom! Recomendo. Gestão profissional.'),
(1, 3, 'Carlos Oliveira', 5, 'Impacto ambiental visível na comunidade!'),
(2, 1, 'João Silva', 4, 'Ótima iniciativa de reflorestamento!'),
(2, 4, 'Ana Paula', 5, 'Transformou a região completamente!'),
(3, 2, 'Maria Santos', 5, 'Impacto social e ambiental impressionante!'),
(3, 5, 'Pedro Costa', 4, 'Projeto bem estruturado com resultados concretos.'),
(4, 3, 'Carlos Oliveira', 5, 'Água limpa para quem mais precisa!'),
(4, 4, 'Ana Paula', 4, 'Excelente impacto social na comunidade.'),
(5, 1, 'João Silva', 5, 'Produtos frescos e orgânicos de qualidade!'),
(5, 2, 'Maria Santos', 5, 'Projeto inspirador e educativo!');

-- Posts
INSERT INTO posts (usuario_id, autor, texto, categoria) VALUES
(1, 'João Silva', 'Acabei de investir no projeto de Fazenda Solar! Muito animado com o impacto. 🌞', 'Projetos Sustentáveis'),
(2, 'Maria Santos', 'Resgatei meu primeiro prêmio no marketplace! ⚡', 'Comunidade Prêmios'),
(3, 'Carlos Oliveira', 'Projeto de Reciclagem está surpreendente! 🔄', 'Investimentos'),
(4, 'Ana Paula', 'Conquistei 100 tokens este mês! 🌱', 'Comunidade Prêmios'),
(5, 'Pedro Costa', 'Já plantamos mais de 5.000 árvores! 🌳', 'Projetos Sustentáveis');

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SHOW TABLES;

SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL SELECT 'projetos', COUNT(*) FROM projetos
UNION ALL SELECT 'projeto_avaliacoes', COUNT(*) FROM projeto_avaliacoes
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'marketplace', COUNT(*) FROM marketplace;