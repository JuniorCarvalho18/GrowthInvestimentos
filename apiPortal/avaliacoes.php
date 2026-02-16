<?php
// Lista de origens permitidas
$allowed_origins = [
    'http://localhost:8100',
    'https://growthinvestimentos-ted5.onrender.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:8100");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'connection.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $acao = $_GET['acao'] ?? '';
    $projeto_id = isset($_GET['projeto_id']) ? (int)$_GET['projeto_id'] : 0;
    
    if ($acao === 'listar' && $projeto_id > 0) {
        try {
            $stmt = $pdo->prepare("
                SELECT a.*, u.nome as autor_nome, u.foto as autor_foto 
                FROM projeto_avaliacoes a
                LEFT JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.projeto_id = :projeto_id
                ORDER BY a.data DESC
            ");
            $stmt->bindValue(':projeto_id', $projeto_id, PDO::PARAM_INT);
            $stmt->execute();
            $avaliacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($avaliacoes as &$avaliacao) {
                $avaliacao['id'] = (int)$avaliacao['id'];
                $avaliacao['projeto_id'] = (int)$avaliacao['projeto_id'];
                $avaliacao['usuario_id'] = (int)$avaliacao['usuario_id'];
                $avaliacao['nota'] = (int)$avaliacao['nota'];
            }
            
            echo json_encode([
                'success' => true,
                'avaliacoes' => $avaliacoes
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        }
        
    } elseif ($acao === 'media' && $projeto_id > 0) {
        try {
            $stmt = $pdo->prepare("
                SELECT AVG(nota) as media, COUNT(*) as total
                FROM projeto_avaliacoes
                WHERE projeto_id = :projeto_id
            ");
            $stmt->bindValue(':projeto_id', $projeto_id, PDO::PARAM_INT);
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'media' => $stats['media'] ? round((float)$stats['media'], 1) : 0,
                'total' => (int)$stats['total']
            ]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        }
    }
}

if ($method === 'POST') {
    $acao = $data['acao'] ?? '';
    
    if ($acao === 'criar') {
        try {
            $projeto_id = (int)$data['projeto_id'];
            $usuario_id = (int)$data['usuario_id'];
            $autor = $data['autor'];
            $nota = (int)$data['nota'];
            $comentario = $data['comentario'] ?? '';
            
            // Verifica se já existe
            $check = $pdo->prepare("SELECT id FROM projeto_avaliacoes WHERE projeto_id = :projeto_id AND usuario_id = :usuario_id");
            $check->bindValue(':projeto_id', $projeto_id, PDO::PARAM_INT);
            $check->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $check->execute();
            
            if ($check->rowCount() > 0) {
                // UPDATE
                $stmt = $pdo->prepare("
                    UPDATE projeto_avaliacoes 
                    SET autor = :autor, nota = :nota, comentario = :comentario, data = NOW()
                    WHERE projeto_id = :projeto_id AND usuario_id = :usuario_id
                ");
                $stmt->bindValue(':autor', $autor);
                $stmt->bindValue(':nota', $nota, PDO::PARAM_INT);
                $stmt->bindValue(':comentario', $comentario);
                $stmt->bindValue(':projeto_id', $projeto_id, PDO::PARAM_INT);
                $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
                $stmt->execute();
                
                echo json_encode(['success' => true, 'message' => 'Avaliação atualizada']);
            } else {
                // INSERT
                $stmt = $pdo->prepare("
                    INSERT INTO projeto_avaliacoes (projeto_id, usuario_id, autor, nota, comentario)
                    VALUES (:projeto_id, :usuario_id, :autor, :nota, :comentario)
                ");
                $stmt->bindValue(':projeto_id', $projeto_id, PDO::PARAM_INT);
                $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
                $stmt->bindValue(':autor', $autor);
                $stmt->bindValue(':nota', $nota, PDO::PARAM_INT);
                $stmt->bindValue(':comentario', $comentario);
                $stmt->execute();
                
                echo json_encode(['success' => true, 'message' => 'Avaliação criada', 'id' => $pdo->lastInsertId('projeto_avaliacoes_id_seq')]);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        }
    }

    elseif ($acao === 'deletar') {
        try {
            $id = (int)$data['id'];
            $stmt = $pdo->prepare("DELETE FROM projeto_avaliacoes WHERE id = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            echo json_encode(['success' => true, 'message' => 'Avaliação excluída']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
        }
    }
}
?>