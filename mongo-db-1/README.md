# mongo-db-1

A small Express + MongoDB example that manages `Heading` lists and their `Task` items.

## Contents
- **Project:** simple list/heading + tasks API
- **Stack:** Node.js, Express, Mongoose (MongoDB)

## Prerequisites
- Node.js 14+ (or compatible)
- A running MongoDB instance or MongoDB Atlas connection string

## Install

```bash
npm install
```

## Environment
Create a `.env` file (or export env vars) with:

- `MONGO_URI` — MongoDB connection string (required)
- `PORT` — optional (defaults to `3000`)

Example:

```bash
MONGO_URI=mongodb://localhost:27017/mydb
PORT=3000
```

## Run

```bash
node index.js
```

The server will start on the configured `PORT`.

## API Overview

Base path used in the repo is `/api` (see route mounting in [index.js](index.js)). Below are the available endpoints and expected behaviour (handlers live in [controller/controller.js](controller/controller.js)).

- GET  /api/                             — Health placeholder (`getAllEntitys`)

Headings:
- POST /api/headings                    — Create a heading. Body: `{ title, summary? }`
- GET  /api/headings                    — List headings (lightweight fields)
- GET  /api/headings/:id                — Get heading by id (populates `tasks`)
- PUT  /api/headings/:id                — Update heading fields
- DELETE /api/headings/:id              — Delete heading and cascade-delete tasks

Tasks:
- POST /api/headings/:headingId/tasks   — Create a task under a heading. Body: `{ title, description?, dueDate?, priority? }`
- GET  /api/headings/:headingId/tasks   — List tasks for a heading
- GET  /api/tasks/:id                   — Get single task (populates `heading`)
- PUT  /api/tasks/:id                   — Update task fields
- DELETE /api/tasks/:id                 — Delete task (also removes reference from parent heading)

Examples (curl):

Create heading:

```bash
curl -X POST http://localhost:3000/api/headings \
  -H "Content-Type: application/json" \
  -d '{"title":"Groceries","summary":"Weekly list"}'
```

Create task under a heading:

```bash
curl -X POST http://localhost:3000/api/headings/<HEADING_ID>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","priority":"medium"}'
```

## Data Models
See schema files for exact fields:
- [schema/heading.js](schema/heading.js) — `Heading` with fields: `title`, `summary`, `tasks` (array of Task ObjectIds), timestamps.
- [schema/task.js](schema/task.js) — `Task` with fields: `heading` (ref), `title`, `description`, `completed`, `dueDate`, `priority` (low|medium|high), timestamps.

## Project Structure

- [index.js](index.js) — app entry (server + route mounting)
- [connection/db-connection.js](connection/db-connection.js) — MongoDB connection helper
- [routes/route.js](routes/route.js) — Express routes
- [controller/controller.js](controller/controller.js) — heading request handlers
- [controller/taskController.js](controller/taskController.js) — task request handlers
- [schema/heading.js](schema/heading.js), [schema/task.js](schema/task.js) — Mongoose models

## Notes
- Error handling is basic and returns `500` with the error message on unexpected failures.
- Deleting a `Heading` cascades and deletes its `Task` documents to avoid orphaned tasks (see `deleteHeading` in [controller/controller.js](controller/controller.js)).
