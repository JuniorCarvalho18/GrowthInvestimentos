<?php
// apiPortal/connection.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Pega variáveis do Render (Internal Database URL)
$db_url = getenv('DATABASE_URL');

try {
    if ($db_url) {
        // Conexão no Render (Postgres)
        $pdo = new PDO($db_url);
    } else {
        // Fallback Local (XAMPP/MySQL) - Caso queira testar local ainda
        $pdo = new PDO("mysql:host=localhost;dbname=growth;charset=utf8", "root", "");
    }
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $e->getMessage()]));
}
?>