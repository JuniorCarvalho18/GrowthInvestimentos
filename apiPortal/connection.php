<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

$db_url = getenv('DATABASE_URL');

try {
    if ($db_url) {
        $db_parts = parse_url($db_url);
        
        $host = $db_parts['host'];
        $port = $db_parts['port'] ?? 5432;
        $dbname = ltrim($db_parts['path'], '/');
        $user = $db_parts['user'];
        $password = $db_parts['pass'];
        
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
        $pdo = new PDO($dsn, $user, $password);
        
    } else {
        // Fallback local MySQL (seu ambiente de desenvolvimento)
        $pdo = new PDO("mysql:host=localhost;dbname=growth;charset=utf8", "root", "");
    }
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    die(json_encode([
        'success' => false, 
        'message' => 'Erro de conexão: ' . $e->getMessage()
    ]));
}
?>