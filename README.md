
# elock-api

API backend do projeto Elock — gerenciamento de fechaduras conectadas.

Resumo rápido: API REST + Gateway WebSocket para gerenciamento e controle de fechaduras. Suporta autenticação JWT, controle de acesso por pivot (doorLockUser) e notificações em tempo quase real via Socket.IO.

Este repositório contém a API REST (NestJS + Sequelize) responsável por autenticação JWT, gerenciamento de usuários, fechaduras (door-locks) e vínculo de acessos (door-lock-user). Também contém um Gateway WebSocket (Socket.IO) para notificações em tempo quase real de atualização de status das fechaduras.

Conteúdo deste README:
- Visão geral e arquitetura
- Tecnologias usadas
- Como rodar localmente (comandos) e variáveis de ambiente
- Docker / docker-compose
- Migrações e seeds
- WebSocket (Gateway) — como funciona e como testar
- Endpoints principais
- Troubleshooting e dicas

--

## Visão geral

- Autenticação: JWT via `POST /auth/login` e `GET /auth/profile`.
- Recursos principais:
  - `users` — CRUD de usuários
  - `door-locks` — CRUD de fechaduras (cada criação registra owner no pivot)
  - `door-lock-user` — pivot que relaciona usuários e fechaduras (papel, status, datas)
- Tempo quase real: `DoorLocksGateway` (Socket.IO) emite `door-lock-updated` e `door-lock-removed` para clientes conectados que tenham acesso.

## Tecnologias

- Node.js (recomenda-se v18+)
- NestJS v11
- Sequelize + sequelize-typescript
- PostgreSQL (docker-compose oferece serviço)
- JWT (`@nestjs/jwt`) para autenticação
- Socket.IO (`@nestjs/websockets`, `socket.io`, `@nestjs/platform-socket.io`)

## Estrutura importante do projeto

- `src/app/modules/auth` — autenticação, estratégia JWT.
- `src/app/modules/users` — model, controller e service de usuários.
- `src/app/modules/doorLocks` — controller/service/model/DTOs das fechaduras e o `door-locks.gateway.ts`.
- `src/app/modules/doorLockUsers` — pivot (doorLockUser) e serviço para compartilhar/revogar acessos.
- `src/app/config` — configuração do Sequelize/migrations.

## Requisitos locais

- Docker e Docker Compose (opcional, para banco de dados)
- Node.js 18+ e npm

## Variáveis de ambiente

Crie um arquivo `.env` na raiz ou ajuste seu ambiente. Exemplo mínimo (substitua por valores reais):

```env
APP_PORT=8000
JWT_SECRET=algum_segredo_forte
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=franon-2025
DB_DATABASE=franon
```

Observações:
- `JWT_SECRET` é usado pelo `JwtModule` para assinar tokens.
- Se usar docker-compose, as credenciais do serviço Postgres podem já estar no `docker-compose.yml`.

## Instalação e execução (local)

1. Instale dependências:

```powershell
cd c:\Projetos\Elock\elock-api
npm install
```

2. Inicie o banco (opcional usando docker-compose — ver seção Docker abaixo) ou certifique-se de que o Postgres está disponível.

3. Rode migrações (cria tabelas):

```powershell
npm run migrate
# ou para desfazer todas:
npm run migrate:undo
```

4. Inicie em modo de desenvolvimento:

```powershell
npm run start:dev
```

5. Endpoints do Swagger (se habilitado) normalmente estarão disponíveis em `/api` ou conforme configuração do projeto.

## Docker (usar postgres via Docker Compose)

Se preferir rodar o banco via Docker, há um `docker-compose.yml` no repositório. Exemplo padrão de uso:

```powershell
cd c:\Projetos\Elock\elock-api
docker-compose up -d
# aguarde o postgres subir
npm run migrate
npm run start:dev
```

Observações:
- Se o `DB_HOST` no `.env` for `localhost` e você estiver rodando o app localmente com o DB em Docker, use `DB_HOST=127.0.0.1` ou ajuste conforme rede do Docker no Windows/WSL.

## Migrations

O projeto usa `sequelize-cli` com scripts expostos no `package.json`:

- `npm run migrate` — executa migrations em `src/migrations`
- `npm run migrate:undo` — desfaz todas
- `npm run migration:generate` — helper para gerar nova migration

As migrations existentes já criam as tabelas `users`, `doorLocks`, `doorLockUsers` (pivot) etc.

## WebSocket (Socket.IO) — como funciona

- Implementado em `src/app/modules/doorLocks/door-locks.gateway.ts`.
- O gateway aceita conexão handshake com JWT (envia token no `auth` do cliente). Ele valida token no `handleConnection` e associa `socket` ao `userId`.
- Comandos suportados (atualmente):
  - `join-lock` — cliente solicita entrar na room `lock:{id}` (gateway valida se o usuário tem vínculo pivot com a fechadura).
  - `leave-lock` — cliente sai do room.
  - O gateway expõe métodos `emitDoorLockUpdated(lock)` e `emitDoorLockRemoved(id)` que emitem eventos `door-lock-updated` e `door-lock-removed` respectivamente para a room `lock:{id}`.

Recomendações de uso:
- No app móvel (React Native) usar `socket.io-client` e no handshake enviar `{ auth: { token } }`.
- Use rooms (`lock:{id}` e/ou `user:{id}`) em vez de broadcast global para evitar vazamento de eventos.

