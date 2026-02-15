<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include_once 'connection.php';

$conn = new mysqli('localhost', 'root', '', 'growth');

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    $acao = $_GET['acao'] ?? '';
    $projeto_id = isset($_GET['projeto_id']) ? (int)$_GET['projeto_id'] : 0;
    
    if ($acao === 'listar' && $projeto_id > 0) {
        $stmt = $conn->prepare("
            SELECT a.*, u.nome as autor_nome
            FROM projeto_avaliacoes a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.projeto_id = ?
            ORDER BY a.data DESC
        ");
        $stmt->bind_param("i", $projeto_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $avaliacoes = $result->fetch_all(MYSQLI_ASSOC);
        
        // CORREÇÃO: Converter strings numéricas para tipos reais (int/float)
        // Isso resolve o bug de comparação estrita (===) no JavaScript
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
        
    } elseif ($acao === 'media' && $projeto_id > 0) {
        $stmt = $conn->prepare("
            SELECT 
                AVG(nota) as media,
                COUNT(*) as total
            FROM projeto_avaliacoes
            WHERE projeto_id = ?
        ");
        $stmt->bind_param("i", $projeto_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'media' => $stats['media'] ? round((float)$stats['media'], 1) : 0,
            'total' => (int)$stats['total']
        ]);
    }
}

if ($method === 'POST') {
    $acao = $data['acao'] ?? '';
    
    if ($acao === 'criar') {
        $projeto_id = (int)$data['projeto_id'];
        $usuario_id = (int)$data['usuario_id'];
        $autor = $data['autor'];
        $nota = (int)$data['nota'];
        $comentario = $data['comentario'] ?? '';
        
        $check = $conn->prepare("
            SELECT id FROM projeto_avaliacoes 
            WHERE projeto_id = ? AND usuario_id = ?
        ");
        $check->bind_param("ii", $projeto_id, $usuario_id);
        $check->execute();
        $resultado = $check->get_result();
        
        if ($resultado->num_rows > 0) {
            $stmt = $conn->prepare("
                UPDATE projeto_avaliacoes 
                SET nota = ?, comentario = ?, data = NOW()
                WHERE projeto_id = ? AND usuario_id = ?
            ");
            $stmt->bind_param("isii", $nota, $comentario, $projeto_id, $usuario_id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Avaliação atualizada com sucesso'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar']);
            }
        } else {
            $stmt = $conn->prepare("
                INSERT INTO projeto_avaliacoes 
                (projeto_id, usuario_id, autor, nota, comentario)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("iisis", $projeto_id, $usuario_id, $autor, $nota, $comentario);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Avaliação criada com sucesso',
                    'id' => $conn->insert_id
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao criar']);
            }
        }
    }

    elseif ($acao === 'deletar') {
        $id = (int)$data['id'];
        
        $stmt = $conn->prepare("DELETE FROM projeto_avaliacoes WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Avaliação excluída com sucesso'
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Erro ao excluir'
            ]);
        }
    }
}

$conn->close();
?>