<?php
//dados do banco no servidor local
$banco = 'growth';
$host = 'localhost';
$usuario = 'root';
$senha = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$banco;charset=utf8", $usuario, $senha); // Adicionei charset=utf8 aqui também
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Retorna erro em JSON para o Angular não quebrar com texto puro
    echo json_encode(['success' => false, 'message' => 'Erro conexão banco: ' . $e->getMessage()]);
    exit;
}
?>