# TrancAi — Sistema de Fechaduras Inteligentes (IoT)

Projeto Interdisciplinar do **4º semestre de DSM 2026/1 — Fatec Franca**.

Grupo 04: Miguel Luperi Victoriano Soares, Gabriel Antônio Ferrarez, Arthur Cesar Marcelino.

---

## O que é

Sistema completo de gerenciamento de fechaduras inteligentes, composto por:

- **Backend** (NestJS + PostgreSQL): API REST com WebSocket para tempo real
- **Frontend** (React + Vite + Tailwind + MUI): aplicação web com dashboard e relatórios em PDF
- **IoT** (ESP32 + RFID RC522 + servo motor): firmware que lê cartões e controla a fechadura física

Os 3 componentes se comunicam por HTTP REST + WebSocket (Socket.IO).

## Estrutura do repositório

```
DSM-P4-G04-2026-01/
├── backend/              # API NestJS + PostgreSQL (Docker)
├── frontend/             # Site React/Vite
├── docker-compose.yml    # sobe back + banco juntos
├── .env.example          # template de variaveis de ambiente
└── README.md             # este arquivo
```

> O firmware do ESP32 fica em um diretorio separado (`iot/elock_esp32/elock_esp32.ino` no PC do dev) e nao precisa estar no repo Git porque e gravado direto no microcontrolador.

## Como rodar (resumo)

### 1. Pre-requisitos
- Docker Desktop
- Node.js 18+
- (Para IoT) Arduino IDE 2.x + driver CP210x

### 2. Variaveis de ambiente
Copie `.env.example` para `.env` na raiz do projeto:

```powershell
cp .env.example .env
```

### 3. Backend + Banco (Docker)

```powershell
docker compose up -d --build
docker compose exec app npm run migrate
```

API em `http://localhost:8000`, Swagger em `http://localhost:8000/api`.

### 4. Frontend

```powershell
cd frontend
cp .env.example .env
npm install
npm run dev
```

App em `http://localhost:3001`.

### 5. ESP32 (opcional)
Veja `backend/README.md` secao "Integracao com o ESP32".

## Documentacao detalhada

- [backend/README.md](backend/README.md) — endpoints, modelos, WebSocket, troubleshooting
- [COMO_RODAR.txt](COMO_RODAR.txt) — passo a passo completo do zero (para o grupo)

## Usuarios de teste

| Tipo | Email | Senha |
|---|---|---|
| Admin | `admin@elock.com` | `123456` |
| ESP32 (dispositivo IoT) | `esp32@elock.com` | `esp32-demo-2026` |

## Funcionalidades principais

- Login com JWT
- CRUD de fechaduras
- Compartilhamento de acesso entre usuarios (pivot doorLockUser)
- Tempo real via WebSocket (status atualiza no app sem refresh)
- Controle por cartao RFID (ESP32)
- Dashboard de estatisticas com 5 graficos
- Relatorio em PDF baixavel
- Seeder de dados de demonstracao (preserva eventos reais)

## Licenca

Projeto academico — uso restrito a fins educacionais.
