# 🌱 Growth Investimentos

> Plataforma de investimentos em projetos sustentáveis com sistema de gamificação por tokens

[![Ionic](https://img.shields.io/badge/Ionic-7.0-3880FF?logo=ionic)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-15.0-DD0031?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PHP](https://img.shields.io/badge/PHP-8.0-777BB4?logo=php)](https://www.php.net/)

## 📋 Sobre o Projeto

Growth Investimentos é uma plataforma mobile desenvolvida com **Ionic + Angular** que conecta investidores a projetos de impacto ambiental. O projeto foi iniciado como trabalho acadêmico na faculdade e evoluído para incluir boas práticas de desenvolvimento e arquitetura de software.

### 🎯 Funcionalidades Principais

- 🔐 **Autenticação Segura**: Login e cadastro com criptografia hash (BCrypt).
- 👥 **Gestão de Usuários**: Perfil editável com foto e alteração de senha.
- 📁 **Projetos Sustentáveis**: Visualização, investimento e acompanhamento de projetos.
- 💬 **Interação Social**: Sistema de posts, comentários e avaliações de projetos.
- ⚙️ **Painel Admin (Dev)**:
  - CRUD de Usuários
  - CRUD de Projetos
  - Gerenciamento de Posts, Comentários e Avaliações
- 💰 **Investimentos**: Simulação de aporte em projetos.
- 🔔 **Notificações**: Sistema de alertas para o usuário.

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Ionic Framework 7** - Framework híbrido para apps mobile
- **Angular 15** - Framework TypeScript
- **TypeScript** - Superset JavaScript com tipagem
- **SCSS** - Pré-processador CSS
- **Capacitor** - Runtime nativo para apps

### Backend
- **PHP 8.0** - Linguagem de servidor
- **MySQL** - Banco de dados relacional
- **PDO** - Camada de abstração de dados
- **BCrypt** - Hash de senhas

## 📦 Estrutura do Projeto

```
Growth/
├── src/
│   ├── app/
│   │   ├── guards/           # Guards de roteamento
│   │   │   └── auth.guard.ts
│   │   ├── services/         # Serviços da aplicação
│   │   │   ├── auth.service.ts
│   │   │   └── utils.service.ts
│   │   ├── home/            # Página inicial
│   │   ├── cadastro/        # Cadastro de usuários
│   │   ├── profile/         # Perfil do usuário
│   │   ├── marketplace/     # Marketplace de recompensas
│   │   └── ...
│   ├── assets/              # Recursos estáticos
│   ├── theme/               # Temas e variáveis CSS
│   └── global.scss          # Estilos globais
├── apiPortal/                # Backend PHP
│   ├── connection.php        # Conexão PDO
│   ├── crud1.php             # Autenticação e Usuários
│   ├── posts.php             # Lógica de Feed e Comentários
│   ├── projetos.php          # CRUD de Projetos
│   └── avaliacoes.php        # Sistema de notas
└── growthDB.sql              # Estrutura do Banco de Dados
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- PHP 8.0+
- MySQL/MariaDB
- Ionic CLI (`npm install -g @ionic/cli`)

### Passo a Passo

#### 1. Clone o repositório no htdocs do XAMPP

```bash
git clone https://github.com/seu-usuario/growth-investimentos.git
cd growth-investimentos
```

#### 2. Configure o banco de dados

```bash
# Importe o arquivo SQL
mysql -u root -p < growthDB.sql
```

#### 3. Configure a API

Edite `apiPortal/connection.php`:
```php
$banco = 'growth';
$host = 'localhost';
$usuario = 'root';
$senha = ''; // Sua senha do MySQL
```

#### 4. Ajuste as URLs da API

Edite `Growth/src/environments/environment.ts`:

```typescript
  export const environment = {
    production: false,
    // Ajuste o caminho conforme sua pasta no htdocs
    apiUrl: 'http://localhost/GrowthInvestimentos/apiPortal/' 
  };
```

#### 5. Instale as dependências

```bash
cd GrowthInvestimentos/Growth
npm install
```

#### 6. Execute o projeto

```bash
# Modo desenvolvimento (navegador)
ionic serve

# Ou abra em http://localhost:8100
```

#### 7. Teste a API

Abra no navegador:
```
http://localhost/GrowthInvestimentos/apiPortal/crud1.php
```

## 🗂️ Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login de Usuário ou Admin
- [x] Login com email/CNPJ
- [x] Cadastro de novos usuários
- [x] Autenticação persistente (localStorage)
- [x] Guards para rotas protegidas
- [x] Hash de senha com BCrypt
- [x] Logout

### ✅ Perfil de Usuário
- [x] Upload de foto de perfil
- [x] Visualização de dados pessoais
- [x] Edição de nome, email, CNPJ
- [x] Alteração de senha
- [x] Visualização de saldo e tokens

### ✅ Painel Administrativo (Admin)
- [x] **Gestão de Usuários**: CRUD completo (listagem, criação, edição, exclusão), validação de dados e feedback visual.
- [x] **Gestão de Projetos**: CRUD completo, categorização, controle de status (ativo/concluído), cálculo de progresso e registro de impacto.
- [x] **Gerenciar Posts**: Interface para criar, editar e excluir postagens da comunidade.
- [x] **Gerenciar Comentários**: Moderação de comentários (filtro por post e exclusão).
- [x] **Gerenciar Avaliações**: Edição e moderação de notas e feedbacks de projetos.
- [x] **Área Dev**: Dashboard central com acesso restrito a administradores.

### ✅ Interface do Usuário
- [x] Página inicial (Home)
- [x] Marketplace (UI)
- [x] Sistema de notificações (UI)
- [x] Histórico (UI)
- [x] Saldo (UI)
- [x] Configurações de Perfil (UI)

### ✅ Social
- [x] Feed de postagems
- [x] Sistema de likes
- [x] Sistema de comentários

## 🎨 Design e UX

- **Paleta de cores**: Verde escuro (#0B3D2E) e dourado (#A88F5F)
- **Tema**: Dark mode com elementos sustentáveis
- **Ícones**: Ionicons
- **Responsividade**: Design adaptativo para mobile

## 📊 Banco de Dados

### Principais Tabelas

- `admins` - Registro de desenvolvedores
- `usuarios` - Dados dos investidores
- `projetos` - Projetos sustentáveis
- `posts` - Postagens dos usuários
- `investimentos` - Relação usuário-projeto
- `tokens` - Sistema de pontuação
- `marketplace` - Itens para resgate
- `resgates` - Histórico de resgates
- `notificacoes` - Sistema de notificações

## 🔒 Segurança

- ✅ Senhas com hash BCrypt
- ✅ Prepared statements (PDO) contra SQL Injection
- ✅ Validação de inputs no frontend e backend
- ✅ CORS configurado para localhost:8100
- ✅ Guards para rotas administrativas
- ⚠️ CORS deve ser ajustado para produção

## 🎯 Roadmap Futuro

- [ ] Sistema completo de investimentos
- [ ] Cálculo automático de tokens
- [ ] Histórico detalhado funcional
- [ ] Notificações push
- [ ] API REST documentada (Swagger)
- [ ] Testes unitários e E2E
- [ ] App nativo (Android/iOS)

## 🐛 Troubleshooting

### Erro: "CORS policy"
```
Solução: Verifique se XAMPP está rodando e se a URL está correta
```

### Erro: "Connection refused"
```
Solução: Inicie Apache no XAMPP
```

### Erro: "Database connection failed"
```
Solução: 
1. Verifique se MySQL está ativo
2. Confirme credenciais em connection.php
3. Importe growthDB.sql
```

### Erro: "404 Not Found" na API
```
Solução: Ajuste o nome da pasta nas URLs dos serviços TypeScript
```

## 📝 Scripts Úteis

```bash
# Iniciar servidor de desenvolvimento
ionic serve

# Build para produção
ionic build --prod

# Adicionar plataforma Android
ionic capacitor add android

# Sincronizar com Capacitor
ionic capacitor sync

# Abrir no Android Studio
ionic capacitor open android

# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 👨‍💻 Desenvolvimento

### Padrões de Código

- **Services**: Lógica de negócio e chamadas à API
- **Components**: Componentes reutilizáveis
- **Pages**: Páginas da aplicação
- **Guards**: Proteção de rotas
- **Interfaces**: Tipagem TypeScript

### Boas Práticas Implementadas

- ✅ Separação de responsabilidades
- ✅ Injeção de dependências
- ✅ Observables do RxJS
- ✅ Tipagem forte com TypeScript
- ✅ Validação de formulários
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Feedback ao usuário (toasts e alerts)
- ✅ Componentização
- ✅ SCSS modular

## 👤 Autor

**Junior Carvalho**

## 🙏 Agradecimentos

- Desenvolvido como projeto da disciplina de Desenvolvimento Mobile
- Inspirado em plataformas de crowdfunding sustentável
- Comunidade Ionic Brasil
- Professores e colegas da faculdade

## 📄 Licença

Este projeto é para fins educacionais.

---
