# TrancAi API

API backend do projeto **TrancAi** — sistema de fechaduras inteligentes (IoT).

API REST + Gateway WebSocket para controle de fechaduras. Suporta autenticação JWT,
controle de acesso por pivot (`doorLockUser`), notificações em tempo real via Socket.IO
e dashboard de estatísticas com geração de relatório em PDF.

---

## Visão geral

- **Autenticação:** JWT via `POST /auth/login` e `GET /auth/profile`.
- **Recursos principais:**
  - `users` — CRUD de usuários
  - `door-locks` — CRUD de fechaduras (quem cria vira owner)
  - `door-lock-user` — pivot que relaciona usuários e fechaduras (papel, status, datas)
  - `door-lock-events` — histórico de eventos (abertura/fechamento) de cada fechadura
- **Tempo real:** `DoorLocksGateway` (Socket.IO) emite `door-lock-updated` e `door-lock-removed`
  para os clientes conectados na room `lock:{id}`. O front escuta esses eventos e atualiza a UI sozinho.
- **Dashboard:** 5 endpoints de estatísticas + endpoint de seeder para demonstração + relatório PDF
  gerado no front a partir dos dados.
- **IoT:** firmware ESP32 (em outro repositório `iot/elock_esp32`) que lê cartões RFID,
  controla um servo motor e se comunica com a API por HTTP polling + PUT.

## Tecnologias

- Node.js 18+
- NestJS v11
- Sequelize + sequelize-typescript
- PostgreSQL 13
- JWT (`@nestjs/jwt`)
- Socket.IO (`@nestjs/websockets`, `socket.io`, `@nestjs/platform-socket.io`)
- Swagger (`@nestjs/swagger`) — disponível em `/api`

## Estrutura

```
src/
├── main.ts                 # bootstrap + CORS + Swagger
├── migrations/             # migrations do sequelize-cli
└── app/
    ├── app.module.ts
    ├── config/             # config do Sequelize / migrations
    └── modules/
        ├── auth/           # login, JWT, strategy, guard
        ├── users/          # CRUD de usuários
        ├── doorLocks/      # CRUD + gateway WS + statistics service
        ├── doorLockUsers/  # pivot user-fechadura (papel/permissão)
        └── doorLockEvents/ # histórico de eventos para o dashboard
```

## Variáveis de ambiente

Exemplo de `.env` (na raiz do projeto):

```env
NODE_ENV=development
APP_PORT=8000
JWT_SECRET=algum_segredo_forte

DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=inlock-2024
DB_DATABASE=inlock
```

> Quando usar Docker Compose, o `DB_HOST` é o **nome do serviço** (`db`).
> Se for rodar o app fora do compose com o banco em Docker, use `DB_HOST=127.0.0.1`.

## Como rodar (Docker — recomendado)

Tudo configurado para subir back + banco juntos:

```powershell
docker compose up -d --build
```

Aguarde uns segundos e rode as migrations:

```powershell
docker compose exec app npm run migrate
```

Pronto. API em `http://localhost:8000`, Swagger em `http://localhost:8000/api`.

**Comandos do dia a dia:**

```powershell
docker compose start                # liga (sem rebuildar)
docker compose stop                 # desliga sem perder dados
docker compose logs -f app          # acompanha logs da API
docker compose exec app npm run migrate         # roda migrations
docker compose exec app npm run migrate:undo    # desfaz todas as migrations
```

## Como rodar (local, sem Docker)

```powershell
npm install
npm run migrate
npm run start:dev
```

Requer Postgres rodando localmente com as credenciais do `.env`.

## Endpoints principais

### Auth
- `POST /auth/login` — devolve `{ access_token }`
- `GET /auth/profile` — dados do usuário autenticado

### Users
- `GET /users` — listar (protegido)
- `POST /users` — criar (registro público)
- `GET /users/:id` — obter
- `PUT /users/:id` — atualizar
- `DELETE /users/:id` — remover

### Door Locks
- `GET /door-locks` — lista as fechaduras do usuário autenticado (owner + compartilhadas)
- `GET /door-locks/:id` — obter uma fechadura (verifica acesso)
- `POST /door-locks` — criar (quem cria vira owner)
- `PUT /door-locks/:id` — atualizar (grava evento automaticamente se status mudar)
- `DELETE /door-locks/:id` — remover

### Door Lock Users (pivot)
- `GET /door-lock-user`
- `POST /door-lock-user`
- `PUT /door-lock-user/:id`
- `DELETE /door-lock-user/:id`

