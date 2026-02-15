CREATE DATABASE IF NOT EXISTS growth;
USE growth;

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admin(
    id INT AUTO_INCREMENT PRIMARY KEY,
    maskid INT(100) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Tabela de usuários (com campos de saldo e tokens)
CREATE TABLE IF NOT EXISTS usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    tokens DECIMAL(10,2) DEFAULT 0.00,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    meta DECIMAL(10,2) NOT NULL,
    arrecadado DECIMAL(10,2) DEFAULT 0.00,
    previsao DATE,
    local VARCHAR(255),
    imagem VARCHAR(255),
    categoria VARCHAR(50),
    status ENUM('ativo', 'concluido', 'cancelado') DEFAULT 'ativo',
    impacto_estimado VARCHAR(255),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de investimentos
CREATE TABLE IF NOT EXISTS investimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    valor_investido DECIMAL(10,2) NOT NULL,
    tokens_ganhos DECIMAL(10,2) DEFAULT 0.00,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    impacto_gerado TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
);

-- Tabela de tokens
CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    investimento_id INT,
    quantidade DECIMAL(10,2) NOT NULL,
    tipo ENUM('ganho', 'gasto', 'bonus') DEFAULT 'ganho',
    descricao VARCHAR(255),
    data_ganho DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (investimento_id) REFERENCES investimentos(id) ON DELETE SET NULL
);

-- Tabela de marketplace
CREATE TABLE IF NOT EXISTS marketplace (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_item VARCHAR(100) NOT NULL,
    descricao TEXT,
    tokens_necessarios DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    imagem VARCHAR(255),
    disponibilidade BOOLEAN DEFAULT TRUE,
    quantidade_disponivel INT DEFAULT 0
);

-- Tabela de resgates
CREATE TABLE IF NOT EXISTS resgates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    item_id INT NOT NULL,
    tokens_gastos DECIMAL(10,2) NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovado', 'enviado', 'concluido') DEFAULT 'pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES marketplace(id) ON DELETE CASCADE
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50), 
    titulo VARCHAR(100),
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    categoria VARCHAR(50),
    imagem VARCHAR(255),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_curtidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY (post_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS post_comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    usuario_id INT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projeto_avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    projeto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_projeto_usuario (projeto_id, usuario_id)
);

-- Inserir alguns dados de exemplo (OPCIONAL)
INSERT INTO projetos (nome, descricao, meta, previsao, local, categoria, impacto_estimado) VALUES
('Fazenda Solar Comunitária', 'Instalação de painéis solares para comunidade local', 50000.00, '2025-12-31', 'São Paulo, SP', 'Energia Renovável', 'Redução de 50 toneladas de CO2/ano'),
('Reflorestamento Amazônia', 'Plantio de 10.000 árvores na região amazônica', 35000.00, '2025-10-15', 'Amazonas, AM', 'Reflorestamento', 'Plantio de 10.000 árvores nativas'),
('Reciclagem Comunitária', 'Centro de reciclagem para bairro periférico', 25000.00, '2025-08-30', 'Rio de Janeiro, RJ', 'Reciclagem', 'Processamento de 5 toneladas de resíduos/mês');

INSERT INTO marketplace (nome_item, descricao, tokens_necessarios, categoria, disponibilidade, quantidade_disponivel) VALUES
('Curso de Energia Solar', 'Curso completo sobre instalação de painéis solares', 100.00, 'Educação', TRUE, 50),
('Kit de Compostagem', 'Kit completo para compostagem doméstica', 200.00, 'Equipamentos', TRUE, 30),
('Desconto em Produtos Sustentáveis', '20% de desconto em produtos ecológicos', 50.00, 'Descontos', TRUE, 100);

INSERT INTO projeto_avaliacoes (projeto_id, usuario_id, autor, nota, comentario) VALUES
-- Projeto 1
(1, 1, 'João Silva', 5, 'Excelente projeto! Resultados acima do esperado.'),
(1, 2, 'Maria Santos', 4, 'Muito bom, recomendo. Gestão transparente.'),
(1, 3, 'Carlos Oliveira', 5, 'Impacto real na comunidade!'),

-- Projeto 2
(2, 1, 'Ana Paula', 4, 'Ótima iniciativa sustentável!'),
(2, 4, 'Pedro Costa', 5, 'Transformou nossa região!'),

-- Projeto 3
(3, 2, 'Lucas Mendes', 5, 'Impacto ambiental visível!'),
(3, 5, 'Fernanda Lima', 4, 'Projeto bem estruturado.');