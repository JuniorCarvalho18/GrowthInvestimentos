<?php
// Headers CORS - DEVE SER ANTES DE TUDO
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Resposta rápida para o teste do navegador (Preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once('connection.php');

$postjson = json_decode(file_get_contents('php://input'), true);

if (!$postjson) {
    echo json_encode(['success' => false, 'message' => 'Nenhum dado recebido']);
    exit;
}

// ✅ CRIAR (Salvar)
if ($postjson['requisicao'] == 'salvar') {
    try {
        $query = $pdo->prepare("INSERT INTO projetos (nome, descricao, meta, previsao, local, categoria, impacto_estimado, status) 
                                VALUES (:nome, :descricao, :meta, :previsao, :local, :categoria, :impacto_estimado, 'ativo')");
        $query->bindValue(':nome', $postjson['nome']);
        $query->bindValue(':descricao', $postjson['descricao']);
        $query->bindValue(':meta', $postjson['meta']);
        $query->bindValue(':previsao', $postjson['previsao']);
        $query->bindValue(':local', $postjson['local']);
        $query->bindValue(':categoria', $postjson['categoria'] ?? 'Geral');
        $query->bindValue(':impacto_estimado', $postjson['impacto_estimado'] ?? '');
        $query->execute();

        $id = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Projeto criado com sucesso!',
            'id' => $id
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar projeto: ' . $e->getMessage()]);
    }
}

// ✅ LISTAR
else if ($postjson['requisicao'] == 'listar') {
    try {
        $query = $pdo->prepare("SELECT * FROM projetos ORDER BY data_criacao DESC");
        $query->execute();
        $dados = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'projetos' => $dados
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao listar projetos: ' . $e->getMessage()]);
    }
}

// ✅ BUSCAR (por ID)
else if ($postjson['requisicao'] == 'buscar') {
    try {
        $query = $pdo->prepare("SELECT * FROM projetos WHERE id = :id");
        $query->bindValue(':id', $postjson['id']);
        $query->execute();
        $projeto = $query->fetch(PDO::FETCH_ASSOC);

        if ($projeto) {
            echo json_encode([
                'success' => true,
                'projeto' => $projeto
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Projeto não encontrado']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao buscar projeto: ' . $e->getMessage()]);
    }
}

// ✅ EDITAR
else if ($postjson['requisicao'] == 'editar') {
    try {
        $query = $pdo->prepare("UPDATE projetos SET 
                                nome = :nome, 
                                descricao = :descricao, 
                                meta = :meta, 
                                previsao = :previsao, 
                                local = :local, 
                                categoria = :categoria, 
                                impacto_estimado = :impacto_estimado,
                                status = :status
                                WHERE id = :id");
        $query->bindValue(':nome', $postjson['nome']);
        $query->bindValue(':descricao', $postjson['descricao']);
        $query->bindValue(':meta', $postjson['meta']);
        $query->bindValue(':previsao', $postjson['previsao']);
        $query->bindValue(':local', $postjson['local']);
        $query->bindValue(':categoria', $postjson['categoria'] ?? 'Geral');
        $query->bindValue(':impacto_estimado', $postjson['impacto_estimado'] ?? '');
        $query->bindValue(':status', $postjson['status'] ?? 'ativo');
        $query->bindValue(':id', $postjson['id']);
        $query->execute();

        echo json_encode([
            'success' => $query->rowCount() > 0,
            'message' => $query->rowCount() > 0 ? 'Projeto atualizado com sucesso!' : 'Nenhuma alteração feita'
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao editar projeto: ' . $e->getMessage()]);
    }
}

// ✅ DELETAR
else if ($postjson['requisicao'] == 'deletar') {
    try {
        $query = $pdo->prepare("DELETE FROM projetos WHERE id = :id");
        $query->bindValue(':id', $postjson['id']);
        $query->execute();

        if ($query->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Projeto excluído com sucesso!'
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Projeto não encontrado!']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao deletar projeto: ' . $e->getMessage()]);
    }
}

// ✅ LISTAR ATIVOS (para o app)
else if ($postjson['requisicao'] == 'listar_ativos') {
    try {
        $query = $pdo->prepare("SELECT * FROM projetos WHERE status = 'ativo' ORDER BY data_criacao DESC");
        $query->execute();
        $dados = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'projetos' => $dados
        ]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao listar projetos: ' . $e->getMessage()]);
    }
}

else {
    echo json_encode(['success' => false, 'message' => 'Requisição inválida']);
}
?>