# 💰 Controle de Finanças Pessoal

Um sistema completo e intuitivo para gerenciar suas finanças pessoais, acompanhar receitas e despesas, definir orçamentos e visualizar seu desempenho financeiro de forma clara e objetiva.

---

## ✨ Visão Geral do Projeto

Este projeto é uma aplicação web desenvolvida para ajudar indivíduos a manterem o controle de suas finanças. Com uma interface de usuário limpa e responsiva, permite o registro de transações, categorização, definição de orçamentos mensais e visualização de dados através de gráficos interativos. Conta também com um sistema de autenticação robusto e um painel administrativo para gerenciamento de usuários.

---

## 🚀 Funcionalidades Principais

O sistema oferece as seguintes funcionalidades para uma gestão financeira eficiente:

* **Autenticação de Usuário Completa:**
    * Registro de novos usuários.
    * Login seguro.
    * **Recuperação de Senha:** Fluxo completo de "Esqueceu a senha" com envio de e-mail de redefinição.
* **Gestão de Transações:**
    * Adicionar, editar e excluir receitas e despesas.
    * Detalhamento de transações com descrição, valor, tipo (receita/despesa), categoria e data.
    * Visualização de todas as transações em uma lista organizada.
* **Categorização Personalizável:**
    * Gerenciamento (adicionar, editar, excluir) de categorias para receitas e despesas.
    * Associação de transações a categorias para melhor organização.
* **Orçamentos Mensais:**
    * Definição e gerenciamento de orçamentos por categoria e por mês/ano.
    * Acompanhamento do gasto atual em relação ao limite do orçamento, com indicadores visuais de progresso (normal, alerta, perigo).
* **Resumo das Finanças:**
    * Visão geral clara do total de receitas, total de despesas e saldo geral atual.
* **Visualização de Dados com Gráficos:**
    * Gráfico de pizza (`Chart.js`) para despesas por categoria.
    * Gráfico de barras (`Chart.js`) para receitas por categoria.
    * Mensagens informativas quando não há dados para os gráficos.
* **Filtros e Ordenação de Transações:**
    * Filtragem por descrição, tipo (receita/despesa), categoria e período de datas.
    * Ordenação de transações por data ou valor (crescente/decrescente).
* **Exportação de Dados:**
    * Funcionalidade para exportar todas as transações para um arquivo CSV.
* **Modo Escuro (Dark Mode):**
    * Alternar entre tema claro e escuro para melhor conforto visual.
    * Cores ajustadas para garantir contraste e legibilidade em ambos os modos.
* **Painel Administrativo:**
    * Acesso restrito para usuários com perfil de `admin`.
    * Gerenciamento de usuários (visualizar, alterar papel para `user`/`admin`, excluir usuários).

---

## 💻 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes linguagens e bibliotecas:

* **Frontend:**
    * `HTML5`: Estrutura da aplicação.
    * `CSS3`: Estilização e responsividade (com variáveis CSS para temas).
    * `JavaScript (ES6+)`: Lógica de frontend, interatividade e consumo da API.
    * `Chart.js`: Para renderização de gráficos financeiros.
    * `Font Awesome`: Ícones diversos para a interface.
* **Backend (Node.js/Express):**
    * `Node.js`: Ambiente de execução do JavaScript no servidor.
    * `Express.js`: Framework web para construir a API RESTful.
    * `MySQL2`: Driver para conexão e interação com o banco de dados MySQL/MariaDB.
    * `bcryptjs`: Para hash e comparação segura de senhas.
    * `jsonwebtoken (JWT)`: Para autenticação baseada em tokens.
    * `nodemailer`: Para envio de e-mails (utilizado na recuperação de senha).
    * `dotenv`: Para carregar variáveis de ambiente.
* **Banco de Dados:**
    * `MySQL`: Sistema de gerenciamento de banco de dados relacional.

---

## ⚙️ Instalação e Configuração

Para configurar e rodar o projeto em sua máquina local:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Kauaog13/financas-app.git
    cd financas-app
    ```
2.  **Instale as dependências do Backend:**
    ```bash
    npm install
    ```
3.  **Configuração do Banco de Dados:**
    * Certifique-se de ter um servidor MySQL.
    * Crie um banco de dados (ex: `financas_db`).
    * Execute os scripts SQL para criar as tabelas `users`, `transactions`, `categories` e `password_reset_tokens`. (Você precisaria ter esses scripts ou o schema da base de dados).
        ```sql
        -- Exemplo de tabela users
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Exemplo de tabela categories
        CREATE TABLE categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            CONSTRAINT UQ_user_category UNIQUE (user_id, name),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Exemplo de tabela transactions
        CREATE TABLE transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            description VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            category_id INT,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        -- Exemplo de tabela password_reset_tokens
        CREATE TABLE password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        ```
4.  **Crie o arquivo `.env`:**
    * Na raiz do projeto, crie um arquivo chamado `.env`.
    * Preencha-o com suas credenciais e segredos:
        ```env
        # Variáveis para a conexão com o banco de dados
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=sua_senha_do_banco
        DB_NAME=financas_db

        # Variável para o JWT (autenticação de login/registro)
        JWT_SECRET=seu_segredo_jwt_muito_seguro_e_longo

        # Variáveis para o sistema de redefinição de senha
        JWT_RESET_SECRET=um_segredo_diferente_para_reset_tokens_bem_longo
        EMAIL_USER=seu_email_para_envio@gmail.com
        EMAIL_PASS=sua_senha_de_aplicativo_do_gmail # **OBRIGATÓRIO para Gmail**

        # URL base do seu aplicativo (usado para criar o link de redefinição no e-mail)
        BASE_URL=http://localhost:3000
        ```
    * **Importante:** Para `EMAIL_PASS` (Gmail), você precisa gerar uma [Senha de Aplicativo (App Password)](https://support.google.com/accounts/answer/185833?hl=pt-PT) nas configurações de segurança da sua Conta Google.

5.  **Inicie o Servidor:**
    ```bash
    npm start
    # Ou: node src/server.js
    ```
6.  **Acesse a Aplicação:**
    * Abra seu navegador e vá para `http://localhost:3000`.

---