### Estatísticas / Dashboard
- `GET /door-locks/statistics/overview` — totais (4 cards do dashboard)
- `GET /door-locks/statistics/usage-timeline` — aberturas/fechamentos por dia (7 dias)
- `GET /door-locks/statistics/most-used` — top fechaduras mais usadas
- `GET /door-locks/statistics/status-distribution` — ativas vs inativas
- `GET /door-locks/statistics/recent-activity` — últimos 20 eventos
- `GET /door-locks/statistics/full-report` — pacote completo (usado pelo PDF)
- `POST /door-locks/statistics/seed-demo` — popula eventos fake nos últimos 7 dias
- `DELETE /door-locks/statistics/seed-demo` — remove **apenas** os eventos fake (preserva os reais)

> Todas as rotas de estatística são filtradas pelas fechaduras do usuário autenticado.

## WebSocket (Socket.IO)

Implementado em `src/app/modules/doorLocks/door-locks.gateway.ts`. Para conectar, envie o token JWT
no handshake:

```js
const socket = io('http://localhost:8000', {
  auth: { token: '<JWT>' },
  transports: ['websocket'],
});
```

**Eventos cliente → servidor:**
- `join-lock` `{ lockId }` — entra na room da fechadura (após validar acesso no pivot)
- `leave-lock` `{ lockId }` — sai da room
- `toggle-lock` `{ lockId, status }` — alterna status; o servidor persiste no banco + emite broadcast

**Eventos servidor → cliente:**
- `door-lock-updated` `{ id, name, localization, status }`
- `door-lock-removed` `{ id }`
- `joined-lock` `{ lockId }`
- `error` `{ message }`

## Eventos da fechadura

Toda vez que o status de uma fechadura muda (via `PUT /door-locks/:id` ou via `toggle-lock` no socket),
um registro é criado em `doorLockEvents` com:

- `doorLockId`
- `userId` (quem disparou; pode ser `null` para eventos vindos de IoT/RFID sem auth)
- `action` — `OPEN` ou `CLOSE`
- `source` — `APP` (clique no front), `RFID` (cartão no leitor), `API` (PUT direto), `SEED` (gerado pelo seeder)
- `createdAt`

Esse histórico é o que alimenta todos os gráficos e a tabela "Atividades Recentes" do dashboard.

## Migrations

```powershell
npm run migrate                    # aplica todas as migrations pendentes
npm run migrate:undo               # desfaz todas
npm run migration:generate         # gera nova migration vazia
```

Tabelas atuais:
- `users`
- `doorLocks`
- `doorLockUsers` (pivot)
- `doorLockEvents` (histórico para o dashboard)

## Integração com o ESP32 (IoT)

O firmware do dispositivo (ESP32 + RFID RC522 + servo motor) faz dois fluxos:

1. **Cartão → fechadura:** ao detectar UID autorizado, manda `PUT /door-locks/:id` com `{ "status": "on" }`.
   O back grava o evento e dispara `door-lock-updated` via WebSocket, e o app atualiza em tempo real.
2. **App → fechadura:** quando o usuário clica no app, o front emite `toggle-lock` via socket.
   O ESP32, em polling de 2s, detecta a mudança no `GET /door-locks/:id` e gira o servo.

Para autenticar, o ESP usa um usuário dedicado (`esp32@elock.com`) com um JWT de longa duração (30 dias).

## Segurança

- Todas as rotas sensíveis estão protegidas com `JwtAuthGuard`.
- Tokens JWT são assinados com `JWT_SECRET` do `.env`.
- O gateway WebSocket valida o token no handshake e a permissão de cada `join-lock`
  consultando o pivot `doorLockUser`.

## Troubleshooting

- **API não sobe (`Cannot read properties of undefined`)** — confira se rodou as migrations
  (`docker compose exec app npm run migrate`).
- **Front não conecta no socket** — confira `JWT_SECRET` do back e que o token enviado no
  handshake foi gerado pela mesma instância.
- **ESP32 não fala com a API** — libere a porta 8000 no firewall do Windows (regra inbound TCP)
  e use o IP da máquina na rede WiFi, não `localhost`.

## Contribuição

Faça branch, abra PR e mantenha o padrão de commits semânticos:
`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

Sempre que alterar modelos, atualize a migration correspondente em `src/migrations/`.

---

Projeto Interdisciplinar — DSM 4º semestre 2026/1 — Fatec Franca.
