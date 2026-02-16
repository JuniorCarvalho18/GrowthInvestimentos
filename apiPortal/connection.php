<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

$db_url = getenv('DATABASE_URL');

try {
    if ($db_url) {
        // Para o PostgreSQL no Render, a URL já vem completa (postgres://...)
        // O PDO aceita a string de conexão diretamente
        $pdo = new PDO($db_url);
    } else {
        // Fallback local caso você ainda use MySQL no seu PC
        $pdo = new PDO("mysql:host=localhost;dbname=growth;charset=utf8", "root", "");
    }
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // Retorna o erro real para sabermos se o problema é o DRIVER ou a SENHA
    die(json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]));
}
?>