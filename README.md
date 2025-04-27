# Backend - Jogo Marcado

O backend do Jogo Marcado é uma aplicação desenvolvida para gerenciar as operações essenciais dos aplicativos Jogo Marcado, Jogo Marcado - ADM e Jogo Marcado - ADM WEB.

## Tecnologias Utilizadas

- Typescript: Linguagem usada para desenvolver o backend.
- Node.js: Plataforma JavaScript usada para desenvolver o backend.
- Express: Framework backend para Node.js.
- MySQL: Banco de dados relacional utilizado para armazenamento de dados.
- Sequelize: ORM (Object-Relational Mapping) para MySQL.
- JWT: JSON Web Tokens para autenticação e autorização.
- Hashids: Biblioteca para codificação de IDs.
- Bcrypt: Biblioteca para hashing de senhas.
- Hospedagem: Aplicação hospedada pela Hostinger.

## Requisitos de Sistema

- Recomendado Node.js v22 ou superior

## Instalação e Configuração

1. Clone o repositório:

- Por HTTPS:

```bash
git clone https://github.com/TriadeProduto/produto-back.git
```
- Por SSH vinculado:

```bash
git clone git@github.com:TriadeProduto/produto-back.git
```

2. Navegue até o diretório do projeto:

```bash
cd projeto-back
```

3. Entre na branch de desenvolvimento:

```bash
git checkout develop
```

4. Instale as dependências:

```bash
npm install
```

5. Configure as variáveis de ambiente criando um arquivo .env na raiz do projeto com o seguinte formato:


```env
MYSQL_USER=usuario-do-seu-mysql
MYSQL_PASSWORD=senha-do-seu-mysql
MYSQL_DATABASE=db-do-seu-mysql
MYSQL_HOST=host-do-seu-mysql
MYSQL_PORT=port-do-seu-mysql
APP_PORT=port-da-aplicacao
JWT_SECRET=senha-muito-secreta
SALT_HASHID_USER=salt-para-usuarios(string-grande-aleatoria)
SALT_HASHID_CLIENT=salt-para-clientes(string-grande-aleatoria)
SALT_HASHID_RESOURCE=salt-para-recursos(string-grande-aleatoria)
SALT_HASHID_ACTIVITIES=salt-para-atividades(string-grande-aleatoria)
SALT_HASHID_GROUPS=salt-para-grupos(string-grande-aleatoria)
SALT_HASHID_APPOINTMENTS=salt-para-marcacoes(string-grande-aleatoria)
ALPHABET_HASHID=abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!.- 
```

6. Resete o banco de dados:

```bash
npm run db:reset
```

7. Inicie a aplicação:

```bash
npm run dev
```

<details>
<summary><strong> ⚠️ **Importante**</strong></summary><br />

Sua aplicação estará rodando apenas em sua maquina, podendo acessar pelo `http://localhost:(APP_PORT localizado no arquivo .env)`. Lembre-se de atualizar a baseUrl das aplicações (geralmente localizado no arquivo `src/Service/appConnection.ts`) para `http://localhost:(APP_PORT localizado no arquivo .env)`.

- [Jogo Marcado](https://github.com/TriadeProduto/produto-front)
- [Jogo Marcado - ADM](https://github.com/TriadeProduto/produto-front-management)
- [Jogo Marcado - ADM WEB](https://github.com/TriadeProduto/produto-front-web)

Algumas funcionalidades (Acessar os aplicativos atraves de um celular real, acessar algumas funcionalidades do Google Login, etc...) não ficam disponiveis por estar usando uma URL local. Uma forma de contornar isso é utilizar o [ngrok](https://ngrok.com), ele pega a URL local e transforma em uma URL https global (*a cada inicialização do ngrok a URL base é alterada*).

⚠️ **Não se esqueça de mudar as URLs das aplicações de volta para `https://grupotriadedb.com` antes de subir para o github**

</details>