## API — endpoints principais (resumo)

- Auth
  - POST `/auth/login` — realiza login, retorna `{ access_token }`.
  - GET `/auth/profile` — retorna dados do usuário autenticado.

- Users
  - GET `/users` — listar usuários (protegido)
  - POST `/users` — criar usuário
  - GET `/users/:id` — obter usuário

- Door Locks
  - GET `/door-locks` — lista fechaduras do usuário autenticado (owner ou compartilhadas)
  - GET `/door-locks/:id` — obter fechadura (verifica acesso do usuário)
  - POST `/door-locks` — criar fechadura (usuário que cria vira owner)
  - PUT `/door-locks/:id` — atualizar (recomendado checar papel/authorization)
  - DELETE `/door-locks/:id` — remover (recomendado checar papel/authorization)

- Door Lock Users (pivot)
  - GET `/door-lock-user` — listar vínculos
  - POST `/door-lock-user` — criar compartilhamento
  - PUT `/door-lock-user/:id` — atualizar vínculo
  - DELETE `/door-lock-user/:id` — revogar vínculo

Consulte os arquivos `src/app/modules/*/*.controller.ts` para ver rotas e validações exatas.

## Exemplos de uso (curl / Node)

Substitua `<HOST>` por `http://localhost:8000` (ou seu host), e `<TOKEN>` pelo `access_token` recebido no login.

- Login (obter token):

```bash
curl -X POST <HOST>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suaSenha"}'
```

Resposta esperada:
```json
{ "access_token": "<TOKEN>" }
```

- Obter perfil (usar token):

```bash
curl -H "Authorization: Bearer <TOKEN>" <HOST>/auth/profile
```

- Listar fechaduras do usuário autenticado:

```bash
curl -H "Authorization: Bearer <TOKEN>" <HOST>/door-locks
```

- Buscar uma fechadura por id:

```bash
curl -H "Authorization: Bearer <TOKEN>" <HOST>/door-locks/1
```

- Criar uma nova fechadura (o usuário autenticado vira owner):

```bash
curl -X POST <HOST>/door-locks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Fechadura Sala","localization":"Escritório","status":"locked"}'
```

- Atualizar status (exemplo de endpoint que altera e emite evento WebSocket):

```bash
curl -X PUT <HOST>/door-locks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status":"unlocked"}'
```

- Compartilhar acesso (criar pivot door-lock-user):

```bash
curl -X POST <HOST>/door-lock-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"userId":2,"doorLockId":1,"paper":"guest","status":"active"}'
```

- Revogar acesso:

```bash
curl -X DELETE <HOST>/door-lock-user/10 \
  -H "Authorization: Bearer <TOKEN>"
```

- Testar WebSocket (Node.js + socket.io-client):

Crie `test-socket.js` com o seguinte conteúdo e rode `node test-socket.js`:

```js
const { io } = require('socket.io-client');
const HOST = '<HOST>';
const TOKEN = '<TOKEN>';
const LOCK_ID = 1;

const socket = io(HOST, { auth: { token: TOKEN }, transports: ['websocket'] });

socket.on('connect', () => {
  console.log('connected', socket.id);
  socket.emit('join-lock', { lockId: LOCK_ID });
});

socket.on('joined-lock', (d) => console.log('joined', d));
socket.on('door-lock-updated', (p) => console.log('door-lock-updated', p));
socket.on('door-lock-removed', (p) => console.log('door-lock-removed', p));
socket.on('disconnect', () => console.log('disconnected'));
```

Esses exemplos cobrem os fluxos mais comuns e ajudam a testar a integração entre API, WebSocket e client.

## Segurança e autorização

- Todas as rotas sensíveis usam `JwtAuthGuard` no controller.
- Recomendo validar papel (`paper`) do pivot antes de permitir operações como `update` e `delete` em fechaduras (ex.: apenas `owner` pode deletar).
- O gateway WebSocket valida o token no handshake e valida `join-lock` consultando o pivot `doorLockUser`.

## Testes

- `npm run test` — testes unitários (se houver).
- `npm run test:e2e` — testes end-to-end.

## Troubleshooting (erros comuns)

- Erro: "No driver (WebSockets) has been selected" — Instale o adaptador do Nest para Socket.IO:
  ```powershell
  npm install @nestjs/platform-socket.io socket.io
  ```

- Erro: conexões do socket não autenticam — verifique se o client envia `{ auth: { token } }` no handshake e se `JWT_SECRET` do servidor confere com o que gerou o token.

- Problema de asset/Expo ao desenvolver o app mobile — ajuste `app.json` do app ou forneça os arquivos de imagem necessários.

## Boas práticas / próximos passos

- Adicionar checagens de autorização por papel (`owner` vs `admin` vs `guest`) para `update`/`delete` de fechaduras.
- Implementar `socket.io-redis` adapter se for rodar múltiplas instâncias de API.
- Para integração com dispositivos IoT, considere um namespace/adapter separado (`/iot`) e tokens/credentials dedicados para dispositivos.

## Contribuição

- Faça forks e PRs; mantenha estilo consistente com o código existente.
- Atualize migrations em `src/migrations` ao alterar models.

---
Arquivo gerado/atualizado pelo assistente — revise as seções de variáveis sensíveis e ajuste `DB`/`JWT_SECRET` para o ambiente.
