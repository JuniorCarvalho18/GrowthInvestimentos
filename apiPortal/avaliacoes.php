<?php
// Lista de origens permitidas
$allowed_origins = [
    'http://localhost:8100',
    'https://growthinvestimentos-ted5.onrender.com'
];

// Pega a origem da requisição
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Se a origem estiver na lista, permite
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:8100"); // Fallback
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
            SELECT a.*, u.nome as autor_nome, u.foto as autor_foto 
            FROM projeto_avaliacoes a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.projeto_id = ?
            ORDER BY a.data DESC
        ");
        $stmt->bind_param("i", $projeto_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $avaliacoes = $result->fetch_all(MYSQLI_ASSOC);
        
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
            SELECT AVG(nota) as media, COUNT(*) as total
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
        
        // Verifica se já existe para decidir entre INSERT e UPDATE
        $check = $conn->prepare("SELECT id FROM projeto_avaliacoes WHERE projeto_id = ? AND usuario_id = ?");
        $check->bind_param("ii", $projeto_id, $usuario_id);
        $check->execute();
        $resultado = $check->get_result();
        
        if ($resultado->num_rows > 0) {
            // ATUALIZADO: Agora permite editar o Autor também
            $stmt = $conn->prepare("
                UPDATE projeto_avaliacoes 
                SET autor = ?, nota = ?, comentario = ?, data = NOW()
                WHERE projeto_id = ? AND usuario_id = ?
            ");
            $stmt->bind_param("sisii", $autor, $nota, $comentario, $projeto_id, $usuario_id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Avaliação atualizada']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar']);
            }
        } else {
            $stmt = $conn->prepare("
                INSERT INTO projeto_avaliacoes (projeto_id, usuario_id, autor, nota, comentario)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("iisis", $projeto_id, $usuario_id, $autor, $nota, $comentario);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Avaliação criada', 'id' => $conn->insert_id]);
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
            echo json_encode(['success' => true, 'message' => 'Avaliação excluída']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir']);
        }
    }
}

$conn->close();
?>