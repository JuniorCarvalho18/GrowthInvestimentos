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