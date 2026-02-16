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

include_once('connection.php');

$postjson = json_decode(file_get_contents('php://input'), true);

if (!$postjson) {
    echo json_encode(['success' => false, 'message' => 'Nenhum dado recebido']);
    exit;
}

// ✅ CRIAR (Salvar) - COM SENHA SEGURA
if ($postjson['requisicao'] == 'salvar') {
    // BCRYPT é MUITO mais seguro que MD5
    $senha_hash = password_hash($postjson['senha'], PASSWORD_BCRYPT);
    
    $query = $pdo->prepare("INSERT INTO usuarios (senha, nome, email, cnpj) 
                            VALUES (:senha, :nome, :email, :cnpj)");
    $query->bindValue(':senha', $senha_hash);
    $query->bindValue(':nome', $postjson['nome']);
    $query->bindValue(':email', $postjson['email']);
    $query->bindValue(':cnpj', $postjson['cnpj']);
    $query->execute();

    $id = $pdo->lastInsertId('usuarios_id_seq');
    echo json_encode(['success' => $query->rowCount() > 0, 'id' => $id]);
}

// ✅ LOGIN - AGORA SUPORTA ADMIN
else if ($postjson['requisicao'] == 'login') {
    $loginInput = $postjson['emailCnpj'];
    $senhaInput = $postjson['senha'];

    // 1. TENTA COMO USUÁRIO COMUM (Email ou CNPJ)
    $query = $pdo->prepare("SELECT * FROM usuarios WHERE (email = :login OR cnpj = :login)");
    $query->bindValue(':login', $loginInput);
    $query->execute();
    $usuario = $query->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($senhaInput, $usuario['senha'])) {
        unset($usuario['senha']);
        $usuario['isAdmin'] = false; // Marca como usuário comum
        
        echo json_encode([
            'success' => true,
            'message' => 'Login realizado!',
            'user' => $usuario
        ]);
        exit;
    }

    // 2. SE FALHAR, TENTA COMO ADMIN (Nome de Usuário)
    $queryAdmin = $pdo->prepare("SELECT * FROM admins WHERE usuario = :login");
    $queryAdmin->bindValue(':login', $loginInput);
    $queryAdmin->execute();
    $admin = $queryAdmin->fetch(PDO::FETCH_ASSOC);

    if ($admin && password_verify($senhaInput, $admin['senha'])) {
        unset($admin['senha']);
        
        // Prepara objeto de retorno compatível com o User do frontend
        $adminUser = [
            'id' => $admin['id'],
            'nome' => 'Administrador',
            'email' => 'admin@sistema', // Placeholder
            'cnpj' => '',
            'isAdmin' => true // 🚨 A MÁGICA ACONTECE AQUI
        ];

        echo json_encode([
            'success' => true,
            'message' => 'Login de Administrador!',
            'user' => $adminUser
        ]);
        exit;
    }

    // 3. SE FALHAR OS DOIS
    echo json_encode([
        'success' => false,
        'message' => 'Dados incorretos!'
    ]);
}

// ✅ LISTAR
else if ($postjson['requisicao'] == 'listar') {
    $query = $pdo->prepare("SELECT id, nome, email, cnpj FROM usuarios ORDER BY id DESC");
    $query->execute();
    $dados = $query->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'usuarios' => $dados]);
}

// ✅ EDITAR (sem alterar senha)
else if ($postjson['requisicao'] == 'editar') {
    $query = $pdo->prepare("UPDATE usuarios SET nome = :nome, email = :email, cnpj = :cnpj, foto = :foto WHERE id = :id");
    $query->bindValue(':nome', $postjson['nome']);
    $query->bindValue(':email', $postjson['email']);
    $query->bindValue(':cnpj', $postjson['cnpj']);
    $query->bindValue(':foto', $postjson['foto'] ?? '');
    $query->bindValue(':id', $postjson['id']);
    $query->execute();

    echo json_encode(['success' => $query->rowCount() > 0]);
}

// ✅ ALTERAR SENHA (nova funcionalidade)
else if ($postjson['requisicao'] == 'alterar_senha') {
    try {
        // Busca o usuário para verificar a senha atual
        $query = $pdo->prepare("SELECT senha FROM usuarios WHERE id = :id");
        $query->bindValue(':id', $postjson['id']);
        $query->execute();
        $usuario = $query->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
            exit;
        }

        // Verifica se a senha atual está correta
        if (!password_verify($postjson['senha_atual'], $usuario['senha'])) {
            echo json_encode(['success' => false, 'message' => 'Senha atual incorreta!']);
            exit;
        }

        // Hash da nova senha
        $nova_senha_hash = password_hash($postjson['nova_senha'], PASSWORD_BCRYPT);

        // Atualiza a senha
        $query = $pdo->prepare("UPDATE usuarios SET senha = :senha WHERE id = :id");
        $query->bindValue(':senha', $nova_senha_hash);
        $query->bindValue(':id', $postjson['id']);
        $query->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Senha alterada com sucesso!'
        ]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
    }
}

// ✅ DELETAR
else if ($postjson['requisicao'] == 'deletar') {
    try {
        $query = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");
        $query->bindValue(':id', $postjson['id']);
        $query->execute();

        if ($query->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Usuário excluído com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado!']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro no servidor: ' . $e->getMessage()]);
    }
}

// ✅ BUSCAR PERFIL
else if ($postjson['requisicao'] == 'perfil') {
    $query = $pdo->prepare("SELECT id, nome, email, cnpj, saldo, tokens, foto FROM usuarios WHERE id = :id");
    $query->bindValue(':id', $postjson['id']);
    $query->execute();
    
    $usuario = $query->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario) {
        echo json_encode(['success' => true, 'user' => $usuario]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
    }
}

?>