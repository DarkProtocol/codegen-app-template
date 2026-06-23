# Codegen App Template

A template / skeleton for building an **LLM-powered code-generation application** — an app that turns
natural-language input into code according to its own ruleset. Use it as the starting point for a new
codegen project: clone it, set your domain, and build on top of the admin UI + API that ship with it.

It's a monorepo with two apps plus local infrastructure:

| Part                | Stack                                                               | Path                 |
| ------------------- | ------------------------------------------------------------------- | -------------------- |
| Admin frontend      | Next.js 16, React 19, TypeScript, Mantine v9, RTK Query, next-intl  | `admin-frontend/`    |
| Backend (admin API) | Yii3, PHP 8.2+ — PostgreSQL, Redis, JWT auth, object storage        | `backend/`           |
| Local infra         | Traefik, PostgreSQL, Redis, RabbitMQ                                | `docker-compose.yml` |

## Setup

Prerequisites: Docker, Node 20+, and (optional) Python 3.10+ for [Graphify](#code-search).

1. **Choose your domain.** The template uses `app.test` as a placeholder. Replace it with your domain
   in every place listed in the **Domains** table of [AGENTS.md](AGENTS.md), then add the hosts to
   `/etc/hosts`:

   ```
   127.0.0.1 admin.app.test admin-api.app.test
   ```

2. **Create env files:**

   ```sh
   cp admin-frontend/.env.example admin-frontend/.env
   cp backend/.env.example backend/.env
   ```

   Set `ADMIN_AUTH_JWT_SECRET` in `backend/.env` to a random 32-byte secret.

3. **Backend + infra** (from `backend/`):

   - `make up` — build & start the backend, PostgreSQL, Redis, queue, and Traefik
   - `make composer install` — install PHP deps (dev mounts the source over the image)
   - run DB migrations and create an admin user via `make yii <command>` — see [backend/AGENTS.md](backend/AGENTS.md)

4. **Frontend** (from `admin-frontend/`):

   ```sh
   npm install
   npm run dev          # serves http://admin.app.test:3000
   ```

Then open `http://admin.app.test:3000`.

## Code search

This repo uses **Graphify**, a queryable code knowledge graph. Install once
(`pip install graphifyy && graphify install`) and build the graph with `/graphify .`. Prefer querying
it over raw grep for "where / how is X" questions. Details in [AGENTS.md](AGENTS.md).

## Working with AI agents

Rules for coding agents live in **[AGENTS.md](AGENTS.md)** (the cross-tool standard; `CLAUDE.md`
points to it). Each app has its own `AGENTS.md` with stack-specific rules and conventions; the
frontend also bundles a Next.js architecture skill. Read the relevant `AGENTS.md` before changing
code.

## Docs

- [AGENTS.md](AGENTS.md) — repo-wide rules: conventions, domains, first-run setup, code search
- [admin-frontend/AGENTS.md](admin-frontend/AGENTS.md) — frontend rules + architecture skill
- [backend/AGENTS.md](backend/AGENTS.md) — backend rules + architecture
