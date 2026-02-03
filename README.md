# 🌱 Growth Investimentos

> Plataforma de investimentos em projetos sustentáveis com sistema de gamificação por tokens

[![Ionic](https://img.shields.io/badge/Ionic-7.0-3880FF?logo=ionic)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-15.0-DD0031?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PHP](https://img.shields.io/badge/PHP-8.0-777BB4?logo=php)](https://www.php.net/)

## 📋 Sobre o Projeto

Growth Investimentos é uma plataforma mobile desenvolvida com **Ionic + Angular** que conecta investidores a projetos de impacto ambiental. O projeto foi iniciado como trabalho acadêmico na faculdade e evoluído para incluir boas práticas de desenvolvimento e arquitetura de software.

### 🎯 Funcionalidades Principais

- 🔐 **Autenticação Segura**: Login e cadastro com hash bcrypt
- 💰 **Sistema de Investimentos**: Investimento em projetos sustentáveis
- 🪙 **Gamificação**: Sistema de tokens para recompensas
- 🛒 **Marketplace**: Resgate de prêmios com tokens acumulados
- 📊 **Dashboard**: Visualização de saldo e histórico
- 🔔 **Notificações**: Sistema de notificações de projetos

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
├── apiPortal/               # Backend PHP
│   ├── connection.php       # Conexão com banco
│   └── crud1.php           # API REST
└── growthDB.sql            # Schema do banco de dados
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- PHP 8.0+
- MySQL/MariaDB
- Ionic CLI (`npm install -g @ionic/cli`)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/growth-investimentos.git
cd growth-investimentos
```

2. **Configure o banco de dados**
```bash
# Importe o arquivo SQL
mysql -u root -p < growthDB.sql
```

3. **Configure a API**
```bash
# Edite apiPortal/connection.php com suas credenciais
$banco = 'growth';
$host = 'localhost';
$usuario = 'root';
$senha = '';
```

4. **Instale as dependências**
```bash
cd Growth
npm install
```

5. **Execute o projeto**
```bash
# Modo desenvolvimento (navegador)
ionic serve

# Modo Android
ionic capacitor run android

# Modo iOS
ionic capacitor run ios
```

## 🔑 Arquitetura e Padrões

### Autenticação
- Sistema de autenticação com JWT (planejado)
- Armazenamento seguro com LocalStorage
- Guards para proteção de rotas
- Serviço centralizado de autenticação

### Organização de Código
- **Services**: Lógica de negócio centralizada
- **Guards**: Proteção de rotas autenticadas
- **Components**: Componentes reutilizáveis
- **Pages**: Páginas da aplicação

### Boas Práticas Implementadas
- ✅ Separação de responsabilidades
- ✅ Injeção de dependências
- ✅ Observables do RxJS
- ✅ Tipagem forte com TypeScript
- ✅ Validação de formulários
- ✅ Tratamento de erros
- ✅ Loading states
- ✅ Feedback ao usuário (toasts)

## 🎨 Design e UX

- **Paleta de cores**: Verde escuro (#0B3D2E) e dourado (#A88F5F)
- **Tema**: Dark mode com elementos sustentáveis
- **Ícones**: Ionicons
- **Responsividade**: Design adaptativo para mobile

## 📊 Banco de Dados

### Principais Tabelas

- `usuarios` - Dados dos investidores
- `projetos` - Projetos sustentáveis
- `investimentos` - Relação usuário-projeto
- `tokens` - Sistema de pontuação
- `marketplace` - Itens para resgate
- `notificacoes` - Sistema de notificações

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (não MD5)
- ✅ Prepared statements (PDO)
- ✅ Validação de inputs
- ✅ Proteção contra SQL Injection
- ⚠️ CORS configurado (ajustar para produção)

## 📱 Funcionalidades Implementadas

- [x] Login e Cadastro
- [x] Autenticação persistente
- [x] Perfil de usuário
- [x] Listagem de projetos
- [x] Sistema de notificações (UI)
- [x] Marketplace (UI)
- [ ] Investimento real em projetos
- [ ] Sistema de tokens funcional
- [ ] Resgate de recompensas
- [ ] Dashboard com gráficos
- [ ] Filtros e busca de projetos

## 🎯 Roadmap Futuro

### Versão 1.1
- [ ] Sistema completo de investimentos
- [ ] Cálculo automático de tokens
- [ ] Histórico detalhado
- [ ] Notificações push

### Versão 2.0
- [ ] Integração com gateway de pagamento
- [ ] Dashboard analytics
- [ ] Sistema de chat entre investidores
- [ ] API REST documentada (Swagger)
- [ ] Testes unitários e E2E

## 👨 Feito Por:
**Junior Carvalho**

## 🙏 Agradecimentos

- Desenvolvido como projeto da disciplina de Desenvolvimento Mobile
- Inspirado em plataformas de crowdfunding sustentável
- Comunidade Ionic Brasil

---
