<?php
// Headers CORS
header("Access-Control-Allow-Origin: http://localhost:8100");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Preflight
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

// ✅ LISTAR POSTS
if ($postjson['requisicao'] == 'listar') {
    try {
        $query = $pdo->prepare("SELECT p.*, 
                                (SELECT COUNT(*) FROM post_curtidas WHERE post_id = p.id) as curtidas,
                                (SELECT COUNT(*) FROM post_comentarios WHERE post_id = p.id) as comentarios
                                FROM posts p 
                                ORDER BY p.data_criacao DESC");
        $query->execute();
        $posts = $query->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'posts' => $posts]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao listar: ' . $e->getMessage()]);
    }
}

// ✅ CRIAR POST
else if ($postjson['requisicao'] == 'criar') {
    try {
        $query = $pdo->prepare("INSERT INTO posts (usuario_id, autor, texto, categoria, imagem) 
                                VALUES (:usuario_id, :autor, :texto, :categoria, :imagem)");
        $query->bindValue(':usuario_id', $postjson['usuario_id']);
        $query->bindValue(':autor', $postjson['autor']);
        $query->bindValue(':texto', $postjson['texto']);
        $query->bindValue(':categoria', $postjson['categoria']);
        $query->bindValue(':imagem', $postjson['imagem'] ?? '');
        $query->execute();

        $id = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Post criado!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar: ' . $e->getMessage()]);
    }
}

// ✅ EDITAR POST
else if ($postjson['requisicao'] == 'editar') {
    try {
        $query = $pdo->prepare("UPDATE posts SET texto = :texto, categoria = :categoria, imagem = :imagem 
                                WHERE id = :id AND usuario_id = :usuario_id");
        $query->bindValue(':texto', $postjson['texto']);
        $query->bindValue(':categoria', $postjson['categoria']);
        $query->bindValue(':imagem', $postjson['imagem'] ?? '');
        $query->bindValue(':id', $postjson['id']);
        $query->bindValue(':usuario_id', $postjson['usuario_id']);
        $query->execute();

        echo json_encode(['success' => $query->rowCount() > 0, 'message' => 'Post atualizado!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao editar: ' . $e->getMessage()]);
    }
}

// ✅ DELETAR POST
else if ($postjson['requisicao'] == 'deletar') {
    try {
        $query = $pdo->prepare("DELETE FROM posts WHERE id = :id AND usuario_id = :usuario_id");
        $query->bindValue(':id', $postjson['id']);
        $query->bindValue(':usuario_id', $postjson['usuario_id']);
        $query->execute();

        echo json_encode(['success' => $query->rowCount() > 0, 'message' => 'Post deletado!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao deletar: ' . $e->getMessage()]);
    }
}

// ✅ CURTIR/DESCURTIR POST
else if ($postjson['requisicao'] == 'curtir') {
    try {
        // Verifica se já curtiu
        $check = $pdo->prepare("SELECT id FROM post_curtidas WHERE post_id = :post_id AND usuario_id = :usuario_id");
        $check->bindValue(':post_id', $postjson['post_id']);
        $check->bindValue(':usuario_id', $postjson['usuario_id']);
        $check->execute();

        if ($check->rowCount() > 0) {
            // Descurtir
            $query = $pdo->prepare("DELETE FROM post_curtidas WHERE post_id = :post_id AND usuario_id = :usuario_id");
            $query->bindValue(':post_id', $postjson['post_id']);
            $query->bindValue(':usuario_id', $postjson['usuario_id']);
            $query->execute();
            
            echo json_encode(['success' => true, 'curtido' => false, 'message' => 'Curtida removida']);
        } else {
            // Curtir
            $query = $pdo->prepare("INSERT INTO post_curtidas (post_id, usuario_id) VALUES (:post_id, :usuario_id)");
            $query->bindValue(':post_id', $postjson['post_id']);
            $query->bindValue(':usuario_id', $postjson['usuario_id']);
            $query->execute();
            
            echo json_encode(['success' => true, 'curtido' => true, 'message' => 'Post curtido']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao curtir: ' . $e->getMessage()]);
    }
}

// ✅ ADICIONAR COMENTÁRIO
else if ($postjson['requisicao'] == 'comentar') {
    try {
        $query = $pdo->prepare("INSERT INTO post_comentarios (post_id, usuario_id, autor, texto) 
                                VALUES (:post_id, :usuario_id, :autor, :texto)");
        $query->bindValue(':post_id', $postjson['post_id']);
        $query->bindValue(':usuario_id', $postjson['usuario_id']);
        $query->bindValue(':autor', $postjson['autor']);
        $query->bindValue(':texto', $postjson['texto']);
        $query->execute();

        $id = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Comentário adicionado!']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao comentar: ' . $e->getMessage()]);
    }
}

// ✅ LISTAR COMENTÁRIOS DE UM POST
else if ($postjson['requisicao'] == 'listar_comentarios') {
    try {
        $query = $pdo->prepare("SELECT * FROM post_comentarios WHERE post_id = :post_id ORDER BY data ASC");
        $query->bindValue(':post_id', $postjson['post_id']);
        $query->execute();
        $comentarios = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'comentarios' => $comentarios]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao listar comentários: ' . $e->getMessage()]);
    }
}

// ✅ DELETAR COMENTÁRIO
else if ($postjson['requisicao'] == 'deletar_comentario') {
    try {
        $query = $pdo->prepare("DELETE FROM post_comentarios WHERE id = :id");
        $query->bindValue(':id', $postjson['id']);
        $query->execute();

        echo json_encode([
            'success' => $query->rowCount() > 0, 
            'message' => 'Comentário deletado!'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao deletar comentário: ' . $e->getMessage()
        ]);
    }
}

else {
    echo json_encode(['success' => false, 'message' => 'Requisição inválida']);
}
?>