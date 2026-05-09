# Riverside — Startup Guide

Get the app running locally in a few minutes. Backend (Express + Prisma), Postgres in Docker, and the Vite frontend.

## Prerequisites

- Node.js 18+ and npm 8+
- Docker Desktop (running)
- Git

## 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Start Postgres (Docker)

A `docker-compose.yml` lives in `backend/` and runs `postgres:16-alpine` on port `5432` with a named volume so data survives restarts.

```bash
cd backend
docker compose up -d
```

Verify it's healthy:

```bash
docker compose ps
```

The connection string is already wired into `backend/.env`:

```
DATABASE_URL="postgresql://riverside:riverside@localhost:5432/riverside?schema=public"
```

## 3. Run Prisma migrations

From `backend/`:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates the schema (User, Session, SessionMember, Project, Recording) in your local DB and generates the Prisma client.

## 4. Start the backend

```bash
cd backend
npm run dev
```

API runs on http://localhost:5000.

## 5. Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Vite prints a URL (default http://localhost:5173). Open it in the browser. API calls under `/api` are proxied to the backend.

## Useful commands

| Command | What it does |
|---------|--------------|
| `docker compose up -d` (in `backend/`) | Start the Postgres container |
| `docker compose down` | Stop the container (volume preserved) |
| `docker compose down -v` | Stop and **delete** all DB data |
| `npx prisma studio` (in `backend/`) | Open Prisma's DB browser |
| `npx prisma migrate reset` | Drop the DB and re-run all migrations |

## Troubleshooting

**`P1001: Can't reach database server`** — Docker isn't running, or the container hasn't started. Run `docker compose ps` to check; if it's not listed, `docker compose up -d`.

**Port 5432 already in use** — You have another Postgres running locally. Either stop it, or change the host port in `backend/docker-compose.yml` (e.g. `"5433:5432"`) and update `DATABASE_URL` to match.

**Migration conflict on first run** — The repo ships with no committed migrations; `prisma migrate dev --name init` should create one fresh. If you see drift errors, run `npx prisma migrate reset` (destroys local data only).

**Camera/mic permissions** — The browser only grants these on `localhost` or `https://`. Stick to the Vite URL during dev.

**Frontend can't reach the API** — Check that the backend is on port 5000 and that you're hitting paths under `/api` (Vite's dev proxy only forwards that prefix).
