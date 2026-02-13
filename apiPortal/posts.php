<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Content-Type: application/json; charset=utf-8");

include_once('connection.php');
$postjson = json_decode(file_get_contents('php://input'), true);

if ($postjson['requisicao'] == 'listar') {
    $query = $pdo->prepare("SELECT * FROM posts ORDER BY data_criacao DESC");
    $query->execute();
    $posts = $query->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'posts' => $posts]);
}

// Adicionar: criar, editar, deletar, curtir, comentar
?>